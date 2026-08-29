'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function Filters({ sort, onSortChange }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (value) => {
    if (typeof onSortChange === 'function') {
      onSortChange(value);
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.set('sort', value);
      params.set('page', '1');
      router.push(`${pathname}?${params.toString()}`);
    }
  };

  return (
    <div className="flex items-center justify-end py-3 px-4 bg-white border-b border-neutral-100">
      {/* Sort */}
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-[11px] font-semibold tracking-wide uppercase text-neutral-400">
          Sort
        </span>
        <select
          value={sort}
          onChange={(e) => handleChange(e.target.value)}
          className="text-[11.5px] font-medium rounded-full px-3 py-1 outline-none border border-neutral-200 text-neutral-700 bg-white transition-colors focus:border-pink-300"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23DB2777' stroke-width='2.5'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
            paddingRight: '28px',
            appearance: 'none',
          }}
        >
          <option value="newest">Newest</option>
          <option value="priceLow">Price: Low to High</option>
          <option value="priceHigh">Price: High to Low</option>
          <option value="popular">Most Popular</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>
    </div>
  );
}