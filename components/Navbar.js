'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Menu, X } from 'lucide-react';
import { useCart } from './CartContext';
import CouponMarquee from './CouponMarquee';

// Design tokens — minimalist peach / coffee / white theme.
// Peach is used sparingly, as a single accent, not a fill color.
const COFFEE = '#3E2B22';       // ink — text, icons
const COFFEE_FAINT = '#9C8A7E'; // muted coffee — secondary text, hairlines
const PEACH = '#D99667';        // the one accent — active state, cart count
const HAIRLINE = '#EDE6DE';     // barely-there dividers
const PAPER = '#FFFFFF';

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const closeTimer = useRef(null);

  const router = useRouter();
  const { count } = useCart();

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  function onSearch(e) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  }

  function openShop() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setShopOpen(true);
  }
  function scheduleCloseShop() {
    closeTimer.current = setTimeout(() => setShopOpen(false), 150);
  }

  return (
    <>
      <CouponMarquee />

      <header className="sticky top-0 z-50" style={{ background: PAPER, borderBottom: `1px solid ${HAIRLINE}` }}>
        <div className="max-w-7xl mx-auto px-6">
          {/* Main nav row — [Home / Shop] ... [big centered logo] ... [search / cart] */}
          <div className="grid grid-cols-3 items-center">
            {/* Left: mobile toggle + primary links */}
            <div className="flex items-center gap-1 justify-self-start">
              <button
                className="md:hidden p-2 -ml-2"
                style={{ color: COFFEE }}
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="Menu"
              >
                {menuOpen ? <X size={20} strokeWidth={1.5} /> : <Menu size={20} strokeWidth={1.5} />}
              </button>

              <nav className="hidden md:flex items-center gap-8">
                <Link
                  href="/"
                  className="text-[13px] font-normal tracking-[1.5px] uppercase transition-colors"
                  style={{ color: COFFEE }}
                >
                  Home
                </Link>

                {/* Shop — minimal hover flyout, plain text list */}
                <div className="relative" onMouseEnter={openShop} onMouseLeave={scheduleCloseShop}>
                  <button
                    className="text-[13px] font-normal tracking-[1.5px] uppercase transition-colors"
                    style={{ color: shopOpen ? PEACH : COFFEE }}
                  >
                    Shop
                  </button>

                  {shopOpen && categories.length > 0 && (
                    <div className="absolute left-0 top-full pt-5" style={{ width: '220px' }}>
                      <div style={{ background: PAPER, borderTop: `1px solid ${COFFEE}` }} className="py-2">
                        {categories.map((c) => (
                          <Link
                            key={c._id}
                            href={`/category/${c.slug}`}
                            onClick={() => setShopOpen(false)}
                            className="block px-1 py-2 text-[13px] tracking-wide transition-colors"
                            style={{ color: COFFEE_FAINT }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = COFFEE)}
                            onMouseLeave={(e) => (e.currentTarget.style.color = COFFEE_FAINT)}
                          >
                            {c.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* Center: logo only, bigger, no wordmark */}
            <Link href="/" className="flex items-center justify-self-center">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36">
                <Image src="/logo.png" alt="Tirupur Clothing Hub" fill className="object-contain" priority />
              </div>
            </Link>

            {/* Right: search + cart, circular bordered buttons */}
            <div className="flex items-center gap-2.5 justify-self-end">
              <button
                className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
                style={{ color: COFFEE, border: `1px solid ${HAIRLINE}` }}
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Search"
              >
                <Search size={16} strokeWidth={1.5} />
              </button>

              <Link
                href="/cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-full transition-colors"
                style={{ color: COFFEE, border: `1px solid ${HAIRLINE}` }}
                aria-label="Cart"
              >
                <ShoppingBag size={16} strokeWidth={1.5} />
                {count > 0 && (
                  <span
                    className="absolute -top-1 -right-1 text-[9px] font-semibold rounded-full w-[16px] h-[16px] flex items-center justify-center text-white"
                    style={{ background: PEACH }}
                  >
                    {count}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Search — plain hairline field, no pill / fill */}
          {searchOpen && (
            <form
              onSubmit={onSearch}
              className="flex items-center gap-2 py-3 mb-1"
              style={{ borderTop: `1px solid ${HAIRLINE}` }}
            >
              <Search size={15} strokeWidth={1.5} style={{ color: COFFEE_FAINT }} />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search kurtis, nighties, innerwear..."
                className="bg-transparent outline-none w-full text-sm"
                style={{ color: COFFEE }}
              />
            </form>
          )}

          {/* Mobile menu dropdown */}
          {menuOpen && (
            <nav className="md:hidden flex flex-col py-3" style={{ borderTop: `1px solid ${HAIRLINE}` }}>
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="py-2.5 text-[13px] tracking-[1.5px] uppercase"
                style={{ color: COFFEE, borderBottom: `1px solid ${HAIRLINE}` }}
              >
                Home
              </Link>

              {categories.map((c) => (
                <Link
                  key={c._id}
                  href={`/category/${c.slug}`}
                  onClick={() => setMenuOpen(false)}
                  className="py-2.5 text-[13px] tracking-wide"
                  style={{ color: COFFEE_FAINT, borderBottom: `1px solid ${HAIRLINE}` }}
                >
                  {c.name}
                </Link>
              ))}
            </nav>
          )}
        </div>
      </header>
    </>
  );
}