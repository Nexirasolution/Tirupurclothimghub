export const dynamic = 'force-dynamic';
import { dbConnect } from '@/lib/mongodb';
import Combo from '@/models/Combo';
import Image from 'next/image';
import { formatINR } from '@/lib/utils';
import AddComboButton from '@/components/AddComboButton';
import { Package, Tag, CheckCircle2, RotateCcw, Shield, Truck } from 'lucide-react';

export default async function ComboPage({ params }) {
  await dbConnect();
  const combo = await Combo.findOne({ slug: params.slug, isActive: true })
    .populate('products.product', 'name slug variants')
    .lean();

  if (!combo) {
    return <div className="max-w-3xl mx-auto px-4 py-20 text-center text-neutral-400">Combo not found.</div>;
  }

  const plain = JSON.parse(JSON.stringify(combo));
  const savings = plain.originalPrice - plain.comboPrice;
  const savingsPct = plain.originalPrice > 0 ? Math.round((savings / plain.originalPrice) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">

      {/* Urgency banner */}
      <div className="bg-pink-600 text-white text-center text-xs font-medium py-2 rounded-full mb-6">
        Limited combo offer — Save {savingsPct}% when you bundle
      </div>

      <div className="grid sm:grid-cols-2 gap-8">

        {/* Image */}
        <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-neutral-100">
          {plain.image
            ? <Image src={plain.image} alt={plain.name} fill sizes="(max-width:640px) 100vw, 50vw" className="object-cover" />
            : <div className="w-full h-full bg-pink-50" />
          }
          {savingsPct > 0 && (
            <div className="absolute top-3 left-3 bg-white text-pink-600 text-xs font-semibold px-3 py-1 rounded-full border border-pink-100">
              {savingsPct}% OFF
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <p className="text-xs font-semibold text-pink-500 uppercase tracking-widest mb-1">Exclusive Bundle</p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-neutral-900 leading-tight">{plain.name}</h1>
          <p className="text-neutral-500 text-sm mt-2 leading-relaxed">{plain.description}</p>

          {/* Pricing */}
          <div className="mt-5 bg-pink-50 rounded-xl p-4 border border-pink-100">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-semibold text-pink-600">{formatINR(plain.comboPrice)}</span>
              {plain.originalPrice > plain.comboPrice && (
                <span className="text-neutral-300 line-through text-lg mb-0.5">{formatINR(plain.originalPrice)}</span>
              )}
            </div>
            {savings > 0 && (
              <div className="flex items-center gap-1.5 mt-1.5">
                <Tag size={13} className="text-green-600" />
                <p className="text-green-600 text-sm font-medium">You save {formatINR(savings)} with this combo!</p>
              </div>
            )}
          </div>

          <div className="h-px bg-neutral-100 my-4" />

          {/* What's included */}
          <div className="mt-1">
            <div className="flex items-center gap-2 mb-3">
              <Package size={15} className="text-pink-600" />
              <h3 className="font-semibold text-sm text-neutral-900">What's included ({plain.products?.length} items)</h3>
            </div>
            <div className="space-y-2">
              {plain.products?.map((p, i) => (
                <div key={i} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-neutral-100">
                  <CheckCircle2 size={15} className="text-green-600 shrink-0" />
                  <span className="text-sm text-neutral-700 font-medium">{p.product?.name}</span>
                  {p.size && <span className="ml-auto text-xs bg-pink-50 border border-pink-100 rounded-full px-2 py-0.5 text-neutral-500">Size {p.size}</span>}
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-5">
            <AddComboButton combo={plain} />
          </div>
          <p className="text-xs text-center text-neutral-400 mt-2">
            Combo price applies automatically at checkout
          </p>
        </div>
      </div>

      {/* Trust + Policy section */}
      <div className="mt-10 grid sm:grid-cols-3 gap-4">
        <div className="border border-neutral-100 rounded-xl p-4 flex gap-3 items-start">
          <Truck size={20} className="text-pink-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-neutral-900">Free Delivery</p>
            <p className="text-xs text-neutral-400 mt-0.5">Free shipping on all combo orders across India.</p>
          </div>
        </div>
        <div className="border border-neutral-100 rounded-xl p-4 flex gap-3 items-start">
          <RotateCcw size={20} className="text-pink-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-neutral-900">7-Day Returns</p>
            <p className="text-xs text-neutral-400 mt-0.5">Not satisfied? Return within 7 days for a full refund — no questions asked.</p>
          </div>
        </div>
        <div className="border border-neutral-100 rounded-xl p-4 flex gap-3 items-start">
          <Shield size={20} className="text-pink-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-neutral-900">100% Genuine</p>
            <p className="text-xs text-neutral-400 mt-0.5">Every piece is quality-checked before dispatch. What you see is what you get.</p>
          </div>
        </div>
      </div>

      {/* Bottom reassurance */}
      <div className="mt-6 border-t border-neutral-100 pt-6 text-center">
        <p className="text-sm text-neutral-400">
          Buying individually would cost{' '}
          <span className="line-through">{formatINR(plain.originalPrice)}</span> — get this combo for just{' '}
          <span className="text-pink-600 font-semibold">{formatINR(plain.comboPrice)}</span>
        </p>
      </div>

    </div>
  );
}