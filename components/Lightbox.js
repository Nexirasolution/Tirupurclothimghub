'use client';

import { createPortal } from 'react-dom';
import Image from 'next/image';
import { X } from 'lucide-react';

const PAPER = '#FFFFFF';

export default function Lightbox({ src, onClose }) {
  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{ background: 'rgba(36,27,33,0.85)', zIndex: 10000 }}
    >
      <div className="relative w-full max-w-md aspect-square" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute -top-11 right-0 sm:-top-2 sm:-right-11 w-9 h-9 flex items-center justify-center rounded-full"
          style={{ background: 'rgba(255,255,255,0.15)', color: PAPER }}
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <Image src={src} alt="Review image" fill className="object-contain" sizes="(max-width:640px) 90vw, 448px" />
      </div>
    </div>,
    document.body
  );
}