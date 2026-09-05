'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Fraunces, Inter } from 'next/font/google';
import { Star, ShoppingBag, Zap, Heart, Share2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { getSizeStock } from '@/lib/stock';
import { useCart } from '@/components/CartContext';
import ColorSizeSelector from '@/components/ColorSizeSelector';
import ProductCard from '@/components/ProductCard';
import toast from 'react-hot-toast';

// Typography — a deliberate pairing instead of system defaults: Fraunces
// for anything read as a headline, Inter for everything functional/UI.
const display = Fraunces({ subsets: ['latin'], weight: ['400', '500'], style: ['normal', 'italic'], variable: '--font-display' });
const body = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-body' });

// Design tokens — minimalist white/peach system. One accent color, one ink
// color, and a single hairline tone — no badges, pills, or drop shadows.
const INK = '#241B21';
const INK_SOFT = '#9C877D';
const PEACH = '#D9946A';
const PEACH_WASH = '#FBE8D9';
const LINE = '#EEE3DA';
const PAPER = '#FFFFFF';
const NEUTRAL = '#C7B9AC';

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
  const [lightboxImg, setLightboxImg] = useState(null);

  // Size chart carousel modal
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [sizeChartIndex, setSizeChartIndex] = useState(0);

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
          <div className="w-6 h-6 border rounded-full animate-spin" style={{ borderColor: LINE, borderTopColor: PEACH }} />
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

  // Product's own size chart images win; otherwise fall back to the
  // category's. Requires GET /api/products/[slug] to populate
  // category with `sizeChart`.
  const sizeChartImages = product.sizeChart?.length ? product.sizeChart : (product.category?.sizeChart || []);

  const selectedSizeStock = getSizeStock(activeVariant, activeSize);
  const sizeOutOfStock = !!activeSize && selectedSizeStock <= 0;

  function prevImage() { setActiveImage((i) => (i === 0 ? images.length - 1 : i - 1)); }
  function nextImage() { setActiveImage((i) => (i === images.length - 1 ? 0 : i + 1)); }

  function prevSizeChart() { setSizeChartIndex((i) => (i === 0 ? sizeChartImages.length - 1 : i - 1)); }
  function nextSizeChart() { setSizeChartIndex((i) => (i === sizeChartImages.length - 1 ? 0 : i + 1)); }

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
      <div className="max-w-5xl mx-auto px-5 sm:px-8 pt-8 sm:pt-16 pb-24 sm:pb-20">

        {/* Even two-column split, generous gap, no sticky spine or gallery
            chrome — the image and the details carry equal quiet weight. */}
        <div className="grid sm:grid-cols-2 gap-10 sm:gap-16">

          {/* ── Gallery ── */}
          <div className="sm:sticky sm:top-10 sm:self-start">
            <div className="relative w-full aspect-[4/5] overflow-hidden" style={{ background: PEACH_WASH, borderRadius: '4px' }}>
              {images[activeImage] && (
                <Image
                  src={images[activeImage]}
                  alt={product.name}
                  fill
                  sizes="(max-width:640px) 100vw, 48vw"
                  className="object-cover"
                  priority
                />
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-0 top-0 bottom-0 w-1/4 flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={18} strokeWidth={1.5} style={{ color: INK }} />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-0 top-0 bottom-0 w-1/4 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity"
                    aria-label="Next image"
                  >
                    <ChevronRight size={18} strokeWidth={1.5} style={{ color: INK }} />
                  </button>

                  {/* Plain numeric counter instead of dots or a pill */}
                  <div
                    className="absolute bottom-3 right-3 text-[11px] font-medium tracking-wide"
                    style={{ color: INK }}
                  >
                    {String(activeImage + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails — a thin underline marks the active one instead of a ring/shadow */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className="relative w-12 h-[60px] overflow-hidden shrink-0 transition-opacity"
                    style={{
                      opacity: i === activeImage ? 1 : 0.45,
                      borderRadius: '3px',
                      boxShadow: i === activeImage ? `inset 0 -2px 0 ${PEACH}` : 'none',
                    }}
                  >
                    <Image src={img} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Wishlist / share — a plain text row under the image, not floating
                chrome on top of it */}
            <div className="flex items-center gap-5 mt-4">
              <button
                onClick={() => { setWished((w) => !w); toast.success(wished ? 'Removed from wishlist' : 'Added to wishlist'); }}
                className="flex items-center gap-1.5 text-xs font-medium"
                style={{ color: wished ? PEACH : INK_SOFT }}
              >
                <Heart size={14} strokeWidth={1.5} fill={wished ? PEACH : 'none'} />
                {wished ? 'Saved' : 'Save'}
              </button>
              <button onClick={handleShare} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: INK_SOFT }}>
                <Share2 size={14} strokeWidth={1.5} />
                Share
              </button>
            </div>
          </div>

          {/* ── Details ── */}
          <div className="flex flex-col">
            {product.category?.name && (
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] mb-2" style={{ color: PEACH }}>
                {product.category.name}
              </p>
            )}

            <h1
              className={`${display.className} text-[26px] sm:text-[32px] leading-[1.15]`}
              style={{ color: INK, fontWeight: 400, letterSpacing: '-0.01em' }}
            >
              {product.name}
            </h1>

            {/* Ready to Ship badge — highlighted, sits just under the title */}
            {product.isReadyToShip && (
              <span
                className="inline-block mt-2.5 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide w-fit"
                style={{ background: PEACH_WASH, color: PEACH, borderRadius: '4px' }}
              >
                Ready to Ship
              </span>
            )}

            <div className="flex items-center gap-1.5 mt-2.5 text-sm" style={{ color: INK_SOFT }}>
              <Star size={13} strokeWidth={1.5} style={{ fill: PEACH, color: PEACH }} />
              <span style={{ color: INK }}>{product.rating?.toFixed?.(1) ?? product.rating}</span>
              <span>· {product.reviewCount} reviews</span>
            </div>

            <div className="flex items-baseline gap-3 mt-6">
              <span className={`${display.className} text-[26px]`} style={{ color: INK, fontWeight: 500 }}>
                {formatINR(activeVariant?.price)}
              </span>
              {activeVariant?.compareAtPrice > activeVariant?.price && (
                <span className="line-through text-sm" style={{ color: NEUTRAL }}>
                  {formatINR(activeVariant.compareAtPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="text-xs font-medium" style={{ color: PEACH }}>
                  {discount}% off
                </span>
              )}
            </div>

            {product.fabric && (
              <p className="text-sm mt-3" style={{ color: INK_SOFT }}>
                Fabric <span style={{ color: INK }}>— {product.fabric}</span>
              </p>
            )}

            <div className="mt-8 pt-8" style={{ borderTop: `1px solid ${LINE}` }}>
              <ColorSizeSelector
                variants={product.variants}
                activeVariant={activeVariant}
                onColorChange={handleColorChange}
                activeSize={activeSize}
                onSizeChange={handleSizeChange}
                categoryType={product.category?.type}
                sizeChartImages={sizeChartImages}
                onViewSizeChart={() => { setSizeChartIndex(0); setSizeChartOpen(true); }}
              />
            </div>

            <div className="flex items-center gap-4 mt-6">
              <p className="text-sm" style={{ color: INK_SOFT }}>Qty</p>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="text-base leading-none"
                  style={{ color: INK }}
                >
                  −
                </button>
                <span className="text-sm font-medium w-4 text-center" style={{ color: INK }}>{qty}</span>
                <button
                  onClick={() => setQty((q) => (selectedSizeStock > 0 ? Math.min(selectedSizeStock, q + 1) : q + 1))}
                  disabled={!!activeSize && qty >= selectedSizeStock}
                  className="text-base leading-none disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{ color: INK }}
                >
                  +
                </button>
              </div>
              {!!activeSize && selectedSizeStock > 0 && selectedSizeStock <= 5 && (
                <span className="text-xs" style={{ color: PEACH }}>Only {selectedSizeStock} left</span>
              )}
              {sizeOutOfStock && (
                <span className="text-xs" style={{ color: INK_SOFT }}>Out of stock</span>
              )}
            </div>

            {/* CTAs — hidden on mobile in favor of the sticky bar below */}
            <div className="hidden sm:flex flex-col gap-2.5 mt-8">
              <button
                onClick={handleBuyNow}
                disabled={sizeOutOfStock}
                className="w-full flex items-center justify-center gap-2 font-medium py-3.5 transition-opacity active:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: PEACH, color: PAPER, borderRadius: '4px' }}
              >
                <Zap size={16} fill={PAPER} /> {sizeOutOfStock ? 'Out of Stock' : 'Buy Now'}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={sizeOutOfStock}
                className="w-full flex items-center justify-center gap-2 font-medium py-3.5 transition-opacity active:opacity-70 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ border: `1px solid ${INK}`, color: INK, background: PAPER, borderRadius: '4px' }}
              >
                <ShoppingBag size={15} /> {sizeOutOfStock ? 'Out of Stock' : 'Add to Cart'}
              </button>
            </div>

            {product.description && (
              <div className="mt-8 pt-8 text-sm leading-relaxed" style={{ color: INK_SOFT, borderTop: `1px solid ${LINE}` }}>
                <h3 className="text-[11px] font-medium uppercase tracking-[0.18em] mb-3" style={{ color: INK }}>
                  Description
                </h3>
                <p>{product.description}</p>
              </div>
            )}

            <div className="h-4 sm:h-0" />
          </div>
        </div>

        {/* Reviews */}
        {reviews?.length > 0 && (
          <div className="mt-20 sm:mt-28">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] mb-8" style={{ color: INK }}>
              Customer Reviews
            </h2>
            <div className="grid sm:grid-cols-2 gap-x-12 gap-y-8">
              {reviews.map((r) => (
                <div key={r._id} className="pt-5" style={{ borderTop: `1px solid ${LINE}` }}>
                  <div className="flex items-center gap-1 mb-2 text-xs" style={{ color: INK_SOFT }}>
                    <Star size={12} strokeWidth={1.5} style={{ fill: PEACH, color: PEACH }} />
                    <span style={{ color: INK }}>{r.rating}</span>
                    {r.isVerifiedPurchase && (
                      <span className="ml-1" style={{ color: NEUTRAL }}>· Verified purchase</span>
                    )}
                  </div>

                  <p className={`${display.className} text-sm leading-relaxed`} style={{ color: INK }}>
                    {r.comment}
                  </p>

                  {/* Review images — only rendered when present */}
                  {r.images?.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {r.images.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setLightboxImg(img)}
                          className="relative w-14 h-14 overflow-hidden shrink-0"
                          style={{ borderRadius: '3px', background: PEACH_WASH }}
                        >
                          <Image src={img} alt="" fill className="object-cover" sizes="56px" />
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="text-xs mt-3" style={{ color: INK_SOFT }}>{r.customerName}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related */}
        {related?.length > 0 && (
          <div className="mt-20 sm:mt-28">
            <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] mb-8" style={{ color: INK }}>
              You may also like
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-10">
              {related.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Sticky mobile buy bar — portaled directly to <body> so no ancestor
          can break its fixed positioning. */}
      {mounted && data?.product && createPortal(
        <div
          className="sm:hidden fixed bottom-0 left-0 right-0 flex items-center gap-3 px-5 py-3"
          style={{ background: PAPER, borderTop: `1px solid ${LINE}`, zIndex: 9999 }}
        >
          <div className="shrink-0">
            <p className="text-base font-medium leading-none" style={{ color: INK }}>
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
            className="flex-1 flex items-center justify-center gap-1.5 font-medium py-2.5 text-sm disabled:opacity-40"
            style={{ border: `1px solid ${INK}`, color: INK, background: PAPER, borderRadius: '4px' }}
          >
            <ShoppingBag size={15} /> Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={sizeOutOfStock}
            className="flex-1 flex items-center justify-center gap-1.5 font-medium py-2.5 text-sm disabled:opacity-40"
            style={{ background: PEACH, color: PAPER, borderRadius: '4px' }}
          >
            <Zap size={15} fill={PAPER} /> {sizeOutOfStock ? 'Sold out' : 'Buy now'}
          </button>
        </div>,
        document.body
      )}

      {/* Review-image lightbox — single image, closes on backdrop click or the ✕ button */}
      {mounted && lightboxImg && createPortal(
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 flex items-center justify-center p-6"
          style={{ background: 'rgba(36,27,33,0.85)', zIndex: 10000 }}
        >
          <div className="relative w-full max-w-md aspect-square" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxImg(null)}
              className="absolute -top-11 right-0 sm:-top-2 sm:-right-11 w-9 h-9 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)', color: PAPER }}
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <Image src={lightboxImg} alt="Review image" fill className="object-contain" sizes="90vw" />
          </div>
        </div>,
        document.body
      )}

      {/* Size chart modal — swipeable carousel when there's more than one
          image, closes on backdrop click or the ✕ button */}
      {mounted && sizeChartOpen && sizeChartImages.length > 0 && createPortal(
        <div
          onClick={() => setSizeChartOpen(false)}
          className="fixed inset-0 flex items-center justify-center p-6"
          style={{ background: 'rgba(36,27,33,0.85)', zIndex: 10000 }}
        >
          <div className="relative w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSizeChartOpen(false)}
              className="absolute -top-11 right-0 sm:-top-2 sm:-right-11 w-9 h-9 flex items-center justify-center rounded-full"
              style={{ background: 'rgba(255,255,255,0.15)', color: PAPER }}
              aria-label="Close size chart"
            >
              <X size={20} />
            </button>

            <div className="relative w-full aspect-square" style={{ background: PAPER, borderRadius: '4px', overflow: 'hidden' }}>
              <Image
                src={sizeChartImages[sizeChartIndex]}
                alt={`Size chart ${sizeChartIndex + 1} of ${sizeChartImages.length}`}
                fill
                className="object-contain"
                sizes="90vw"
              />

              {sizeChartImages.length > 1 && (
                <>
                  <button
                    onClick={prevSizeChart}
                    className="absolute left-0 top-0 bottom-0 w-1/4 flex items-center justify-start pl-2"
                    aria-label="Previous size chart image"
                  >
                    <ChevronLeft size={22} strokeWidth={1.5} style={{ color: INK }} />
                  </button>
                  <button
                    onClick={nextSizeChart}
                    className="absolute right-0 top-0 bottom-0 w-1/4 flex items-center justify-end pr-2"
                    aria-label="Next size chart image"
                  >
                    <ChevronRight size={22} strokeWidth={1.5} style={{ color: INK }} />
                  </button>

                  <div
                    className="absolute bottom-3 right-3 text-[11px] font-medium tracking-wide"
                    style={{ color: INK }}
                  >
                    {String(sizeChartIndex + 1).padStart(2, '0')} / {String(sizeChartImages.length).padStart(2, '0')}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}