'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatINR } from '@/lib/utils';
import { buildProductIndex, resolveOrderItem } from '@/lib/orderItemResolver';
import OrderItemModal from '@/components/admin/OrderItemModal';

const STATUSES = ['placed', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'];

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [courier, setCourier] = useState({ partner: '', trackingId: '', awbNumber: '' });
  const [modalItem, setModalItem] = useState(null); // { item, image, categoryName }
  const [notFound, setNotFound] = useState(false);

  async function load() {
    if (!id) return; // guard: params not ready yet, avoids /api/orders/undefined
    try {
      const res = await fetch(`/api/orders/${id}`);
      if (!res.ok) {
        if (res.status === 404) { setNotFound(true); return; }
        const text = await res.text().catch(() => '');
        throw new Error(`Order fetch failed (${res.status}): ${text.slice(0, 200)}`);
      }
      const data = await res.json();
      setOrder(data.order);
      setCourier(data.order?.courier || { partner: '', trackingId: '', awbNumber: '' });
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Failed to load order');
    }
  }
  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    fetch('/api/products?limit=200')
      .then(async (r) => (r.ok ? r.json() : { products: [] }))
      .then((d) => setProducts(d.products || []))
      .catch((err) => console.error('Failed to load products', err));

    fetch('/api/categories')
      .then(async (r) => (r.ok ? r.json() : { categories: [] }))
      .then((d) => setCategories(d.categories || []))
      .catch((err) => console.error('Failed to load categories', err));
  }, []);

  const index = useMemo(() => buildProductIndex(products), [products]);

  function categoryName(catRef) {
    const cid = catRef?._id || catRef;
    return categories.find((c) => c._id === cid)?.name || catRef?.name || '';
  }

  async function updateStatus(status) {
    const res = await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
    if (res.ok) { toast.success('Status updated'); load(); }
    else toast.error('Failed to update status');
  }

  async function saveCourier() {
    const res = await fetch(`/api/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courier }) });
    if (res.ok) { toast.success('Courier details saved'); load(); }
    else toast.error('Failed to save courier details');
  }

  if (notFound) return <p className="text-brand-ink/50">Order not found.</p>;
  if (!order) return <p className="text-brand-ink/50">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-brand-magenta mb-1">Order {order.orderNumber}</h1>
      <p className="text-sm text-brand-ink/50 mb-5">{new Date(order.createdAt).toLocaleString('en-IN')}</p>

      <div className="card-soft p-5 mb-4">
        <h2 className="font-semibold mb-2">Items</h2>
        {order.items.map((item, i) => {
          const resolved = resolveOrderItem(item, index);
          return (
            <button
              key={i}
              onClick={() =>
                setModalItem({ item, image: resolved.image, categoryName: categoryName(resolved.category), productSku: resolved.product?.sku })
              }
              className="w-full flex justify-between items-center text-sm py-2 border-b border-brand-ink/5 last:border-b-0 hover:bg-brand-ink/5 rounded-lg px-2 -mx-2 transition-colors text-left"
            >
              <span className="flex items-center gap-3">
                {resolved.image ? (
                  <img src={resolved.image} alt={item.name} className="w-10 h-10 rounded-md object-cover shrink-0" />
                ) : (
                  <span className="w-10 h-10 rounded-md bg-brand-ink/5 shrink-0" />
                )}
                <span>
                  {item.name} ({item.color}/{item.size}) x{item.qty}
                  {resolved.product?.sku && (
                    <span className="block text-xs text-brand-ink/50">Product SKU: {resolved.product.sku}</span>
                  )}
                  {item.sku && (
                    <span className="block text-xs text-brand-ink/40">Size SKU: {item.sku}</span>
                  )}
                </span>
              </span>
              <span>{formatINR(item.price * item.qty)}</span>
            </button>
          );
        })}
        <div className="flex justify-between font-bold mt-2 border-t pt-2"><span>Total</span><span>{formatINR(order.total)}</span></div>
      </div>

      <div className="card-soft p-5 mb-4">
        <h2 className="font-semibold mb-2">Customer & Shipping</h2>
        <p className="text-sm">{order.customer?.name} — {order.customer?.phone}</p>
        <p className="text-sm text-brand-ink/70">{order.shippingAddress?.line1}, {order.shippingAddress?.line2}</p>
        <p className="text-sm text-brand-ink/70">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
      </div>

      <div className="card-soft p-5 mb-4">
        <h2 className="font-semibold mb-2">Order Status</h2>
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize border ${order.status === s ? 'bg-brand-pink text-white border-brand-pink' : 'border-brand-ink/15 text-brand-ink/70'}`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="card-soft p-5 mb-4">
        <h2 className="font-semibold mb-2">Courier Details</h2>
        <div className="grid sm:grid-cols-3 gap-3 mb-3">
          <input placeholder="Courier partner" className="border rounded-lg px-3 py-2 text-sm" value={courier.partner} onChange={(e) => setCourier({ ...courier, partner: e.target.value })} />
          <input placeholder="AWB / Tracking number" className="border rounded-lg px-3 py-2 text-sm" value={courier.awbNumber} onChange={(e) => setCourier({ ...courier, awbNumber: e.target.value })} />
          <input placeholder="Tracking link/ID" className="border rounded-lg px-3 py-2 text-sm" value={courier.trackingId} onChange={(e) => setCourier({ ...courier, trackingId: e.target.value })} />
        </div>
        <button onClick={saveCourier} className="btn-outline text-sm">Save Courier Info</button>
      </div>

      <div className="flex gap-3">
        <Link href={`/invoice/${order._id}`} target="_blank" className="btn-outline text-sm">View Invoice</Link>
        <Link href={`/courier-bill/${order._id}`} target="_blank" className="btn-outline text-sm">Print Shipping Label</Link>
      </div>

      <OrderItemModal
        item={modalItem?.item}
        image={modalItem?.image}
        categoryName={modalItem?.categoryName}
        productSku={modalItem?.productSku}
        onClose={() => setModalItem(null)}
      />
    </div>
  );
}