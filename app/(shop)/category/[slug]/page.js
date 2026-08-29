'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import Filters from '@/components/Filters';

export default function CategoryPage() {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState('newest');
  const [loading, setLoading] = useState(true);

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
    const res = await fetch(`/api/products?${params.toString()}`);
    const data = await res.json();
    setProducts(data.products || []);

    setLoading(false);
  }, [slug, sort]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
          {category?.name || 'Products'}
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