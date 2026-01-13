'use client';

import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/services';
import type { Market } from '@/types';

export function useMarkets() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMarkets = useCallback(async () => {
    try {
      const data = await productService.getMarkets();
      setMarkets(data);
    } catch (error) {
      console.error('Error fetching markets:', error);
      setMarkets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarkets();
  }, [fetchMarkets]);

  return {
    markets,
    loading,
    refetch: fetchMarkets,
  };
}
