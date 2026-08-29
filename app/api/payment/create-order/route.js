import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import { getRazorpay } from '@/lib/razorpay';
import PendingOrder from '@/models/PendingOrder';
import { buildOrderItemsAndTotals, OrderError } from '@/lib/orderCalc';

// POST { items, customer, shippingAddress, couponCode }
// Recomputes pricing server-side (never trusts a client-sent amount),
// stashes the full order payload so the webhook can build the order
// even if the customer's browser never calls back, then creates the
// Razorpay order for the verified total.
export async function POST(req) {
  try {
    await dbConnect();
    const { items, customer, shippingAddress, couponCode } = await req.json();

    if (!items?.length) return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    if (!customer?.name || !customer?.phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 });
    }

    const { total } = await buildOrderItemsAndTotals(items, couponCode);

    const razorpay = getRazorpay();
    if (!razorpay) {
      return NextResponse.json(
        { error: 'Payment gateway is not configured. Add RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET in .env' },
        { status: 500 }
      );
    }

    const rzpOrder = await razorpay.orders.create({
      amount: Math.round(total * 100), // paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`
    });

    await PendingOrder.create({
      razorpayOrderId: rzpOrder.id,
      items,
      customer,
      shippingAddress,
      couponCode: couponCode || ''
    });

    return NextResponse.json({ order: rzpOrder, keyId: process.env.RAZORPAY_KEY_ID, total });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('Create Razorpay order failed:', err);
    return NextResponse.json({ error: 'Could not start payment' }, { status: 500 });
  }
}