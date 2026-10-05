// Single source of truth for shipping.
// Used by BOTH:
//   - POST /api/admin/settings   (checkout page shipping estimate)
//   - buildOrderItemsAndTotals   (amount charged through Razorpay / stored on the order)
//
// Products and combos follow the SAME rules (no special combo free shipping).
//
// Rules:
//   0. If the customer's state has a rule with enabled === false -> not deliverable.
//   1. Effective values = state override if set (not null/undefined), else global.
//   2. Weight source:
//        - totalWeightGrams (computed from product/combo manual weights, with a
//          per-line fallback of pieces x weightPerPiece) when > 0
//        - else qty x weightPerPiece
//      If effective pricePerKg > 0 AND a weight source exists -> weight-based:
//        billable kg = ceil(grams / 1000), minimum 1 kg (0 if empty cart)
//        cost = billable kg * pricePerKg
//   3. Otherwise fall back to the effective flat defaultShippingCharge.
//   4. If effective freeShippingAbove > 0 and subtotal >= it -> free.

const norm = (s) => String(s || '').trim().toLowerCase();
const has = (v) => v !== null && v !== undefined && v !== '';

export function findStateRule(settings, state) {
  if (!state) return null;
  const target = norm(state);
  return (settings?.stateShipping || []).find((r) => norm(r.state) === target) || null;
}

export function calculateShipping(settings, { subtotal, totalQty, totalWeightGrams: weightIn, state }) {
  const rule = findStateRule(settings, state);

  const weightPerPiece = Number(settings?.weightPerPiece) || 0; // grams, global fallback
  const pricePerKg = has(rule?.pricePerKg) ? Number(rule.pricePerKg) : Number(settings?.pricePerKg) || 0;
  const defaultShippingCharge = has(rule?.defaultShippingCharge)
    ? Number(rule.defaultShippingCharge)
    : Number(settings?.defaultShippingCharge) || 0;
  const freeShippingAbove = has(rule?.freeShippingAbove)
    ? Number(rule.freeShippingAbove)
    : Number(settings?.freeShippingAbove) || 0;
  const qty = Number(totalQty) || 0;
  const manualWeight = Number(weightIn) || 0;

  // State switched off: no delivery, no price.
  if (rule && rule.enabled === false) {
    return {
      deliverable: false,
      shippingCost: 0,
      freeShippingAbove,
      weightPerPiece,
      pricePerKg,
      defaultShippingCharge,
      totalWeightGrams: 0,
      billableKg: 0,
      usedFallback: false,
      state: rule.state,
      stateRuleApplied: true
    };
  }

  const weightConfigured = pricePerKg > 0 && (manualWeight > 0 || weightPerPiece > 0);

  let totalWeightGrams = 0;
  let billableKg = 0;
  let baseCost;

  if (weightConfigured) {
    totalWeightGrams = manualWeight > 0 ? manualWeight : qty * weightPerPiece;
    billableKg = totalWeightGrams > 0 ? Math.max(1, Math.ceil(totalWeightGrams / 1000)) : 0;
    baseCost = billableKg * pricePerKg;
  } else {
    baseCost = defaultShippingCharge;
  }

  const isFree = freeShippingAbove > 0 && Number(subtotal) >= freeShippingAbove;

  return {
    deliverable: true,
    shippingCost: isFree ? 0 : baseCost,
    freeShippingAbove,
    weightPerPiece,
    pricePerKg,
    defaultShippingCharge,
    totalWeightGrams,
    billableKg,
    usedFallback: !weightConfigured,
    state: rule?.state || state || '',
    stateRuleApplied: Boolean(rule)
  };
}