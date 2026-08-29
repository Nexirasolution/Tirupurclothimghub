'use client';

import { X } from 'lucide-react';
import { formatINR } from '@/lib/utils';

export default function OrderItemModal({ item, image, categoryName, productSku, onClose }) {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-5 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-brand-magenta pr-4">{item.name}</h3>
          <button onClick={onClose} className="text-brand-ink/50 shrink-0">
            <X size={18} />
          </button>
        </div>

        {image ? (
          <img src={image} alt={item.name} className="w-full h-56 object-cover rounded-lg mb-3" />
        ) : (
          <div className="w-full h-56 bg-brand-ink/5 rounded-lg mb-3 flex items-center justify-center text-brand-ink/30 text-sm">
            No image available
          </div>
        )}

        <div className="text-sm space-y-1.5">
          {categoryName && (
            <p><span className="text-brand-ink/50">Category:</span> {categoryName}</p>
          )}
          <p><span className="text-brand-ink/50">Color:</span> {item.color || '—'}</p>
          <p><span className="text-brand-ink/50">Size:</span> {item.size || '—'}</p>
          <p><span className="text-brand-ink/50">Quantity ordered:</span> {item.qty}</p>
          <p><span className="text-brand-ink/50">Price:</span> {formatINR(item.price)} each</p>
          <p><span className="text-brand-ink/50">Subtotal:</span> {formatINR(item.price * item.qty)}</p>
          {productSku && <p><span className="text-brand-ink/50">Product SKU:</span> {productSku}</p>}
          {item.sku && <p><span className="text-brand-ink/50">Size SKU:</span> {item.sku}</p>}
        </div>
      </div>
    </div>
  );
}