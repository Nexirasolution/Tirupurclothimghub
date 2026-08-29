'use client';

import { X } from 'lucide-react';
import { formatINR } from '@/lib/utils';

// Design tokens — same white/peach minimalist system as the rest of the site.
const INK = '#241B21';
const INK_SOFT = '#9C877D';
const PEACH_WASH = '#FBE8D9';
const LINE = '#EEE3DA';
const PAPER = '#FFFFFF';

export default function OrderItemModal({ item, image, categoryName, productSku, onClose }) {
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: 'rgba(36,27,33,0.5)' }}
      onClick={onClose}
    >
      <div
        className="max-w-sm w-full p-5"
        style={{ background: PAPER, borderRadius: '6px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium pr-4" style={{ color: INK }}>{item.name}</h3>
          <button onClick={onClose} className="shrink-0" style={{ color: INK_SOFT }}>
            <X size={18} />
          </button>
        </div>

        {image ? (
          <img src={image} alt={item.name} className="w-full h-56 object-cover mb-3" style={{ borderRadius: '4px' }} />
        ) : (
          <div
            className="w-full h-56 mb-3 flex items-center justify-center text-sm"
            style={{ background: PEACH_WASH, borderRadius: '4px', color: INK_SOFT }}
          >
            No image available
          </div>
        )}

        <div className="text-sm space-y-1.5" style={{ color: INK }}>
          {categoryName && (
            <p><span style={{ color: INK_SOFT }}>Category:</span> {categoryName}</p>
          )}
          <p><span style={{ color: INK_SOFT }}>Color:</span> {item.color || '—'}</p>
          <p><span style={{ color: INK_SOFT }}>Size:</span> {item.size || '—'}</p>
          <p><span style={{ color: INK_SOFT }}>Quantity ordered:</span> {item.qty}</p>
          <p><span style={{ color: INK_SOFT }}>Price:</span> {formatINR(item.price)} each</p>
          <p><span style={{ color: INK_SOFT }}>Subtotal:</span> {formatINR(item.price * item.qty)}</p>
          {productSku && <p><span style={{ color: INK_SOFT }}>Product SKU:</span> {productSku}</p>}
          {item.sku && <p><span style={{ color: INK_SOFT }}>Size SKU:</span> {item.sku}</p>}
        </div>
      </div>
    </div>
  );
}