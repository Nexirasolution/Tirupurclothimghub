'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Fraunces, Inter } from 'next/font/google';
import { Star, ShoppingBag, Zap, Heart, Share2, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { getSizeStock } from '@/lib/stock';
import { useCart } from '@/components/CartContext';
import ColorSizeSelector from '@/components/ColorSizeSelector';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';

// Typography — a deliberate pairing instead of system defaults: Fraunces
// (a warm, slightly editorial serif with real personality in italics/weight)
// for anything read as a headline, Inter for everything functional/UI.
const display = Fraunces({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'], variable: '--font-display' });
const body = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' });

// Design tokens — shared across the site's white/pink design system
const INK = '#241B21';
const INK_SOFT = '#A9808C';
const ROSE = '#E24C6B';
const BLUSH = '#FDE7EC';
const BLUSH_LINE = '#F6C9D3';
const PAPER = '#FFFFFF';
const NEUTRAL = '#C7BDC1';

export default function ProductPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [activeVariant, setActiveVariant] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [activeSize, setActiveSize] = useState('');
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    fetch(`/api/products/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setActiveVariant(d.product?.variants?.[0]);
      });
  }, [slug]);

  if (!data?.product) {
    return (
      <div className={`${body.className} min-h-screen flex items-center justify-center`} style={{ background: PAPER }}>
        <div className="flex flex-col items-center gap-3" style={{ color: INK_SOFT }}>
          <div className="w-7 h-7 border-2 rounded-full animate-spin" style={{ borderColor: BLUSH_LINE, borderTopColor: ROSE }} />
          <p className="text-sm">Loading product…</p>
        </div>
      </div>
    );
  }

  const { product, reviews, related } = data;
  const images = activeVariant?.images || [];
  const discount = activeVariant?.compareAtPrice > activeVariant?.price
    ? Math.round(((activeVariant.compareAtPrice - activeVariant.price) / activeVariant.compareAtPrice) * 100)
    : 0;

  const selectedSizeStock = getSizeStock(activeVariant, activeSize);
  const sizeOutOfStock = !!activeSize && selectedSizeStock <= 0;

  function prevImage() { setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1)); }
  function nextImage() { setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1)); }

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied!');
    }
  }

  function handleColorChange(v) {
    setActiveVariant(v);
    setActiveImage(0);
    setActiveSize('');
    setQty(1);
  }

  function handleSizeChange(size) {
    setActiveSize(size);
    const stock = getSizeStock(activeVariant, size);
    setQty((q) => (stock > 0 ? Math.min(q, stock) : 1));
  }

  function handleAddToCart() {
    if (!activeSize) { toast.error('Please select a size'); return; }
    const stock = getSizeStock(activeVariant, activeSize);
    if (stock <= 0) { toast.error('This size is out of stock'); return; }
    if (qty > stock) {
      toast.error(`Only ${stock} left in stock`);
      setQty(stock);
      return;
    }

    addItem({
      productId: product._id,
      variantId: activeVariant._id,
      comboId: null,
      name: product.name,
      image: activeVariant.images?.[0],
      color: activeVariant.color,
      size: activeSize,
      price: activeVariant.price,
      qty,
      stock,
    });
  }

  function handleBuyNow() {
    if (!activeSize) { toast.error('Please select a size'); return; }
    const stock = getSizeStock(activeVariant, activeSize);
    if (stock <= 0) { toast.error('This size is out of stock'); return; }
    if (qty > stock) {
      toast.error(`Only ${stock} left in stock`);
      setQty(stock);
      return;
    }

    addItem({
      productId: product._id,
      variantId: activeVariant._id,
      comboId: null,
      name: product.name,
      image: activeVariant.images?.[0],
      color: activeVariant.color,
      size: activeSize,
      price: activeVariant.price,
      qty,
      stock,
    });
    router.push('/checkout');
  }

  return (
    <div className={`${body.className} ${display.variable}`} style={{ background: PAPER }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-12 pb-24 sm:pb-16">

        {/* Asymmetric layout: gallery takes more room and stays put while
            details scroll past it on desktop — an editorial reading order
            rather than two matched columns. */}
        <div className="grid sm:grid-cols-12 gap-8 sm:gap-12">

          {/* ── Gallery ── */}
          <div className="sm:col-span-7 sm:sticky sm:top-6 sm:self-start">
            <div className="flex gap-3 sm:gap-4">

              {/* Signature element: category name run vertically along the
                  spine of the image, like a garment tag or a magazine folio */}
              <div className="hidden sm:flex items-center shrink-0 w-5">
                <span
                  className="text-[11px] font-medium uppercase whitespace-nowrap"
                  style={{
                    color: ROSE,
                    letterSpacing: '0.22em',
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                  }}
                >
                  {product.category?.name}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden" style={{ background: BLUSH }}>
                  {images[activeImage] && (
                    <Image
                      src={images[activeImage]}
                      alt={product.name}
                      fill
                      sizes="(max-width:640px) 100vw, 58vw"
                      className="object-cover"
                      priority
                    />
                  )}

                  {discount > 0 && (
                    <div
                      className="absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: PAPER, background: ROSE, padding: '4px 9px', borderRadius: '3px' }}
                    >
                      {discount}% off
                    </div>
                  )}

                  <div className="absolute top-3 right-3 flex flex-col gap-3">
                    <button
                      onClick={() => { setWished((w) => !w); toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist'); }}
                      className="w-8 h-8 flex items-center justify-center active:scale-90 transition-transform"
                      aria-label="Toggle wishlist"
                    >
                      <Heart
                        size={18}
                        style={{
                          fill: wished ? ROSE : 'rgba(255,255,255,0.85)',
                          color: wished ? ROSE : INK,
                          filter: 'drop-shadow(0 1px 2px rgba(36,27,33,0.25))',
                        }}
                      />
                    </button>
                    <button
                      onClick={handleShare}
                      className="w-8 h-8 flex items-center justify-center active:scale-90 transition-transform"
                      aria-label="Share"
                    >
                      <Share2 size={16} style={{ color: INK, filter: 'drop-shadow(0 1px 2px rgba(36,27,33,0.25))' }} />
                    </button>
                  </div>

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: PAPER, color: ROSE, border: `1px solid ${BLUSH_LINE}` }}
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={16} strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ background: PAPER, color: ROSE, border: `1px solid ${BLUSH_LINE}` }}
                        aria-label="Next image"
                      >
                        <ChevronRight size={16} strokeWidth={1.75} />
                      </button>
                    </>
                  )}

                  {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className="rounded-full transition-all"
                          style={{
                            height: '3px',
                            width: i === activeImage ? '20px' : '8px',
                            background: i === activeImage ? ROSE : 'rgba(255,255,255,0.75)',
                          }}
                          aria-label={`Go to image ${i + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="flex gap-3 mt-3 overflow-x-auto no-scrollbar">
                    {images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className="relative w-14 h-[70px] rounded-md overflow-hidden shrink-0 transition-opacity"
                        style={{
                          opacity: i === activeImage ? 1 : 0.5,
                          boxShadow: i === activeImage ? `0 0 0 1.5px ${ROSE}` : 'none',
                        }}
                      >
                        <Image src={img} alt="" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Details ── */}
          <div className="sm:col-span-5 flex flex-col">
            <h1
              className={`${display.className} text-[28px] sm:text-4xl leading-[1.08]`}
              style={{ color: INK, fontWeight: 400, letterSpacing: '-0.01em' }}
            >
              {product.name}
            </h1>

            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={13}
                    strokeWidth={1.5}
                    style={
                      i < Math.round(product.rating)
                        ? { fill: ROSE, color: ROSE }
                        : { fill: 'none', color: BLUSH_LINE }
                    }
                  />
                ))}
              </div>
              <span className="text-sm" style={{ color: INK_SOFT }}>({product.reviewCount} reviews)</span>
            </div>

            <div className="mt-5">
              <div className="flex items-end gap-3">
                <span className={`${display.className} text-[30px]`} style={{ color: INK, fontWeight: 500 }}>
                  {formatINR(activeVariant?.price)}
                </span>
                {activeVariant?.compareAtPrice > activeVariant?.price && (
                  <span className="line-through text-lg mb-0.5" style={{ color: NEUTRAL }}>
                    {formatINR(activeVariant.compareAtPrice)}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Tag size={12} style={{ color: ROSE }} />
                  <p className="text-xs font-medium" style={{ color: ROSE }}>
                    You save {formatINR(activeVariant.compareAtPrice - activeVariant.price)}
                  </p>
                </div>
              )}
            </div>

            {/* Meta — small definition-list rhythm instead of an inline sentence */}
            {product.fabric && (
              <dl className="flex gap-2 mt-4 text-sm">
                <dt style={{ color: INK_SOFT }}>Fabric</dt>
                <dd className="font-medium" style={{ color: INK }}>{product.fabric}</dd>
              </dl>
            )}

            <div className="mt-6">
              <ColorSizeSelector
                variants={product.variants}
                activeVariant={activeVariant}
                onColorChange={handleColorChange}
                activeSize={activeSize}
                onSizeChange={handleSizeChange}
                categoryType={product.category?.type}
              />
            </div>

            <div className="flex items-center gap-3 mt-6">
              <p className="text-sm font-medium" style={{ color: INK_SOFT }}>Qty</p>
              <div className="flex items-center" style={{ border: `1px solid ${BLUSH_LINE}`, borderRadius: '6px' }}>
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center text-base font-medium"
                  style={{ color: INK }}
                >
                  −
                </button>
                <span className="w-7 text-center text-sm font-semibold" style={{ color: INK }}>{qty}</span>
                <button
                  onClick={() => setQty((q) => (selectedSizeStock > 0 ? Math.min(selectedSizeStock, q + 1) : q + 1))}
                  disabled={!!activeSize && qty >= selectedSizeStock}
                  className="w-8 h-8 flex items-center justify-center text-base font-medium disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ color: INK }}
                >
                  +
                </button>
              </div>
              {!!activeSize && selectedSizeStock > 0 && selectedSizeStock <= 5 && (
                <span className="text-xs font-semibold" style={{ color: ROSE }}>Only {selectedSizeStock} left</span>
              )}
              {sizeOutOfStock && (
                <span className="text-xs font-semibold" style={{ color: INK_SOFT }}>Out of stock</span>
              )}
            </div>

            {/* CTAs — hidden on mobile in favor of the sticky bar below,
                shown inline on desktop where there's no fixed footer */}
            <div className="hidden sm:flex flex-col gap-2.5 mt-7">
              <button
                onClick={handleBuyNow}
                disabled={sizeOutOfStock}
                className="w-full flex items-center justify-center gap-2 font-semibold py-3.5 rounded-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                style={{ background: ROSE, color: PAPER }}
              >
                <Zap size={17} fill={PAPER} /> {sizeOutOfStock ? 'Out of Stock' : 'Buy Now'}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={sizeOutOfStock}
                className="w-full flex items-center justify-center gap-2 font-medium py-3 rounded-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                style={{ border: `1px solid ${ROSE}`, color: ROSE, background: PAPER }}
              >
                <ShoppingBag size={16} /> {sizeOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            {product.description && (
              <div className="mt-7 text-sm leading-relaxed pt-6" style={{ color: INK_SOFT, borderTop: `1px solid ${BLUSH_LINE}` }}>
                <h3 className={`${display.className} text-base mb-2`} style={{ color: INK, fontWeight: 500 }}>
                  Description
                </h3>
                <p>{product.description}</p>
              </div>
            )}

            {/* Spacer so content never sits under the mobile sticky bar */}
            <div className="h-4 sm:h-0" />
          </div>
        </div>

        {/* Reviews */}
        {reviews?.length > 0 && (
          <div className="mt-16 sm:mt-24">
            <h2 className={`${display.className} text-xl sm:text-2xl mb-6`} style={{ color: INK, fontWeight: 400 }}>
              Customer Reviews
            </h2>
            <div className="grid sm:grid-cols-2 gap-x-10 gap-y-7">
              {reviews.map((r) => (
                <div key={r._id} className="pt-5" style={{ borderTop: `1px solid ${BLUSH_LINE}` }}>
                  <div className="flex items-center gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        strokeWidth={1.5}
                        style={i < r.rating ? { fill: ROSE, color: ROSE } : { fill: 'none', color: BLUSH_LINE }}
                      />
                    ))}
                  </div>
                  <p className={`${display.className} text-sm leading-relaxed`} style={{ color: INK }}>
                    {r.comment}
                  </p>
                  <p className="text-xs font-semibold mt-3" style={{ color: INK_SOFT }}>{r.customerName}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        {related?.length > 0 && (
          <div className="mt-16 sm:mt-24">
            <h2 className={`${display.className} text-xl sm:text-2xl mb-6`} style={{ color: INK, fontWeight: 400 }}>
              You may also like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-5 gap-y-8">
              {related.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Sticky mobile buy bar — portaled directly to <body> so no ancestor
          (layout wrapper, motion/animation container, transform, overflow-hidden,
          etc.) can break its fixed positioning. This is what makes it reliably
          show up on mobile regardless of what wraps this page. */}
      {mounted && data?.product && createPortal(
        <div
          className="sm:hidden fixed bottom-0 left-0 right-0 flex items-center gap-3 px-4 py-3"
          style={{ background: PAPER, borderTop: `1px solid ${BLUSH_LINE}`, zIndex: 9999 }}
        >
          <div className="shrink-0">
            <p className={`${display.className} text-lg leading-none`} style={{ color: INK, fontWeight: 500 }}>
              {formatINR(activeVariant?.price)}
            </p>
            {activeVariant?.compareAtPrice > activeVariant?.price && (
              <p className="text-[11px] line-through leading-none mt-1" style={{ color: NEUTRAL }}>
                {formatINR(activeVariant.compareAtPrice)}
              </p>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={sizeOutOfStock}
            className="flex-1 flex items-center justify-center gap-1.5 font-medium py-2.5 rounded-md text-sm disabled:opacity-50"
            style={{ border: `1px solid ${ROSE}`, color: ROSE, background: PAPER }}
          >
            <ShoppingBag size={15} /> Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={sizeOutOfStock}
            className="flex-1 flex items-center justify-center gap-1.5 font-semibold py-2.5 rounded-md text-sm disabled:opacity-50"
            style={{ background: ROSE, color: PAPER }}
          >
            <Zap size={15} fill={PAPER} /> {sizeOutOfStock ? 'Sold out' : 'Buy now'}
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}