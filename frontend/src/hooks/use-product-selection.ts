'use client';

import { useState, useCallback } from 'react';
import type { Product } from '@/types';

export function useProductSelection(products: Product[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === products.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(products.map((p) => p.id));
    }
  }, [products, selectedIds.length]);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const isSelected = useCallback((id: string) => selectedIds.includes(id), [selectedIds]);

  const isAllSelected = products.length > 0 && selectedIds.length === products.length;

  const selectedProducts = products.filter((p) => selectedIds.includes(p.id));

  return {
    selectedIds,
    selectedProducts,
    isSelected,
    isAllSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  };
}
