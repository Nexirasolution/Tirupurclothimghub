'use client';

import { memo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MoreVertical, Heart } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { getVariantTotalStock } from '@/lib/stock';
import { useWishlist } from '@/components/WhishlistContext'; // adjust path as needed

const COFFEE = '#3E2B22';
const COFFEE_FAINT = '#7A6A5E';
const LIGHT_PEACH = '#F6DDC0';
const PEACH_PALE = '#FBEEDD';
const PAPER = '#FFFFFF';
const FONT_SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const pillBase = { padding: '6px 14px', borderRadius: '999px' };

function ProductCard({ product, priority = false }) {
  const variant = product.variants?.[0];
  const image = variant?.images?.[0] || '/placeholder.png';
  const price = product.basePrice || variant?.price || 0;
  const compareAt = variant?.compareAtPrice || 0;
  const discountPct = compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

  const totalStock = getVariantTotalStock(variant);
  const outOfStock = totalStock <= 0;
  const lowStock = !outOfStock && totalStock <= 5;

  const wishId = product.id ?? product._id ?? product.slug;
  const { isWishlisted, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(wishId);

  const handleWishlistClick = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleWishlist(wishId);
    },
    [toggleWishlist, wishId]
  );

  return (
    <div style={{ background: PAPER, fontFamily: FONT_SANS }}>
      <Link href={`/product/${product.slug}`} prefetch={false} className="block">
        <div className="relative aspect-[3/4] overflow-hidden" style={{ background: PEACH_PALE }}>
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            quality={75}
            priority={priority}
            className={`object-cover ${outOfStock ? 'grayscale opacity-70' : ''}`}
          />

          <div className="absolute top-4 left-4">
            {outOfStock ? (
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ ...pillBase, color: PAPER, background: COFFEE_FAINT }}>
                Out of stock
              </span>
            ) : lowStock ? (
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ ...pillBase, color: PAPER, background: COFFEE }}>
                {totalStock} left
              </span>
            ) : discountPct > 0 ? (
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ ...pillBase, color: COFFEE, background: LIGHT_PEACH }}>
                Sale
              </span>
            ) : null}
          </div>

          {/* No backdrop-filter: expensive to paint across a grid on cheap phones */}
          <button
            type="button"
            onClick={handleWishlistClick}
            aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={wishlisted}
            className="absolute top-4 right-4 flex items-center justify-center w-8 h-8 rounded-full transition-transform active:scale-90"
            style={{ background: 'rgba(255,255,255,0.92)' }}
          >
            <Heart
              className="w-4 h-4"
              strokeWidth={2}
              style={{ color: wishlisted ? '#DB2777' : COFFEE }}
              fill={wishlisted ? '#DB2777' : 'none'}
            />
          </button>

          <span className="absolute bottom-3.5 right-3.5 flex items-center justify-center w-8 h-8" style={{ color: PAPER }}>
            <MoreVertical className="w-5 h-5" strokeWidth={2} />
          </span>
        </div>

        <div className="pt-4 flex items-baseline gap-3 flex-wrap">
          <span className="font-bold text-lg sm:text-xl" style={{ color: COFFEE }}>
            {formatINR(price)}
          </span>
          {compareAt > price && (
            <span className="text-sm sm:text-base line-through font-light" style={{ color: COFFEE_FAINT }}>
              {formatINR(compareAt)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}

export default memo(ProductCard);