'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';
import { useCart } from './CartContext';
import CouponMarquee from './CouponMarquee';

const COFFEE = '#3E2B22';
const COFFEE_FAINT = '#9C8A7E';
const PEACH = '#D99667';
const HAIRLINE = '#EDE6DE';
const PAPER = '#FFFFFF';

const SHOP_GROUPS = [
  { key: 'bestseller', label: 'Best Sellers', qs: 'flag=bestseller' },
  { key: 'topseller', label: 'Top Sellers', qs: 'flag=topseller' },
  { key: 'newarrival', label: 'New Arrivals', qs: 'flag=newarrival' },
];

export default function Navbar() {
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [shopOpen, setShopOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileGroupOpen, setMobileGroupOpen] = useState(null);

  const closeTimer = useRef(null);

  const router = useRouter();
  const { count } = useCart();

  useEffect(() => {
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => {});
  }, []);

  // Lock background scroll while the full-screen mobile menu is open,
  // so the homepage doesn't scroll/run underneath it.
  useEffect(() => {
    if (menuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [menuOpen]);

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

  function categoryHref(slug, qs) {
    return `/category/${slug}?${qs}`;
  }

  function closeMobileMenu() {
    setMenuOpen(false);
    setMobileGroupOpen(null);
  }

  return (
    <>
      <CouponMarquee />

      <header className="sticky top-0 z-50" style={{ background: PAPER, borderBottom: `1px solid ${HAIRLINE}` }}>
        <div className="max-w-7xl mx-auto px-6">
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

                <div className="relative" onMouseEnter={openShop} onMouseLeave={scheduleCloseShop}>
                  <button
                    className="text-[13px] font-normal tracking-[1.5px] uppercase transition-colors"
                    style={{ color: shopOpen ? PEACH : COFFEE }}
                  >
                    Shop
                  </button>

                  {shopOpen && categories.length > 0 && (
                    <div className="absolute left-0 top-full pt-5" style={{ width: '620px' }}>
                      <div
                        style={{ background: PAPER, borderTop: `1px solid ${COFFEE}` }}
                        className="py-6 px-6 grid grid-cols-3 gap-8"
                      >
                        {SHOP_GROUPS.map((group) => (
                          <div key={group.key}>
                            <div
                              className="text-[11px] font-semibold tracking-[1.5px] uppercase mb-3 pb-2"
                              style={{ color: COFFEE, borderBottom: `1px solid ${HAIRLINE}` }}
                            >
                              {group.label}
                            </div>
                            <div className="flex flex-col gap-1">
                              {categories.map((c) => (
                                <Link
                                  key={c._id}
                                  href={categoryHref(c.slug, group.qs)}
                                  onClick={() => setShopOpen(false)}
                                  className="py-1.5 text-[13px] tracking-wide transition-colors"
                                  style={{ color: COFFEE_FAINT }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = COFFEE)}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = COFFEE_FAINT)}
                                >
                                  {c.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </nav>
            </div>

            {/* Center: logo */}
            <Link href="/" className="flex items-center justify-self-center">
              <div className="relative w-28 h-28 sm:w-36 sm:h-36">
                <Image src="/logo.png" alt="Tirupur Clothing Hub" fill className="object-contain" priority />
              </div>
            </Link>

            {/* Right: search + cart */}
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
        </div>
      </header>

      {/* Mobile menu — full-screen overlay, not inline, so the homepage
          doesn't sit (or scroll) behind it while open. */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60] flex flex-col"
          style={{ background: PAPER }}
        >
          {/* Overlay header: logo + close button, mirrors the main header height */}
          <div
            className="flex items-center justify-between px-6 py-4"
            style={{ borderBottom: `1px solid ${HAIRLINE}` }}
          >
            <div className="relative w-16 h-16">
              <Image src="/logo.png" alt="Tirupur Clothing Hub" fill className="object-contain" />
            </div>
            <button
              className="p-2 -mr-2"
              style={{ color: COFFEE }}
              onClick={closeMobileMenu}
              aria-label="Close menu"
            >
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>

          {/* Scrollable menu body — only this area scrolls, page behind stays fixed */}
          <nav className="flex-1 overflow-y-auto flex flex-col px-6 py-2">
            <Link
              href="/"
              onClick={closeMobileMenu}
              className="py-3.5 text-[14px] tracking-[1.5px] uppercase"
              style={{ color: COFFEE, borderBottom: `1px solid ${HAIRLINE}` }}
            >
              Home
            </Link>

            <div
              className="py-3.5 text-[14px] tracking-[1.5px] uppercase"
              style={{ color: COFFEE, borderBottom: `1px solid ${HAIRLINE}` }}
            >
              Shop
            </div>

            {SHOP_GROUPS.map((group) => (
              <div key={group.key} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                <button
                  className="w-full flex items-center justify-between py-3 pl-3 text-[13px] tracking-wide uppercase"
                  style={{ color: mobileGroupOpen === group.key ? PEACH : COFFEE_FAINT }}
                  onClick={() => setMobileGroupOpen((v) => (v === group.key ? null : group.key))}
                >
                  {group.label}
                  <ChevronDown
                    size={14}
                    strokeWidth={1.5}
                    style={{
                      transform: mobileGroupOpen === group.key ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 150ms ease',
                    }}
                  />
                </button>

                {mobileGroupOpen === group.key && (
                  <div className="flex flex-col pb-3">
                    {categories.map((c) => (
                      <Link
                        key={c._id}
                        href={categoryHref(c.slug, group.qs)}
                        onClick={closeMobileMenu}
                        className="py-2.5 pl-6 text-[13px] tracking-wide"
                        style={{ color: COFFEE_FAINT }}
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}