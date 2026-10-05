import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { dbConnect } from '@/lib/mongodb';
import Product from '@/models/Product';
import { requireAdmin } from '@/lib/apiAuth';
import { getProductPageData, getFilter } from '@/lib/products';

export async function GET(req, { params }) {
  const { id } = await params; // works on Next 14 and 15

  // Same cached function the product page uses (includes the category
  // sizeChart fallback, isActive / isApproved filters, parallel queries).
  const data = await getProductPageData(id);
  if (!data) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
  });
}

export const PUT = requireAdmin(async (req, { params }) => {
  const { id } = await params;
  await dbConnect();
  const body = await req.json();

  const current = await Product.findOne(getFilter(id)).select('_id category sku').lean();
  if (!current) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  // SKU is auto-managed and permanently locked after creation.
  delete body.sku;

  if (body.variants?.length) {
    body.basePrice = Math.min(...body.variants.map((v) => v.price));
  }

  // Persists whatever is on body (sizeChart / isReadyToShip / sleeveOptions /
  // zipOptions / pantOptions / shawlOptions) as long as the schema defines them.
  const product = await Product.findOneAndUpdate(getFilter(id), body, { new: true });
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

  revalidateTag('products'); // storefront shows the edit immediately
  return NextResponse.json({ product });
});

export const DELETE = requireAdmin(async (req, { params }) => {
  const { id } = await params;
  await dbConnect();
  await Product.findOneAndDelete(getFilter(id));

  revalidateTag('products');
  return NextResponse.json({ success: true });
});