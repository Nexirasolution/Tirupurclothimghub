export function getSizeStock(variant, size) {
  if (!variant || !size) return 0;
  const match = variant.sizes?.find((s) => s.size === size);
  return match?.stock || 0;
}

export function getVariantTotalStock(variant) {
  if (!variant) return 0;
  return variant.sizes?.reduce((sum, s) => sum + (s.stock || 0), 0) || 0;
}

export function getDefaultAvailableSizeEntry(variant) {
  if (!variant) return null;
  const inStock = variant.sizes?.find((s) => (s.stock || 0) > 0);
  return inStock || variant.sizes?.[0] || null;
}

export function isProductInStock(product) {
  const variant = product?.variants?.[0];
  return getVariantTotalStock(variant) > 0;
}