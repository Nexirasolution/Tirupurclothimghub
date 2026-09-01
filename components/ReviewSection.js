'use client';

import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

// Design tokens — shared minimalist coffee / light-peach / white theme
const COFFEE = '#3E2B22';
const COFFEE_FAINT = '#7A6A5E';
const LIGHT_PEACH = '#F6DDC0';
const HAIRLINE = '#EDE6DE';
const PAPER = '#FFFFFF';

const FONT_SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export default function ReviewSection({ reviews }) {
  const scrollerRef = useRef(null);
  const [lightbox, setLightbox] = useState(null); // { src, customerName }

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e) => e.key === 'Escape' && setLightbox(null);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox]);

  if (!reviews?.length) return null;

  const scrollByAmount = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.querySelector('[data-review-card]')?.offsetWidth || 280;
    el.scrollBy({ left: dir * (cardWidth + 24), behavior: 'smooth' });
  };

  return (
    <section style={{ background: PAPER }} className="py-16 border-t">
      <div className="max-w-6xl mx-auto px-4" style={{ borderColor: HAIRLINE }}>

        {/* Heading — centered, matches Category / Combo sections */}
        <div className="flex flex-col items-center text-center mb-10">
          <span
            className="text-[11px] font-bold uppercase tracking-[3px] mb-3 px-3 py-1"
            style={{ color: COFFEE, background: LIGHT_PEACH, fontFamily: FONT_SANS }}
          >
            Real Customers
          </span>
          <h2
            className="text-xl sm:text-2xl font-bold tracking-[1px]"
            style={{ color: COFFEE, fontFamily: FONT_SANS }}
          >
            What They're Saying
          </h2>
          <p className="text-sm mt-1 font-light" style={{ color: COFFEE_FAINT, fontFamily: FONT_SANS }}>
            A few words from people who've already ordered
          </p>

          {/* Nav arrows — desktop only, mobile relies on native swipe */}
          <div className="hidden sm:flex items-center gap-2 mt-4">
            <button
              onClick={() => scrollByAmount(-1)}
              className="p-2 transition-colors hover:bg-[#F6DDC0]"
              style={{ background: PAPER, color: COFFEE, border: `1px solid ${HAIRLINE}` }}
              aria-label="Previous reviews"
            >
              <ChevronLeft size={16} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => scrollByAmount(1)}
              className="p-2 transition-colors hover:bg-[#F6DDC0]"
              style={{ background: PAPER, color: COFFEE, border: `1px solid ${HAIRLINE}` }}
              aria-label="Next reviews"
            >
              <ChevronRight size={16} strokeWidth={1.75} />
            </button>
          </div>
        </div>

        {/* Horizontal scrollable row */}
        <div
          ref={scrollerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2 -mx-4 px-4 sm:mx-0 sm:px-0"
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

          {reviews.map((r) => (
            <div
              key={r._id}
              data-review-card
              className="snap-start shrink-0 w-[240px] sm:w-[280px] bg-white"
              style={{ border: `1px solid ${HAIRLINE}` }}
            >
              <div className="p-4">
                {/* Rating */}
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      size={12}
                      strokeWidth={1.5}
                      style={
                        s < r.rating
                          ? { fill: COFFEE, color: COFFEE }
                          : { fill: 'none', color: HAIRLINE }
                      }
                    />
                  ))}
                </div>

                {/* Comment */}
                <p
                  className="text-[13px] font-light line-clamp-5 mb-4"
                  style={{ color: COFFEE, fontFamily: FONT_SANS, lineHeight: 1.6 }}
                >
                  {r.comment}
                </p>

                {/* Review image — zoomable, premium framed thumbnail */}
                {r.images?.[0] && (
                  <button
                    type="button"
                    onClick={() => setLightbox({ src: r.images[0], customerName: r.customerName })}
                    className="group relative w-16 h-16 mb-4 overflow-hidden bg-neutral-50 block"
                    style={{ border: `1px solid ${HAIRLINE}` }}
                    aria-label="View full review photo"
                  >
                    <Image src={r.images[0]} alt="Review photo" fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                    <span
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: 'rgba(62,43,34,0.35)' }}
                    >
                      <ZoomIn size={16} color="#FFFFFF" strokeWidth={1.75} />
                    </span>
                  </button>
                )}

                {/* Divider */}
                <div style={{ height: '1px', background: HAIRLINE }} className="mb-3 w-8" />

                {/* Footer */}
                <p
                  className="text-[12px] font-bold tracking-wide"
                  style={{ color: COFFEE, fontFamily: FONT_SANS }}
                >
                  {r.customerName}
                </p>
                {r.product?.name && (
                  <p
                    className="text-[11px] mt-0.5 font-light line-clamp-1"
                    style={{ color: COFFEE_FAINT, fontFamily: FONT_SANS }}
                  >
                    {r.product.name}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox — premium, minimal, image-first */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(62,43,34,0.72)' }}
          onClick={() => setLightbox(null)}
        >
          <button
            type="button"
            onClick={() => setLightbox(null)}
            className="absolute top-5 right-5 p-2 transition-colors"
            style={{ color: '#FFFFFF' }}
            aria-label="Close"
          >
            <X size={22} strokeWidth={1.5} />
          </button>

          <div
            className="relative w-full max-w-xl bg-white"
            style={{ border: `1px solid ${HAIRLINE}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full aspect-square bg-neutral-50">
              <Image
                src={lightbox.src}
                alt={`${lightbox.customerName || 'Customer'} review photo`}
                fill
                className="object-contain"
                sizes="(max-width: 640px) 100vw, 576px"
                priority
              />
            </div>
            {lightbox.customerName && (
              <div className="px-4 py-3 text-center" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
                <p
                  className="text-[12px] font-bold tracking-wide"
                  style={{ color: COFFEE, fontFamily: FONT_SANS }}
                >
                  {lightbox.customerName}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}