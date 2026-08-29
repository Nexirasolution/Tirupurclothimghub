'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order));
  }, [id]);

  if (!order) return <div className="max-w-xl mx-auto px-4 py-20 text-center text-neutral-400">Loading...</div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-50 border border-green-200 mb-4">
        <CheckCircle2 size={48} className="text-green-600" />
      </div>

      <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Order Placed Successfully!</h1>

      <p className="text-neutral-500 mt-4">Order Number: <strong className="text-neutral-900">{order.orderNumber}</strong></p>
      <p className="text-neutral-500">Total: <strong className="text-neutral-900">{formatINR(order.total)}</strong></p>
      <p className="text-sm text-neutral-400 mt-1">We'll send updates to {order.customer?.phone}</p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
        <Link
          href={`/invoice/${order._id}`}
          className="px-5 py-2.5 rounded-full border border-pink-600 text-pink-600 font-medium text-sm hover:bg-pink-50 transition-colors"
        >
          View Invoice
        </Link>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-full bg-pink-600 text-white font-medium text-sm hover:bg-pink-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}