'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ListTree, ShoppingCart, Boxes, Image as ImageIcon,
  Clapperboard, Star, Ticket, Layers, FileBarChart, Settings as SettingsIcon, Menu, X, LogOut
} from 'lucide-react';

// SSRK Brand Colors
// Crimson : #8B0000
// Gold    : #C9A84C
// Cream   : #fdf5f5

const NAV = [
  { href: '/admin',            label: 'Dashboard',     icon: LayoutDashboard },
  { href: '/admin/products',   label: 'Products',      icon: Package },
  { href: '/admin/categories', label: 'Categories',    icon: ListTree },
  { href: '/admin/orders',     label: 'Orders',        icon: ShoppingCart },
  { href: '/admin/inventory',  label: 'Inventory',     icon: Boxes },
  { href: '/admin/combos',     label: 'Combo Offers',  icon: Layers },
  { href: '/admin/banners',    label: 'Banners',       icon: ImageIcon },
  { href: '/admin/reels',      label: 'Shop by Reels', icon: Clapperboard },
  { href: '/admin/reviews',    label: 'Reviews',       icon: Star },
  { href: '/admin/coupons',    label: 'Coupons',       icon: Ticket },
  { href: '/admin/reports',    label: 'Sales Reports', icon: FileBarChart },
  { href: '/admin/settings',   label: 'Settings',      icon: SettingsIcon },
];

export default function AdminShell({ admin, children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  }

  return (
    <div className="min-h-screen flex" style={{ background: '#fdf5f5' }}>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(139,0,0,0.35)' }}
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static z-50 inset-y-0 left-0 w-64 transform transition-transform lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: '#8B0000',
          borderRight: '3px solid #C9A84C',
        }}
      >
        {/* Sidebar header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.35)' }}
        >
          <div className="flex flex-col leading-tight">
            <span
              className="font-bold text-lg tracking-wide"
              style={{ color: '#C9A84C', fontFamily: 'Georgia, serif' }}
            >
              Mohith Trends
            </span>
            <span
              className="text-[10px] tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'sans-serif' }}
            >
              Admin Panel
            </span>
          </div>
          <button
            className="lg:hidden"
            onClick={() => setOpen(false)}
            style={{ color: '#C9A84C' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Gold ornament line */}
        <div style={{ height: '2px', background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)' }} />

        {/* Nav links */}
        <nav className="p-3 space-y-0.5 overflow-y-auto h-[calc(100vh-72px)]">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                style={
                  active
                    ? {
                        background: '#C9A84C',
                        color: '#8B0000',
                        fontFamily: 'sans-serif',
                        fontWeight: '700',
                      }
                    : {
                        color: 'rgba(255,255,255,0.8)',
                        fontFamily: 'sans-serif',
                      }
                }
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'rgba(201,168,76,0.15)';
                    e.currentTarget.style.color = '#C9A84C';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'rgba(255,255,255,0.8)';
                  }
                }}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}

          {/* Divider */}
          <div
            className="my-3"
            style={{ height: '1px', background: 'rgba(201,168,76,0.25)' }}
          />

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full transition-all"
            style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'sans-serif' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
            }}
          >
            <LogOut size={17} /> Logout
          </button>
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 min-w-0">
        {/* Mobile topbar */}
        <header
          className="lg:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3"
          style={{
            background: '#8B0000',
            borderBottom: '2px solid #C9A84C',
          }}
        >
          <button onClick={() => setOpen(true)} style={{ color: '#C9A84C' }}>
            <Menu size={22} />
          </button>
          <span
            className="font-bold text-lg tracking-wide"
            style={{ color: '#C9A84C', fontFamily: 'Georgia, serif' }}
          >
            Mohith Trends Admin
          </span>
        </header>

        <main className="p-4 sm:p-6 max-w-6xl">{children}</main>
      </div>
    </div>
  );
}