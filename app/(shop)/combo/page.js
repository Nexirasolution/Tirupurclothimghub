export const dynamic = 'force-dynamic';
import { dbConnect } from '@/lib/mongodb';
import Combo from '@/models/Combo';
import Link from 'next/link';
import { formatINR } from '@/lib/utils';
import { Tag } from 'lucide-react';

async function getCombos() {
  await dbConnect();
  const combos = await Combo.find({ isActive: true }).sort({ createdAt: -1 }).lean();
  return JSON.parse(JSON.stringify(combos));
}

export default async function CombosPage() {
  const combos = await getCombos();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-[60vh]">
      <div className="flex flex-col items-center text-center mb-8">
        <span className="text-[11px] font-semibold text-pink-500 uppercase tracking-[0.2em] mb-2">
          Save More
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900">Combo Offers</h1>
        <p className="text-neutral-400 text-sm mt-1">Buy together, save together</p>
      </div>

      {combos.length === 0 ? (
        <div className="text-center py-16 text-neutral-400">
          <Tag size={36} className="mx-auto mb-2 text-pink-300" />
          <p className="text-sm">No combo offers available right now</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {combos.map((c) => {
            const savings = c.originalPrice > c.comboPrice ? c.originalPrice - c.comboPrice : 0;
            const pct = c.originalPrice > 0 ? Math.round((savings / c.originalPrice) * 100) : 0;

            return (
              <Link
                key={c._id}
                href={`/combo/${c.slug}`}
                className="group relative rounded-xl overflow-hidden border border-neutral-100 hover:border-pink-200 transition-colors"
              >
                <div className="relative w-full aspect-square overflow-hidden bg-pink-50">
                  {c.image && (
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  {pct > 0 && (
                    <div className="absolute top-2 left-2 bg-white text-pink-600 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 border border-pink-100">
                      <Tag size={9} /> {pct}% OFF
                    </div>
                  )}
                </div>

                <div className="p-3 bg-white">
                  <p className="text-sm font-medium text-neutral-900 line-clamp-1">{c.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-pink-600 font-semibold text-sm">{formatINR(c.comboPrice)}</span>
                    {savings > 0 && (
                      <span className="text-[11px] text-neutral-300 line-through">{formatINR(c.originalPrice)}</span>
                    )}
                  </div>
                  {savings > 0 && (
                    <p className="text-[11px] text-pink-500 font-medium mt-0.5">Save {formatINR(savings)}</p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}