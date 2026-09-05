import { MapPin } from 'lucide-react';
import { Fraunces, Inter } from 'next/font/google';
import { dbConnect } from '@/lib/mongodb';
import Category from '@/models/Category';
import FooterLinks from './FooterLinks';

const display = Fraunces({ subsets: ['latin'], weight: ['400'], variable: '--font-display' });
const body = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-body' });

// Lightened palette — soft peach background with dark coffee text for contrast.
const PEACH_LIGHT = '#FBF0E7';
const PEACH_ACCENT = '#D9946A';
const COFFEE = '#3E2B22';
const COFFEE_SOFT = 'rgba(62,43,34,0.68)';
const LINE = 'rgba(62,43,34,0.14)';

async function getCategories() {
  await dbConnect();
  const categories = await Category.find({}).select('name slug').lean();
  return JSON.parse(JSON.stringify(categories));
}

export default async function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP || '918056114537';
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM ||
    'https://www.instagram.com/tirupur_clothing_hub?utm_source=qr&igsi=ZTk1em9obGZtajMx';
  const categories = await getCategories();

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'Shop', href: '/shop' },
    { label: 'Wishlist', href: '/wishlist' },
    { label: 'Contact', href: '/contact' },
  ];

  return (
    <footer className={`${body.className} mt-16`} style={{ background: PEACH_LIGHT }}>
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-12 gap-10 sm:gap-8">

        {/* Brand column */}
        <div className="sm:col-span-4">
          <h3 className={`${display.className} text-2xl leading-tight`} style={{ color: COFFEE, fontWeight: 400 }}>
            Tirupur Clothing Hub
          </h3>
          <p className="text-[11px] font-normal tracking-wide mb-4" style={{ color: PEACH_ACCENT }}>
            Wholesale &amp; Retail
          </p>

          <p className="flex items-start gap-1.5 text-xs leading-relaxed" style={{ color: COFFEE_SOFT }}>
            <MapPin size={13} className="shrink-0 mt-0.5" style={{ color: PEACH_ACCENT }} />
            127/18A Thalingikadu, Pitchampalayam Pudhur West,<br />
            Tirupur 641603
          </p>

          <p className="inline-flex items-center gap-1.5 mt-4 text-[11px] font-normal tracking-wide" style={{ color: COFFEE_SOFT }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: PEACH_ACCENT }} />
            Online sales only
          </p>
        </div>

        {/* Shop / Quick Links / Connect — accordion on mobile, columns on desktop */}
        <FooterLinks categories={categories} quickLinks={quickLinks} whatsapp={whatsapp} instagram={instagram} />
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: `1px solid ${LINE}` }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px]" style={{ color: COFFEE_SOFT }}>
            © {new Date().getFullYear()} Tirupur Clothing Hub. All rights reserved.
          </p>

          <a
            href="https://www.nexirasolution.in"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[11px] transition-opacity hover:opacity-75"
            style={{ color: COFFEE_SOFT }}
          >
            Designed and developed by
            <span className="font-medium text-[11px] tracking-wide" style={{ color: PEACH_ACCENT }}>
              Nexira Solution
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}