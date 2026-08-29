'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'lb_wishlist_v1';

const toastStyle = {
  fontSize: '13px',
  fontWeight: 600,
  color: '#171717',
  background: '#FFFFFF',
  borderRadius: '10px',
  padding: '10px 14px',
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  borderLeft: '3px solid #DB2777',
};

export function WishlistProvider({ children }) {
  const [wishlist, setWishlist] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setWishlist(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlist));
  }, [wishlist, loaded]);

  const addToWishlist = useCallback((productId) => {
    setWishlist((prev) => (prev.includes(productId) ? prev : [...prev, productId]));
    toast.success('Added to wishlist', { style: toastStyle });
  }, []);

  const removeFromWishlist = useCallback((productId) => {
    setWishlist((prev) => prev.filter((id) => id !== productId));
    toast('Removed from wishlist', { icon: '💔', style: { ...toastStyle, borderLeftColor: '#F9A8D4' } });
  }, []);

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  }, []);

  const isWishlisted = useCallback((productId) => wishlist.includes(productId), [wishlist]);

  return (
    <WishlistContext.Provider
      value={{ wishlist, addToWishlist, removeFromWishlist, toggleWishlist, isWishlisted }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
}