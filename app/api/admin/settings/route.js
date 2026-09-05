export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { requireAdmin } from '@/lib/apiAuth';

export async function GET() {
  await dbConnect();
  let settings = await Settings.findOne({ key: 'global' });
  if (!settings) settings = await Settings.create({ key: 'global' });
  return NextResponse.json({ settings });
}

export const PUT = requireAdmin(async (req) => {
  await dbConnect();
  const body = await req.json();
  const settings = await Settings.findOneAndUpdate({ key: 'global' }, body, { new: true, upsert: true });
  return NextResponse.json({ settings });
});

// POST /api/admin/settings — used by checkout to calculate shipping.
// Body: { subtotal, totalQty }
//   subtotal — cart subtotal in ₹, used only to check the free-shipping threshold.
//   totalQty — total number of pieces in the cart (sum of each line's qty),
//              used to compute the order's total weight.
export async function POST(req) {
  try {
    const { subtotal, totalQty } = await req.json();

    await dbConnect();
    const settings = await Settings.findOne({ key: 'global' });
    if (!settings) {
      return NextResponse.json({ error: 'Settings not configured' }, { status: 500 });
    }

    const { weightPerPiece, pricePerKg, freeShippingAbove, defaultShippingCharge } = settings;
    const qty = Number(totalQty) || 0;

    // Weight-based calc only applies if both inputs are actually configured.
    // If either is 0/unset, fall back to the flat defaultShippingCharge so
    // shipping doesn't come out as ₹0 by accident.
    const weightConfigured = (weightPerPiece || 0) > 0 && (pricePerKg || 0) > 0;

    let billableKg = 0;
    let totalWeightGrams = 0;
    let usedFallback = !weightConfigured;
    let weightBasedCost;

    if (weightConfigured) {
      // Total order weight = piece count × weight per piece (grams) → kg,
      // rounded UP to the next whole kg since couriers bill by whole-kg slabs.
      totalWeightGrams = qty * weightPerPiece;
      const totalWeightKg = totalWeightGrams / 1000;
      billableKg = qty > 0 ? Math.max(1, Math.ceil(totalWeightKg)) : 0;
      weightBasedCost = billableKg * pricePerKg;
    } else {
      weightBasedCost = defaultShippingCharge || 0;
    }

    const shippingCost = subtotal >= freeShippingAbove ? 0 : weightBasedCost;

    return NextResponse.json({
      shippingCost,
      freeShippingAbove,
      weightPerPiece,
      pricePerKg,
      defaultShippingCharge,
      totalWeightGrams,
      billableKg,
      usedFallback,
    });
  } catch (err) {
    console.error('Shipping calculate error:', err);
    return NextResponse.json({ error: 'Could not calculate shipping' }, { status: 500 });
  }
}