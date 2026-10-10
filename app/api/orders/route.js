import { NextResponse } from 'next/server';
import { dbConnect } from '@/lib/mongodb';
import Order from '@/models/Order';
import PendingOrder from '@/models/PendingOrder';
import { requireAdmin } from '@/lib/apiAuth';
import { createOrderIdempotent } from '@/lib/orderService';
import { OrderError } from '@/lib/orderCalc';

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();

    const { order, created } = await createOrderIdempotent(body);

    // Clean up the pending record either way — if the webhook already
    // consumed it, this is a harmless no-op.
    if (body.razorpayOrderId) {
      await PendingOrder.deleteOne({ razorpayOrderId: body.razorpayOrderId });
    }

    return NextResponse.json({ order }, { status: created ? 201 : 200 });
  } catch (err) {
    if (err instanceof OrderError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error('Order creation failed:', err);
    return NextResponse.json(
      { error: 'Could not create order. If you were charged, contact support with your payment ID.' },
      { status: 500 }
    );
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const GET = requireAdmin(async (req) => {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const search = searchParams.get('search');
  const from = searchParams.get('from'); // YYYY-MM-DD (optional)
  const to = searchParams.get('to');     // YYYY-MM-DD (optional)

  const query = {};
  if (status) query.status = status;

  if (search) {
    const safe = escapeRegex(search.trim());
    query.$or = [
      { orderNumber: { $regex: safe, $options: 'i' } },
      { 'customer.name': { $regex: safe, $options: 'i' } },
      { 'customer.phone': { $regex: safe, $options: 'i' } },
    ];
  }

  if (from || to) {
    query.createdAt = {};
    if (from) query.createdAt.$gte = new Date(`${from}T00:00:00`);
    if (to) query.createdAt.$lte = new Date(`${to}T23:59:59.999`);
  }

  // all=1 returns every matching order (no pagination)
  const all = searchParams.get('all') === '1';
  const page = Math.max(1, Number(searchParams.get('page') || 1));
  const limit = Math.min(Math.max(1, Number(searchParams.get('limit') || 20)), 200);

  let q = Order.find(query).sort({ createdAt: -1 });
  if (!all) q = q.skip((page - 1) * limit).limit(limit);

  const [orders, total] = await Promise.all([q, Order.countDocuments(query)]);

  return NextResponse.json({
    orders,
    total,
    page: all ? 1 : page,
    pages: all ? 1 : Math.ceil(total / limit),
  });
});