'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Filters from '@/components/Filters';

// A URL `flag` (set by Navbar's Shop links) maps to a dropdown value where
// one exists, so arriving via "Best Sellers" pre-selects the matching option.
// 'topseller' has no dropdown equivalent, so it falls back to "Newest" shown
// — the flag itself is tracked separately below and still applied.
function flagToSortValue(flag) {
  if (flag === 'bestseller') return 'bestselling';
  if (flag === 'newarrival') return 'newarrival';
  return 'newest';
}

// The dropdown's real API sort field — 'newarrival'/'bestselling' aren't
// actual sort keys the API knows, they're shortcuts for a flag + a sort.
function sortToApiSort(sort) {
  if (sort === 'newarrival') return 'newest';
  if (sort === 'bestselling') return 'popular';
  return sort;
}

export default function CategoryPage() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const urlFlag = searchParams.get('flag'); // bestseller | topseller | newarrival | null

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState(flagToSortValue(urlFlag));
  const [flag, setFlag] = useState(urlFlag);
  const [loading, setLoading] = useState(true);

  // Navigating here via a new Shop link (slug or flag changes) re-syncs both
  // the dropdown and the active flag from the URL.
  useEffect(() => {
    setSort(flagToSortValue(urlFlag));
    setFlag(urlFlag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, urlFlag]);

  // Manually changing the dropdown sets flag to match "New Arrival" /
  // "Best Selling", or clears it for a plain sort (including replacing
  // a "topseller" view reached via the nav link, since it has no dropdown slot).
  function handleSortChange(value) {
    setSort(value);
    if (value === 'newarrival') setFlag('newarrival');
    else if (value === 'bestselling') setFlag('bestseller');
    else setFlag(null);
  }

  const load = useCallback(async () => {
    setLoading(true);
    const catRes = await fetch(`/api/categories/${slug}`);
    const catData = await catRes.json();
    setCategory(catData.category);

    const params = new URLSearchParams({
      category: slug,
      sort: sortToApiSort(sort),
      limit: '1000',
    });
    if (flag) params.set('flag', flag);

    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products || []);

    setLoading(false);
  }, [slug, sort, flag]);

  useEffect(() => {
    load();
  }, [load]);

  const heading =
    flag === 'bestseller' ? `Best Sellers${category?.name ? ` in ${category.name}` : ''}` :
    flag === 'topseller' ? `Top Sellers${category?.name ? ` in ${category.name}` : ''}` :
    flag === 'newarrival' ? `New Arrivals${category?.name ? ` in ${category.name}` : ''}` :
    category?.name || 'Products';

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
          {heading}
        </h1>

        {category?.description && (
          <p className="text-sm mt-1.5 text-neutral-500">{category.description}</p>
        )}
      </div>

      <Filters sort={sort} onSortChange={handleSortChange} />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-pink-50 border border-neutral-100 animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-4xl">🛍️</span>
          <p className="mt-3 text-base font-medium text-neutral-900">No products found in this category yet.</p>
          <p className="text-sm mt-1 text-neutral-400">Check back soon — new arrivals every week!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}