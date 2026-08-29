'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ClipboardList, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import { useWishlist } from '@/components/WhishlistContext';

// Design tokens — shared with ReviewSection / BannerCarousel for a consistent system
const INK = '#241B21';
const ROSE = '#E24C6B';
const BLUSH = '#F6C9D3';
const PAPER = '#FFFFFF';

export default function BottomNav() {
  const pathname = usePathname();
  const { count: cartCount } = useCart();
  const { wishlist } = useWishlist();

  const wishlistCount = wishlist?.length || 0;

  const items = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/orders', label: 'Orders', icon: ClipboardList },
    { href: '/wishlist', label: 'Wishlist', icon: Heart, badge: wishlistCount },
    { href: '/cart', label: 'Cart', icon: ShoppingBag, badge: cartCount },
  ];

  const isActive = (href) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]"
      style={{ background: PAPER, borderTop: `1px solid ${BLUSH}` }}
    >
      <div className="flex items-stretch justify-between px-1">
        {items.map(({ href, label, icon: Icon, badge }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 pt-2.5 relative"
            >
              {active && (
                <span
                  className="absolute top-0 left-[30%] right-[30%] h-[2px]"
                  style={{ background: ROSE }}
                />
              )}

              <span className="relative">
                <Icon
                  size={20}
                  strokeWidth={active ? 2 : 1.5}
                  style={{ color: active ? ROSE : INK }}
                  fill={active && label === 'Wishlist' ? ROSE : 'none'}
                />
                {badge > 0 && (
                  <span
                    className="absolute -top-1.5 -right-2 text-white text-[8px] font-semibold leading-none rounded-full min-w-[13px] h-[13px] flex items-center justify-center px-[3px]"
                    style={{ background: ROSE, border: `1px solid ${PAPER}` }}
                  >
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </span>

              <span
                className="text-[9px] font-medium tracking-wide"
                style={{ color: active ? ROSE : INK, opacity: active ? 1 : 0.65 }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}