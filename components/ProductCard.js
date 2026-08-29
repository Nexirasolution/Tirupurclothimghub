'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MoreVertical } from 'lucide-react';
import { formatINR } from '@/lib/utils';
import { getVariantTotalStock } from '@/lib/stock';

// Design tokens — matched to the site's coffee / light-peach / white theme
const COFFEE = '#3E2B22';
const COFFEE_FAINT = '#7A6A5E';
const LIGHT_PEACH = '#F6DDC0';
const PEACH_PALE = '#FBEEDD';
const PAPER = '#FFFFFF';
const FONT_SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

export default function ProductCard({ product }) {
  const variant = product.variants?.[0];
  const image = variant?.images?.[0] || '/placeholder.png';
  const price = product.basePrice || variant?.price || 0;
  const compareAt = variant?.compareAtPrice || 0;
  const discountPct = compareAt > price ? Math.round(((compareAt - price) / compareAt) * 100) : 0;

  const totalStock = getVariantTotalStock(variant);
  const outOfStock = totalStock <= 0;
  const lowStock = !outOfStock && totalStock <= 5;

  return (
    <div style={{ background: PAPER, fontFamily: FONT_SANS }}>
      <Link href={`/product/${product.slug}`} className="block">
        {/* Large image tile — sharp corners, no hover motion */}
        <div className="relative aspect-[3/4] overflow-hidden" style={{ background: PEACH_PALE }}>
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className={`object-cover ${outOfStock ? 'grayscale opacity-70' : ''}`}
          />

          {/* Single pill badge, top-left — priority: out of stock > low stock > discount */}
          <div className="absolute top-4 left-4">
            {outOfStock ? (
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: PAPER, background: COFFEE_FAINT, padding: '6px 14px', borderRadius: '999px' }}
              >
                Out of stock
              </span>
            ) : lowStock ? (
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: PAPER, background: COFFEE, padding: '6px 14px', borderRadius: '999px' }}
              >
                {totalStock} left
              </span>
            ) : discountPct > 0 ? (
              <span
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: COFFEE, background: LIGHT_PEACH, padding: '6px 14px', borderRadius: '999px' }}
              >
                Sale
              </span>
            ) : null}
          </div>

          {/* Quiet three-dot marker, bottom-right */}
          <span
            className="absolute bottom-3.5 right-3.5 flex items-center justify-center w-8 h-8"
            style={{ color: PAPER, filter: 'drop-shadow(0 1px 2px rgba(62,43,34,0.45))' }}
          >
            <MoreVertical className="w-5 h-5" strokeWidth={2} />
          </span>
        </div>

        {/* Price only — no title, no rating, no buttons */}
        <div className="pt-4 flex items-baseline gap-3 flex-wrap">
          <span
            className="font-bold text-lg sm:text-xl"
            style={{ color: COFFEE }}
          >
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