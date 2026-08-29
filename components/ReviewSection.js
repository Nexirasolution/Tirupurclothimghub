'use client';

import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef } from 'react';

// Design tokens
const INK = '#241B21';
const INK_SOFT = '#A9808C';
const ROSE = '#E24C6B';
const BLUSH = '#FDE7EC';
const BLUSH_LINE = '#F6C9D3';
const PAPER = '#FFFFFF';

export default function ReviewSection({ reviews }) {
  const scrollerRef = useRef(null);

  if (!reviews?.length) return null;

  const scrollByAmount = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('[data-review-card]')?.offsetWidth || 280;
    el.scrollBy({ left: dir * (cardWidth + 32), behavior: 'smooth' });
  };

  return (
    <section style={{ background: PAPER }} className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-6">

        {/* Heading — off-center, editorial */}
        <div className="mb-12 sm:mb-16 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p
              className="text-[11px] font-semibold uppercase mb-3"
              style={{ color: ROSE, letterSpacing: '0.22em', fontFamily: 'system-ui, sans-serif' }}
            >
              Real Customers
            </p>
            <h2
              className="text-4xl sm:text-5xl"
              style={{
                color: INK,
                fontFamily: 'Georgia, "Times New Roman", serif',
                fontWeight: 400,
                letterSpacing: '-0.01em',
                lineHeight: 1.05,
              }}
            >
              What they're
              <br />
              saying
            </h2>
          </div>

          <div className="flex items-end justify-between sm:justify-end gap-6 w-full sm:w-auto">
            <p
              className="text-sm max-w-[220px]"
              style={{ color: INK_SOFT, fontFamily: 'system-ui, sans-serif', lineHeight: 1.5 }}
            >
              A few words from people who've already ordered.
            </p>

            {/* Nav arrows — desktop only, mobile relies on native swipe */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <button
                onClick={() => scrollByAmount(-1)}
                className="p-2 rounded-full transition hover:opacity-70"
                style={{ background: PAPER, color: ROSE, border: `1px solid ${BLUSH_LINE}` }}
                aria-label="Previous reviews"
              >
                <ChevronLeft size={16} strokeWidth={1.75} />
              </button>
              <button
                onClick={() => scrollByAmount(1)}
                className="p-2 rounded-full transition hover:opacity-70"
                style={{ background: PAPER, color: ROSE, border: `1px solid ${BLUSH_LINE}` }}
                aria-label="Next reviews"
              >
                <ChevronRight size={16} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal scrollable row */}
        <div
          ref={scrollerRef}
          className="flex gap-8 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4 -mx-6 px-6 sm:mx-0 sm:px-0"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          <style jsx>{`
            div::-webkit-scrollbar {
              display: none;
            }
          `}</style>

          {reviews.map((r, i) => (
            <div
              key={r._id}
              data-review-card
              className="relative snap-start shrink-0 w-[260px] sm:w-[300px]"
            >
              {/* Oversized watermark numeral — quiet signature, not a generic quote icon */}
              <span
                aria-hidden="true"
                className="absolute -top-6 -left-1 select-none pointer-events-none"
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '64px',
                  color: BLUSH,
                  fontWeight: 700,
                  lineHeight: 1,
                  zIndex: 0,
                }}
              >
                {String(i + 1).padStart(2, '0')}
              </span>

              <div className="relative pt-9" style={{ zIndex: 1 }}>
                {/* Rating — minimal dot-scaled stars */}
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      size={12}
                      strokeWidth={1.5}
                      style={
                        s < r.rating
                          ? { fill: ROSE, color: ROSE }
                          : { fill: 'none', color: BLUSH_LINE }
                      }
                    />
                  ))}
                </div>

                {/* Comment */}
                <p
                  className="text-[15px] line-clamp-5 mb-5"
                  style={{ color: INK, fontFamily: 'Georgia, serif', lineHeight: 1.6 }}
                >
                  {r.comment}
                </p>

                {/* Review image — small, offset frame, not a full-width block */}
                {r.images?.[0] && (
                  <div
                    className="relative w-20 h-20 mb-5 overflow-hidden"
                    style={{ borderRadius: '6px' }}
                  >
                    <Image src={r.images[0]} alt="Review photo" fill className="object-cover" />
                  </div>
                )}

                {/* Divider — thin rose rule instead of a boxed card */}
                <div style={{ height: '1px', background: BLUSH_LINE }} className="mb-3 w-10" />

                {/* Footer */}
                <p
                  className="text-[13px] font-semibold"
                  style={{ color: INK, fontFamily: 'system-ui, sans-serif' }}
                >
                  {r.customerName}
                </p>
                {r.product?.name && (
                  <p
                    className="text-[12px] mt-0.5 line-clamp-1"
                    style={{ color: INK_SOFT, fontFamily: 'system-ui, sans-serif' }}
                  >
                    {r.product.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}