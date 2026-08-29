'use client';

import { useEffect, useState } from 'react';
import { Tag, Truck } from 'lucide-react';

// Same tokens as Navbar — keep these two in sync if you tweak the palette.
const LIGHT_PEACH = '#F6DDC0';
const COFFEE = '#3E2B22';
const COFFEE_FAINT = 'rgba(62, 43, 34, 0.65)';

// A quiet serif, matched to the wordmark used elsewhere on the site,
// so the marquee reads as part of the same brand rather than generic UI text.
const FONT = "Georgia, 'Times New Roman', serif";

export default function CouponMarquee() {
  const [coupons, setCoupons] = useState([]);
  const [freeShippingAbove, setFreeShippingAbove] = useState(null);

  useEffect(() => {
    fetch('/api/coupons?active=true')
      .then((r) => r.json())
      .then((d) => setCoupons(d.coupons || []))
      .catch(() => {});

    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((d) => setFreeShippingAbove(d.settings?.freeShippingAbove ?? null))
      .catch(() => {});
  }, []);

  const freeShippingItem =
    freeShippingAbove != null ? { type: 'freeshipping', minOrderValue: freeShippingAbove } : null;

  const allItems = freeShippingItem ? [...coupons, freeShippingItem] : coupons;
  if (!allItems.length) return null;

  const items = [...allItems, ...allItems];

  return (
    <div className="relative overflow-hidden py-2" style={{ background: LIGHT_PEACH }}>
      {/* Fade edges */}
      <div
        className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 z-10"
        style={{ background: `linear-gradient(to right, ${LIGHT_PEACH}, transparent)` }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 z-10"
        style={{ background: `linear-gradient(to left, ${LIGHT_PEACH}, transparent)` }}
      />

      <div className="flex animate-marquee whitespace-nowrap w-max">
        {items.map((c, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 mx-8 text-[12px] tracking-[0.3px]"
            style={{ color: COFFEE, fontFamily: FONT }}
          >
            {i > 0 && <span className="mr-4" style={{ color: COFFEE_FAINT }}>—</span>}

            {c.type === 'freeshipping' ? (
              <>
                <Truck size={12} strokeWidth={1.25} className="shrink-0" style={{ color: COFFEE }} />
                Free shipping on orders above ₹{c.minOrderValue}
              </>
            ) : (
              <>
                <Tag size={12} strokeWidth={1.25} className="shrink-0" style={{ color: COFFEE }} />
                Use{' '}
                <span
                  className="italic px-1.5"
                  style={{ color: COFFEE, borderBottom: `1px solid ${COFFEE}` }}
                >
                  {c.code}
                </span>
                {' '}for{' '}
                {c.type === 'percent' ? `${c.value}% off` : `₹${c.value} off`}
                {c.minOrderValue > 0 && (
                  <span style={{ color: COFFEE_FAINT }}> on orders above ₹{c.minOrderValue}</span>
                )}
              </>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}