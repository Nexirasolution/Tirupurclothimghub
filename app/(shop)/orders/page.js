'use client';

import { useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { Package, Phone, Truck, Star, X, Loader2, ImagePlus, CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';

const STATUS_STYLES = {
  placed: 'bg-neutral-50 text-neutral-600 border border-neutral-200',
  confirmed: 'bg-pink-50 text-pink-600 border border-pink-200',
  packed: 'bg-pink-50 text-pink-600 border border-pink-200',
  shipped: 'bg-pink-100 text-pink-700 border border-pink-200',
  delivered: 'bg-green-50 text-green-700 border border-green-200',
  cancelled: 'bg-red-50 text-red-600 border border-red-200',
  returned: 'bg-neutral-100 text-neutral-600 border border-neutral-200'
};

function ReviewForm({ order, item, phone, onDone }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleImageUpload(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        const data = await res.json();
        const url = data.url || data.secure_url;
        if (url) urls.push(url);
      }
      setImages((prev) => [...prev, ...urls]);
    } catch {
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function submit() {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/orders/${order._id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, productId: item.product, rating, comment, images })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Thanks for your review!');
        onDone();
      } else {
        toast.error(data.error || 'Could not submit review');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="border border-pink-100 rounded-xl p-3 mt-2 bg-pink-50/50">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-neutral-900">Rate {item.name}</span>
        <button onClick={onDone} type="button"><X size={14} className="text-neutral-400" /></button>
      </div>
      <div className="flex gap-1 mb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <button key={i} type="button" onClick={() => setRating(i + 1)}>
            <Star size={20} className={i < rating ? 'fill-pink-500 text-pink-500' : 'text-neutral-200'} />
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        placeholder="How was the product?"
        className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-pink-200"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <div className="flex flex-wrap gap-2 mb-2">
        {images.map((url, i) => (
          <img key={i} src={url} alt="" className="w-12 h-12 rounded-lg object-cover border border-pink-100" />
        ))}
        <label className="w-12 h-12 rounded-lg border border-dashed border-pink-200 flex items-center justify-center cursor-pointer text-neutral-400">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
        </label>
      </div>
      <button
        onClick={submit}
        disabled={submitting}
        className="bg-pink-600 text-white text-xs font-medium px-4 py-2 rounded-full disabled:opacity-50 hover:bg-pink-700 transition-colors"
      >
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </div>
  );
}

export default function OrdersPage() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reviewedMap, setReviewedMap] = useState({});
  const [openReview, setOpenReview] = useState(null);

  async function fetchReviewedMap(orderList) {
    const map = {};
    await Promise.all(
      orderList
        .filter((o) => o.status === 'delivered')
        .map(async (o) => {
          const res = await fetch(`/api/reviews?orderId=${o._id}`);
          const data = await res.json();
          map[o._id] = new Set(data.reviewedProductIds || []);
        })
    );
    setReviewedMap(map);
  }

  async function handleLookup(e) {
    e.preventDefault();
    const cleaned = phone.replace(/\D/g, '').slice(-10);
    if (cleaned.length !== 10) {
      setError('Enter a valid 10-digit phone number');
      return;
    }
    setError('');
    setLoading(true);
    setOrders(null);
    try {
      const res = await fetch('/api/orders/by-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleaned })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      setOrders(data.orders || []);
      fetchReviewedMap(data.orders || []);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function markReviewed(orderId, productId) {
    setReviewedMap((prev) => {
      const next = { ...prev };
      next[orderId] = new Set([...(next[orderId] || []), productId]);
      return next;
    });
    setOpenReview(null);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 min-h-[60vh]">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900 mb-1">My Orders</h1>
      <p className="text-neutral-400 text-sm mb-6">
        Enter the phone number you used at checkout to view your orders.
      </p>

      <form onSubmit={handleLookup} className="flex gap-2 mb-2">
        <div className="flex-1 relative">
          <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
          <input
            type="tel"
            inputMode="numeric"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="10-digit phone number"
            maxLength={10}
            className="w-full pl-9 pr-3 py-2.5 rounded-full border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-pink-600 text-white font-medium text-sm px-5 py-2.5 rounded-full disabled:opacity-50 shrink-0 hover:bg-pink-700 transition-colors"
        >
          {loading ? 'Searching...' : 'Find Orders'}
        </button>
      </form>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {orders !== null && orders.length === 0 && !error && (
        <div className="text-center py-16 text-neutral-400">
          <Package size={36} className="mx-auto mb-2 text-pink-300" />
          <p className="text-sm">No orders found for this number</p>
        </div>
      )}

      <div className="space-y-3 mt-4">
        {orders?.map((o) => (
          <div key={o._id} className="border border-neutral-100 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-neutral-400">#{o.orderNumber}</span>
              <span
                className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                  STATUS_STYLES[o.status] || 'bg-neutral-100 text-neutral-600'
                }`}
              >
                {o.status}
              </span>
            </div>

            <div className="space-y-2 mb-3">
              {o.items.map((it, i) => {
                const reviewKey = `${o._id}-${it.product}`;
                const alreadyReviewed = reviewedMap[o._id]?.has(String(it.product));
                const canReview = o.status === 'delivered' && it.product && !it.isCombo;

                return (
                  <div key={i}>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-pink-50 shrink-0 relative border border-neutral-100">
                        {it.image && <Image src={it.image} alt={it.name} fill className="object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate text-neutral-900">{it.name}</p>
                        <p className="text-xs text-neutral-400">Qty {it.qty}</p>
                      </div>
                      {canReview && (
                        alreadyReviewed ? (
                          <span className="flex items-center gap-1 text-[11px] text-green-600 shrink-0">
                            <CheckCircle2 size={13} /> Reviewed
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setOpenReview(openReview === reviewKey ? null : reviewKey)}
                            className="flex items-center gap-1 text-[11px] font-semibold text-pink-600 shrink-0"
                          >
                            <Star size={13} /> Rate
                          </button>
                        )
                      )}
                    </div>
                    {openReview === reviewKey && (
                      <ReviewForm
                        order={o}
                        item={it}
                        phone={phone.replace(/\D/g, '').slice(-10)}
                        onDone={() => markReviewed(o._id, it.product)}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-neutral-500">
                {o.items.length} item{o.items.length > 1 ? 's' : ''}
              </span>
              <span className="font-semibold text-pink-600">{formatINR(o.total)}</span>
            </div>

            {o.courier?.trackingId && (
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-400 mt-1">
                <Truck size={12} className="text-pink-500" />
                {o.courier.partner} · {o.courier.trackingId}
              </div>
            )}

            <p className="text-[11px] text-neutral-300 mt-1.5">
              {new Date(o.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}