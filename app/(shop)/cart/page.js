'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart, cartKey } from '@/components/CartContext';
import { formatINR } from '@/lib/utils';
import { Trash2, ShoppingBag } from 'lucide-react';

export default function CartPage() {
  const { items, updateQty, removeItem, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={44} className="mx-auto mb-4 text-pink-300" />
        <p className="mb-1 text-lg font-semibold text-neutral-900">Your cart is empty</p>
        <p className="mb-6 text-sm text-neutral-400">Add something beautiful from our collection!</p>
        <Link
          href="/"
          className="inline-block px-8 py-3 font-medium text-sm rounded-full bg-pink-600 text-white hover:bg-pink-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Page heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">Your Cart</h1>
      </div>

      {/* Cart items */}
      <div className="space-y-4">
        {items.map((item) => {
          const key = cartKey(item);
          return (
            <div
              key={key}
              className="flex gap-4 p-4 bg-white border border-neutral-100 rounded-xl"
            >
              {/* Product image */}
              <div className="relative shrink-0 w-20 h-24 rounded-lg overflow-hidden bg-pink-50 border border-neutral-100">
                <Image src={item.image || '/placeholder.png'} alt={item.name} fill className="object-cover" />
              </div>

              {/* Product info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-1 text-sm text-neutral-900">{item.name}</p>
                <p className="text-xs mt-0.5 text-neutral-400">
                  Color: {item.color} &nbsp;|&nbsp; Size: {item.size}
                </p>
                <p className="font-semibold mt-1 text-sm text-pink-600">{formatINR(item.price)}</p>

                {/* Qty controls + remove */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex items-center border border-neutral-200 rounded-md overflow-hidden">
                    <button
                      onClick={() => updateQty(key, item.qty - 1)}
                      className="px-2.5 py-1 text-sm font-semibold text-neutral-700 bg-white hover:bg-pink-50 transition-colors"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-sm font-medium text-neutral-900 border-x border-neutral-200">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQty(key, item.qty + 1)}
                      className="px-2.5 py-1 text-sm font-semibold text-neutral-700 bg-white hover:bg-pink-50 transition-colors"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => removeItem(key)}
                    className="text-neutral-300 hover:text-pink-600 transition-colors"
                    aria-label="Remove item"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>

              {/* Line total */}
              <p className="font-semibold shrink-0 self-start pt-1 text-sm text-neutral-900">
                {formatINR(item.price * item.qty)}
              </p>
            </div>
          );
        })}
      </div>

      {/* Subtotal card */}
      <div className="flex items-center justify-between p-5 mt-6 bg-white border border-neutral-100 rounded-xl">
        <span className="text-sm text-neutral-500">Subtotal</span>
        <span className="font-semibold text-xl text-neutral-900">{formatINR(subtotal)}</span>
      </div>

      {/* Checkout CTA */}
      <Link
        href="/checkout"
        className="block w-full text-center mt-4 py-3 font-medium text-sm rounded-full bg-pink-600 text-white hover:bg-pink-700 transition-colors"
      >
        Proceed to Checkout
      </Link>
    </div>
  );
}