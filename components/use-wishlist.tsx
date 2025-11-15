'use client';
import { useEffect, useState, useCallback } from 'react';

type WishlistItem = { productId: string; addedAt?: string };

export default function useWishlist(userId?: string) {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    if (!userId) {
      try {
        const local = localStorage.getItem('wishlist');
        setItems(local ? JSON.parse(local) : []);
      } catch {
        setItems([]);
      }
      return;
    }
    fetch(`/api/wishlist?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => setItems(data?.items || []))
      .catch(() => setItems([]));
  }, [userId]);

  const add = useCallback(
    async (productId: string) => {
      if (!userId) {
        const next = [...items.filter((i) => i.productId !== productId), { productId, addedAt: new Date().toISOString() }];
        setItems(next);
        localStorage.setItem('wishlist', JSON.stringify(next));
        return;
      }
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId }),
      });
      const data = await res.json();
      setItems(data.items || []);
    },
    [items, userId]
  );

  const remove = useCallback(
    async (productId: string) => {
      if (!userId) {
        const next = items.filter((i) => i.productId !== productId);
        setItems(next);
        localStorage.setItem('wishlist', JSON.stringify(next));
        return;
      }
      const res = await fetch('/api/wishlist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, productId }),
      });
      const data = await res.json();
      setItems(data.items || []);
    },
    [items, userId]
  );

  const isSaved = useCallback((productId: string) => items.some((i) => i.productId === productId), [items]);

  return { items, add, remove, isSaved, setItems };
}