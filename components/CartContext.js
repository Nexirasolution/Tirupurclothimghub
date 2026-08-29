'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext(null);
const STORAGE_KEY = 'lb_cart_v1';

// ── Brand tokens ──────────────────────────────────────────
const PINK  = '#DB2777';
const PINK_LIGHT = '#F9A8D4';
const GREEN = '#16A34A';
const RED   = '#DC2626';

const toastBase = {
  duration: 2500,
  style: {
    fontFamily: 'inherit',
    fontSize: '13px',
    fontWeight: 600,
    color: '#171717',
    background: '#FFFFFF',
    borderRadius: '10px',
    padding: '10px 14px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    borderLeft: `3px solid ${PINK}`,
  },
};

function brandToast(message, opts = {}) {
  return toast(
    (t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span>{message}</span>
        <span style={{ fontSize: 9, color: PINK, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
          Mohith Trends
        </span>
      </div>
    ),
    { ...toastBase, ...opts }
  );
}
// ───────────────────────────────────────────────────────────────

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const addItem = useCallback((item) => {
    let blocked = false;
    let clamped = false;

    setItems((prev) => {
      const idx = prev.findIndex(
        (i) =>
          i.productId === item.productId &&
          i.variantId === item.variantId &&
          i.size === item.size &&
          i.comboId === item.comboId
      );

      const stockLimit = typeof item.stock === 'number' ? item.stock : Infinity;

      if (idx > -1) {
        const currentQty = prev[idx].qty;

        if (currentQty >= stockLimit) {
          blocked = true;
          return prev;
        }

        const desiredQty = currentQty + item.qty;
        const finalQty = Math.min(desiredQty, stockLimit);
        if (finalQty < desiredQty) clamped = true;

        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: finalQty, stock: stockLimit };
        return copy;
      }

      if (stockLimit <= 0) {
        blocked = true;
        return prev;
      }

      const finalQty = Math.min(item.qty, stockLimit);
      if (finalQty < item.qty) clamped = true;
      return [...prev, { ...item, qty: finalQty }];
    });

    if (blocked) {
      brandToast('Sorry, this item is out of stock', {
        icon: '⚠️',
        style: { ...toastBase.style, borderLeftColor: RED },
      });
      return;
    }

    if (clamped) {
      brandToast('Only limited stock available — quantity adjusted', {
        icon: '⚠️',
        style: { ...toastBase.style, borderLeftColor: PINK_LIGHT },
      });
      return;
    }

    brandToast('Added to cart', {
      icon: '✓',
      style: { ...toastBase.style, borderLeftColor: PINK },
    });
  }, []);

  const updateQty = useCallback((key, qty) => {
    setItems((prev) =>
      prev.map((i) => {
        if (cartKey(i) !== key) return i;
        const max = typeof i.stock === 'number' ? i.stock : Infinity;
        const nextQty = Math.max(1, Math.min(qty, max));
        if (qty > max) {
          brandToast(`Only ${max} left in stock`, {
            icon: '⚠️',
            style: { ...toastBase.style, borderLeftColor: PINK_LIGHT },
          });
        }
        return { ...i, qty: nextQty };
      })
    );
  }, []);

  const removeItem = useCallback((key) => {
    setItems((prev) => prev.filter((i) => cartKey(i) !== key));
    brandToast('Removed from cart', {
      icon: '🗑️',
      style: { ...toastBase.style, borderLeftColor: PINK_LIGHT },
    });
  }, []);

  const setItemStock = useCallback((key, stock) => {
    setItems((prev) =>
      prev.map((i) => {
        if (cartKey(i) !== key) return i;
        const nextQty = Math.max(1, Math.min(i.qty, stock));
        return { ...i, stock, qty: nextQty };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    brandToast('Cart cleared', {
      icon: '✕',
      style: { ...toastBase.style, borderLeftColor: GREEN },
    });
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const count    = items.reduce((s, i) => s + i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQty,
        removeItem,
        setItemStock,
        clearCart,
        subtotal,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function cartKey(i) {
  return [i.productId, i.variantId, i.size, i.comboId].filter(Boolean).join('-');
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}