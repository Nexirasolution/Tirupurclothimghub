'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { formatINR } from '@/lib/utils';

const INK = '#241B21';
const INK_SOFT = '#9C877D';
const PEACH = '#D9946A';
const PEACH_WASH = '#FBE8D9';
const LINE = '#EEE3DA';
const PAPER = '#FFFFFF';
const SAGE = '#7C9473';
const FONT_SERIF = "Georgia, 'Times New Roman', serif";

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((d) => setOrder(d.order));
  }, [id]);

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center text-sm" style={{ color: INK_SOFT }}>
        Loading…
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-20 text-center" style={{ background: PAPER }}>
      <div
        className="inline-flex items-center justify-center w-16 h-16 mb-5"
        style={{ background: PEACH_WASH, borderRadius: '50%' }}
      >
        <CheckCircle2 size={30} strokeWidth={1.5} style={{ color: SAGE }} />
      </div>

      <h1 className="text-[24px] sm:text-[28px]" style={{ fontFamily: FONT_SERIF, color: INK }}>
        Order placed successfully
      </h1>

      <div className="mt-6 pt-6 max-w-xs mx-auto space-y-2" style={{ borderTop: `1px solid ${LINE}` }}>
        <p className="text-sm" style={{ color: INK_SOFT }}>
          Order Number <span style={{ color: INK }}>— {order.orderNumber}</span>
        </p>
        <p className="text-sm" style={{ color: INK_SOFT }}>
          Total <span style={{ color: PEACH }}>— {formatINR(order.total)}</span>
        </p>
      </div>

      <p className="text-xs mt-5" style={{ color: INK_SOFT }}>
        We&rsquo;ll send updates to {order.customer?.phone}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-9">
        <Link
          href={`/invoice/${order._id}`}
          className="px-6 py-3 text-sm font-medium transition-opacity active:opacity-70"
          style={{ border: `1px solid ${INK}`, color: INK, background: PAPER, borderRadius: '4px' }}
        >
          View Invoice
        </Link>
        <Link
          href="/"
          className="px-6 py-3 text-sm font-medium transition-opacity active:opacity-80"
          style={{ background: PEACH, color: PAPER, borderRadius: '4px' }}
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}