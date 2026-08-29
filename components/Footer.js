import Link from 'next/link';
import { MessageCircle, MapPin, Mail } from 'lucide-react';
import { Fraunces, Inter } from 'next/font/google';
import { dbConnect } from '@/lib/mongodb';
import Category from '@/models/Category';

// Typography — same pairing as the rest of the site: Fraunces for anything
// read as a headline, Inter for functional/UI text. Kept to a single light
// display weight and lighter body weights for a quieter, minimalist feel.
const display = Fraunces({ subsets: ['latin'], weight: ['400'], variable: '--font-display' });
const body = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-body' });

// Design tokens — peach + coffee, minimalist: a deeper, duskier peach field,
// white text and icons for clarity, and a light-coffee/latte accent used sparingly.
const PEACH = '#D9946A';       // background — deeper, duskier peach
const COFFEE_LIGHT = '#E4C4A1'; // accent — eyebrow, dot, icon, credit (light coffee/latte)
const WHITE = '#FFFFFF';        // primary text on peach
const WHITE_SOFT = 'rgba(255,255,255,0.72)'; // secondary text
const LINE = 'rgba(255,255,255,0.22)';       // hairline dividers

async function getCategories() {
  await dbConnect();
  const categories = await Category.find({}).select('name slug').lean();
  return JSON.parse(JSON.stringify(categories));
}

export default async function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP || '918056114537';
  const categories = await getCategories();

  return (
    <footer className={`${body.className} mt-16`} style={{ background: PEACH }}>
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-12 gap-10 sm:gap-8">

        {/* Brand column — given more room than the other two, so it reads
            as the anchor rather than a third equal column */}
        <div className="sm:col-span-5">
          <h3 className={`${display.className} text-2xl leading-tight`} style={{ color: WHITE, fontWeight: 400 }}>
            Tirupur Clothing Hub
          </h3>
          <p className="text-[11px] font-normal tracking-wide mb-4" style={{ color: COFFEE_LIGHT }}>
            Wholesale &amp; Retail
          </p>

          <p className="flex items-start gap-1.5 text-xs leading-relaxed" style={{ color: WHITE_SOFT }}>
            <MapPin size={13} className="shrink-0 mt-0.5" style={{ color: COFFEE_LIGHT }} />
            127/18A Thalingikadu, Pitchampalayam Pudhur West,<br />
            Tirupur 641603
          </p>

          {/* Status tag — a small dot + text instead of a pill badge */}
          <p className="inline-flex items-center gap-1.5 mt-4 text-[11px] font-normal tracking-wide" style={{ color: WHITE_SOFT }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: COFFEE_LIGHT }} />
            Online sales only
          </p>
        </div>

        {/* Shop links */}
        <div className="sm:col-span-3">
          <h4 className="font-medium mb-4 text-[11px] tracking-wide" style={{ color: WHITE_SOFT }}>
            Shop
          </h4>
          <ul className="space-y-2.5">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="text-[13px] transition-colors"
                  style={{ color: WHITE }}
                >
                  <span className="hover:opacity-70 transition-opacity">{cat.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div className="sm:col-span-4">
          <h4 className="font-medium mb-4 text-[11px] tracking-wide" style={{ color: WHITE_SOFT }}>
            Connect
          </h4>

          {/* Social — single outline circle on the dark field, kept minimal */}
          <div className="flex gap-2 mb-5">
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="flex items-center justify-center w-9 h-9 rounded-full transition-opacity hover:opacity-75"
              style={{ background: 'transparent', border: `1px solid ${LINE}`, color: WHITE }}
            >
              <MessageCircle size={16} strokeWidth={1.75} />
            </a>
            <a
              href="mailto:tirupurclothinghub2025@gmail.com"
              aria-label="Email"
              className="flex items-center justify-center w-9 h-9 rounded-full transition-opacity hover:opacity-75"
              style={{ background: 'transparent', border: `1px solid ${LINE}`, color: WHITE }}
            >
              <Mail size={16} strokeWidth={1.75} />
            </a>
          </div>

          <div className="text-xs space-y-3 leading-relaxed" style={{ color: WHITE_SOFT }}>
            <p>
              <span className="font-semibold" style={{ color: WHITE }}>WhatsApp</span><br />
              +91 80561 14537
            </p>
            <p>
              <span className="font-semibold" style={{ color: WHITE }}>Email</span><br />
              tirupurclothinghub2025@gmail.com
            </p>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: `1px solid ${LINE}` }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[11px]" style={{ color: WHITE_SOFT }}>
            © {new Date().getFullYear()} Tirupur Clothing Hub. All rights reserved.
          </p>

          <a
            href="https://www.nexirasolution.in"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-[11px] transition-opacity hover:opacity-75"
            style={{ color: WHITE_SOFT }}
          >
            Designed and developed by
            <span className="font-medium text-[11px] tracking-wide" style={{ color: COFFEE_LIGHT }}>
              Nexira Solution
            </span>
          </a>
        </div>
      </div>
    </footer>
  );
}