'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Filters from '@/components/Filters';

export default function CategoryPage() {
  const { slug } = useParams();
  const searchParams = useSearchParams();

  // flag ('bestseller' | 'topseller' | 'newarrival' | null) comes from the
  // Shop dropdown link and stays active while the user re-sorts within that view.
  const flag = searchParams.get('flag');

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [loading, setLoading] = useState(true);

  // If the user clicks a different Shop link while already on a category
  // page (slug or flag changes), re-sync local sort from the new URL.
  useEffect(() => {
    setSort(searchParams.get('sort') || 'newest');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, flag]);

  const load = useCallback(async () => {
    setLoading(true);
    const catRes = await fetch(`/api/categories/${slug}`);
    const catData = await catRes.json();
    setCategory(catData.category);

    const params = new URLSearchParams({
      category: slug,
      sort,
      limit: '1000', // effectively "all" — no pagination
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

      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
          {heading}
        </h1>

        {category?.description && (
          <p className="text-sm mt-1.5 text-neutral-500">{category.description}</p>
        )}
      </div>

      {/* Filters */}
      <Filters sort={sort} onSortChange={setSort} />

      {/* Loading skeleton */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] rounded-xl bg-pink-50 border border-neutral-100 animate-pulse" />
          ))}
        </div>

      /* Empty state */
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="text-4xl">🛍️</span>
          <p className="mt-3 text-base font-medium text-neutral-900">No products found in this category yet.</p>
          <p className="text-sm mt-1 text-neutral-400">Check back soon — new arrivals every week!</p>
        </div>

      /* Product grid */
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