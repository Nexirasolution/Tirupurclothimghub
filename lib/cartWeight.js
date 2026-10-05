import Product from '@/models/Product';
import Combo from '@/models/Combo';
import { productWeight, comboWeightGrams } from '@/lib/weight';

// Computes total cart weight from the DATABASE (never trust client weights).
// Products AND combos use the same rule:
//   manual weight if set (> 0), else pieces x global weightPerPiece.
//
// items: cart lines { productId, comboId, isCombo, qty, packDetails }
// weightPerPiece: global fallback (grams) from Settings
export async function computeCartWeight(items = [], weightPerPiece = 0) {
  const isComboLine = (i) => i.isCombo || i.comboId;

  const productIds = [
    ...new Set(items.filter((i) => !isComboLine(i) && i.productId).map((i) => String(i.productId))),
  ];
  const comboIds = [
    ...new Set(items.filter((i) => isComboLine(i) && i.comboId).map((i) => String(i.comboId))),
  ];

  const [products, combos] = await Promise.all([
    productIds.length ? Product.find({ _id: { $in: productIds } }).select('weight').lean() : [],
    comboIds.length
      ? Combo.find({ _id: { $in: comboIds } })
          .select('type weight pieceWeight piecesPerCombo products baseProduct')
          .populate('products.product', 'weight')
          .populate('baseProduct', 'weight')
          .lean()
      : [],
  ]);

  const productMap = new Map(products.map((p) => [String(p._id), p]));
  const comboMap = new Map(combos.map((c) => [String(c._id), c]));

  let totalGrams = 0;
  let totalPieces = 0;
  let usedFallback = false;

  for (const line of items) {
    const qty = Math.max(0, Number(line.qty) || 0);
    let unitGrams = 0;
    let unitPieces = 1;

    if (isComboLine(line)) {
      const combo = comboMap.get(String(line.comboId));
      if (combo) {
        const packSize = Number(line.packDetails?.packSize) || 0;
        unitGrams = comboWeightGrams(combo, packSize);
        unitPieces =
          combo.type === 'color-pack'
            ? packSize || 1
            : Number(combo.piecesPerCombo) || combo.products?.length || 1;
      }
    } else {
      unitGrams = productWeight(productMap.get(String(line.productId)));
    }

    // No manual weight set -> fall back to pieces x global weight per piece
    if (unitGrams <= 0) {
      unitGrams = unitPieces * weightPerPiece;
      usedFallback = true;
    }

    totalGrams += unitGrams * qty;
    totalPieces += unitPieces * qty;
  }

  return { totalGrams, totalPieces, usedFallback };
}