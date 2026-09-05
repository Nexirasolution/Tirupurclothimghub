'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import Filters from '@/components/Filters';

function flagToSortValue(flag) {
  if (flag === 'bestseller') return 'bestselling';
  if (flag === 'newarrival') return 'newarrival';
  return 'newest';
}

function sortToApiSort(sort) {
  if (sort === 'newarrival') return 'newest';
  if (sort === 'bestselling') return 'popular';
  return sort;
}

export default function CategoryPage() {
  const { slug } = useParams();
  const searchParams = useSearchParams();
  const urlFlag = searchParams.get('flag');

  const [category, setCategory] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [sort, setSort] = useState(flagToSortValue(urlFlag));
  const [flag, setFlag] = useState(urlFlag);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSort(flagToSortValue(urlFlag));
    setFlag(urlFlag);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, urlFlag]);

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
    setSubcategories(catData.subcategories || []);

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

      {/* Back-to-parent breadcrumb, for when we're viewing a subcategory */}
      {category?.parent && (
        <Link
          href={`/category/${category.parent.slug}`}
          className="text-sm text-neutral-500 hover:text-neutral-800 inline-flex items-center gap-1 mb-3"
        >
          ← {category.parent.name}
        </Link>
      )}

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">
          {heading}
        </h1>

        {category?.description && (
          <p className="text-sm mt-1.5 text-neutral-500">{category.description}</p>
        )}
      </div>

      {/* Subcategory nav — only shown on a main category that has children */}
      {subcategories.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 mb-6 -mx-1 px-1">
          {subcategories.map((sub) => (
            <Link
              key={sub._id}
              href={`/category/${sub.slug}`}
              className="flex-shrink-0 w-28 flex flex-col items-center gap-2 group"
            >
              <div className="w-24 h-24 rounded-full overflow-hidden bg-pink-50 border border-neutral-100">
                {sub.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={sub.image}
                    alt={sub.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                )}
              </div>
              <span className="text-xs font-medium text-neutral-700 text-center leading-tight">
                {sub.name}
              </span>
            </Link>
          ))}
        </div>
      )}

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