import mongoose from 'mongoose';
import Product from '@/models/Product';
import Combo from '@/models/Combo';
import Coupon from '@/models/Coupon';
import Settings from '@/models/Settings';
import { genCouponCheck } from '@/lib/utils';

export class OrderError extends Error {}

// Pure read-only pricing + validation. Does NOT touch stock or coupon usage —
// safe to call twice (once for the Razorpay amount, once at final order creation).
export async function buildOrderItemsAndTotals(items, couponCode) {
  let subtotal = 0;
  const orderItems = [];
  const stockUpdateItems = [];

  for (const item of items) {
    if (item.isCombo === true && item.comboId) {
      if (!mongoose.Types.ObjectId.isValid(item.comboId)) continue;

      const combo = await Combo.findById(item.comboId);
      if (!combo || !combo.isActive) {
        throw new OrderError(`This combo is no longer available`);
      }

      for (const sub of combo.products) {
        const subProduct = await Product.findById(sub.product);
        const subVariant = subProduct?.variants.id(sub.variantId);
        const subSizeEntry = subVariant?.sizes.find((s) => s.size === sub.size);
        if (!subProduct || !subVariant || !subSizeEntry || subSizeEntry.stock < item.qty) {
          throw new OrderError(`Combo "${combo.name}" is out of stock`);
        }
      }

      subtotal += combo.comboPrice * item.qty;
      orderItems.push({
        product: null,
        comboId: combo._id,
        name: combo.name,
        sku: combo.sku || '',
        image: combo.image || '',
        color: '',
        size: '',
        price: combo.comboPrice,
        qty: item.qty,
        isCombo: true
      });
      stockUpdateItems.push({ isCombo: true, comboProducts: combo.products, qty: item.qty });
      continue;
    }

    if (!mongoose.Types.ObjectId.isValid(item.productId) || !mongoose.Types.ObjectId.isValid(item.variantId)) {
      continue;
    }

    const product = await Product.findById(item.productId);
    if (!product) continue;
    const variant = product.variants.id(item.variantId);
    if (!variant) continue;
    const sizeEntry = variant.sizes.find((s) => s.size === item.size);
    if (!sizeEntry || sizeEntry.stock < item.qty) {
      throw new OrderError(`${product.name} (${variant.color}, ${item.size}) is out of stock`);
    }
    subtotal += variant.price * item.qty;
    orderItems.push({
      product: product._id,
      name: product.name,
      sku: sizeEntry.sku || product.sku || '',
      image: variant.images?.[0] || '',
      color: variant.color,
      size: item.size,
      price: variant.price,
      qty: item.qty
    });
    stockUpdateItems.push({
      isCombo: false,
      productId: item.productId,
      variantId: item.variantId,
      size: item.size,
      qty: item.qty
    });
  }

  if (!orderItems.length) throw new OrderError('No valid items in cart');

  let discount = 0;
  let appliedCoupon = '';
  if (couponCode) {
    const coupon = await Coupon.findOne({ code: genCouponCheck(couponCode), isActive: true });
    if (coupon && subtotal >= (coupon.minOrderValue || 0)) {
      if (!coupon.expiresAt || coupon.expiresAt > new Date()) {
        if (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) {
          discount = coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : coupon.value;
          if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
          appliedCoupon = coupon.code;
        }
      }
    }
  }

  const settings = (await Settings.findOne({ key: 'global' })) || { shippingFee: 49, freeShippingAbove: 999 };
  const shippingFee = subtotal - discount >= settings.freeShippingAbove ? 0 : settings.shippingFee;
  const total = Math.round(subtotal - discount + shippingFee);

  return { orderItems, stockUpdateItems, subtotal, discount, appliedCoupon, shippingFee, total };
}