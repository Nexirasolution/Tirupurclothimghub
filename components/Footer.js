import Link from 'next/link';
import { MapPin, Instagram } from 'lucide-react';
import { Fraunces, Inter } from 'next/font/google';
import { dbConnect } from '@/lib/mongodb';
import Category from '@/models/Category';

const display = Fraunces({ subsets: ['latin'], weight: ['400'], variable: '--font-display' });
const body = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-body' });

const PEACH = '#D9946A';
const COFFEE_LIGHT = '#E4C4A1';
const WHITE = '#FFFFFF';
const WHITE_SOFT = 'rgba(255,255,255,0.72)';
const LINE = 'rgba(255,255,255,0.22)';

// Actual WhatsApp glyph (brand mark) — lucide's MessageCircle is a generic
// chat bubble, not the real logo, so this is an inline SVG instead.
function WhatsAppIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.36.101 11.943c0 2.105.549 4.16 1.595 5.974L0 24l6.223-1.633a11.9 11.9 0 005.822 1.485h.005c6.582 0 11.94-5.36 11.943-11.943a11.87 11.87 0 00-3.473-8.46" />
    </svg>
  );
}

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

  return (
    <footer className={`${body.className} mt-16`} style={{ background: PEACH }}>
      <div className="max-w-7xl mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-12 gap-10 sm:gap-8">

        {/* Brand column */}
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

          {/* Social — WhatsApp + Instagram, same outline-circle treatment */}
          <div className="flex gap-2 mb-5">
            
             <a href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp"
              className="flex items-center justify-center w-9 h-9 rounded-full transition-opacity hover:opacity-75"
              style={{ background: 'transparent', border: `1px solid ${LINE}`, color: WHITE }}
            >
              <WhatsAppIcon size={16} />
            </a>
            
             <a href={instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex items-center justify-center w-9 h-9 rounded-full transition-opacity hover:opacity-75"
              style={{ background: 'transparent', border: `1px solid ${LINE}`, color: WHITE }}
            >
              <Instagram size={16} strokeWidth={1.75} />
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

          
           <a href="https://www.nexirasolution.in"
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