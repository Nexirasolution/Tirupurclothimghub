'use client';

import { useCart } from './CartContext';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Zap } from 'lucide-react';

export default function AddComboButton({ combo }) {
  const { addItem } = useCart();
  const router = useRouter();

  const item = {
    productId: combo._id,
    variantId: 'combo',
    comboId: combo._id,
    name: combo.name,
    image: combo.image,
    color: '-',
    size: 'Combo',
    price: combo.comboPrice,
    qty: 1,
  };

  function handleAddToCart() {
    addItem(item);
  }

  function handleBuyNow() {
    addItem(item);
    router.push('/checkout');
  }

  return (
    <div className="flex flex-col gap-3 mt-6">
      <button
        onClick={handleBuyNow}
        className="w-full flex items-center justify-center gap-2 text-white font-medium py-3.5 rounded-full transition-colors active:scale-95 bg-pink-600 hover:bg-pink-700"
      >
        <Zap size={18} fill="white" />
        Buy Now
      </button>

      <button
        onClick={handleAddToCart}
        className="w-full flex items-center justify-center gap-2 font-medium py-3 rounded-full active:scale-95 transition-colors border border-pink-600 text-pink-600 bg-white hover:bg-pink-50"
      >
        <ShoppingBag size={17} />
        Add to Cart
      </button>
    </div>
  );
}