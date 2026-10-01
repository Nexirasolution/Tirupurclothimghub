import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import Combo from '@/models/Combo';

// POST /api/cart/validate-stock
// body: { items: [{ productId, variantId, size, qty, name, isCombo, comboId,
//                   packKey, packDetails, sleeveType, zipType, pantOption, shawlOption }] }
//
// Re-checks each cart line against the live database and reports lines that
// are unavailable, out of stock, or short on quantity. Handles three kinds:
//   - normal product lines (variant/size + pant/shawl add-on stock)
//   - multi-product combo lines
//   - color-pack combo lines (pack stock + per-color stock)
//
// Every issue echoes the fields cartKey() uses, so the checkout page can
// find the exact cart line to remove or adjust.

function lineRef(item) {
  return {
    productId: item.productId,
    variantId: item.variantId,
    size: item.size,
    comboId: item.comboId,
    packKey: item.packKey,
    sleeveType: item.sleeveType,
    zipType: item.zipType,
    pantOption: item.pantOption,
    shawlOption: item.shawlOption,
    name: item.name,
  };
}

function makeIssue(item, reason, availableStock = 0) {
  return { ...lineRef(item), reason, availableStock };
}

// Turns a list of stock caps into an issue (or null if the line is fine).
function checkCaps(item, caps) {
  const finite = caps.filter((c) => Number.isFinite(c));
  if (finite.length === 0) return null; // nothing limits this line
  const available = Math.max(0, Math.min(...finite));
  if (available <= 0) return makeIssue(item, 'out_of_stock', 0);
  if (item.qty > available) return makeIssue(item, 'insufficient_stock', available);
  return null;
}

function findVariant(product, { variantId, colorName }) {
  if (!product) return null;
  return (
    product.variants?.find((v) => String(v._id) === String(variantId)) ||
    product.variants?.find(
      (v) => v.color?.toLowerCase().trim() === String(colorName || '').toLowerCase().trim()
    ) ||
    null
  );
}

export async function POST(req) {
  await dbConnect();
  const body = await req.json().catch(() => ({}));
  const items = Array.isArray(body.items) ? body.items : [];

  if (items.length === 0) {
    return NextResponse.json({ valid: true, issues: [] });
  }

  // ── Load combos, then every product we need in one query ──
  const comboIds = [...new Set(items.filter((i) => i.isCombo && i.comboId).map((i) => String(i.comboId)))];
  const combos = comboIds.length ? await Combo.find({ _id: { $in: comboIds } }).lean() : [];
  const comboMap = new Map(combos.map((c) => [String(c._id), c]));

  const productIdSet = new Set();
  items.forEach((i) => {
    if (!i.isCombo && i.productId) productIdSet.add(String(i.productId));
  });
  combos.forEach((c) => {
    if (c.baseProduct) productIdSet.add(String(c.baseProduct));
    (c.products || []).forEach((p) => p.product && productIdSet.add(String(p.product)));
  });

  const products = productIdSet.size
    ? await Product.find({ _id: { $in: [...productIdSet] } }).lean()
    : [];
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const issues = [];

  for (const item of items) {
    // ───────────── Combo lines ─────────────
    if (item.isCombo) {
      const combo = comboMap.get(String(item.comboId));
      if (!combo || !combo.isActive) {
        issues.push(makeIssue(item, 'unavailable'));
        continue;
      }

      // Multi-product bundle
      if (combo.type !== 'color-pack') {
        let broken = false;
        const caps = [];

        for (const entry of combo.products || []) {
          const p = productMap.get(String(entry.product));
          if (!p || !p.isActive) {
            broken = true;
            break;
          }
          // Only check stock when the admin pinned a specific variant + size
          if (entry.variantId && entry.size) {
            const variant = findVariant(p, { variantId: entry.variantId });
            const sizeEntry = variant?.sizes?.find((s) => s.size === entry.size);
            caps.push(sizeEntry?.stock || 0);
          }
        }

        if (broken) {
          issues.push(makeIssue(item, 'unavailable'));
          continue;
        }
        const issue = checkCaps(item, caps);
        if (issue) issues.push(issue);
        continue;
      }

      // Color pack
      const packSize = Number(item.packDetails?.packSize);
      const pack = (combo.packOptions || []).find((p) => Number(p.size) === packSize);
      const colorsPicked = item.packDetails?.colors || [];
      const pickedTotal = colorsPicked.reduce((s, c) => s + (Number(c.qty) || 0), 0);

      // Pack size gone, or the color mix doesn't add up to the pack
      if (!pack || colorsPicked.length === 0 || pickedTotal !== packSize) {
        issues.push(makeIssue(item, 'unavailable'));
        continue;
      }

      const baseProduct = productMap.get(String(combo.baseProduct));
      if (!baseProduct || !baseProduct.isActive) {
        issues.push(makeIssue(item, 'unavailable'));
        continue;
      }

      const caps = [];
      // How many packs the pack option itself can still sell (null = unlimited)
      if (pack.stock != null) caps.push(pack.stock);

      let unavailable = false;
      for (const picked of colorsPicked) {
        const colorOpt = (combo.colors || []).find((c) => c.name === picked.name);
        if (!colorOpt) {
          unavailable = true;
          break;
        }

        // Same rule as the storefront: admin-set color stock wins,
        // live variant/size stock is the fallback.
        let colorStock;
        if (colorOpt.stock != null) {
          colorStock = colorOpt.stock;
        } else {
          const variant = findVariant(baseProduct, {
            variantId: colorOpt.variantId,
            colorName: colorOpt.name,
          });
          const sizeEntry = variant?.sizes?.find((s) => s.size === item.size);
          colorStock = sizeEntry?.stock || 0;
        }

        // Each pack uses `picked.qty` of this color, so packs sellable = floor(stock / picked.qty)
        const perPack = Number(picked.qty) || 1;
        caps.push(Math.floor(colorStock / perPack));
      }

      if (unavailable) {
        issues.push(makeIssue(item, 'unavailable'));
        continue;
      }
      const issue = checkCaps(item, caps);
      if (issue) issues.push(issue);
      continue;
    }

    // ───────────── Normal product lines ─────────────
    const product = productMap.get(String(item.productId));

    if (!product || !product.isActive) {
      issues.push(makeIssue(item, 'unavailable'));
      continue;
    }

    const variant = product.variants.find((v) => String(v._id) === String(item.variantId));
    if (!variant) {
      issues.push(makeIssue(item, 'unavailable'));
      continue;
    }

    const sizeEntry = variant.sizes.find((s) => s.size === item.size);
    const caps = [sizeEntry?.stock || 0];
    let addonUnavailable = false;

    if (item.pantOption?.id) {
      const pant = product.pantOptions?.find((p) => String(p._id) === String(item.pantOption.id));
      if (!pant) addonUnavailable = true;
      else caps.push(pant.stock || 0);
    }

    if (item.shawlOption?.id) {
      const shawl = product.shawlOptions?.find((s) => String(s._id) === String(item.shawlOption.id));
      if (!shawl) addonUnavailable = true;
      else caps.push(shawl.stock || 0);
    }

    if (addonUnavailable) {
      issues.push(makeIssue(item, 'unavailable'));
      continue;
    }

    const issue = checkCaps(item, caps);
    if (issue) issues.push(issue);
  }

  return NextResponse.json({ valid: issues.length === 0, issues });
}