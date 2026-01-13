'use client';

import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/services';
import type { Product, ProductFilters } from '@/types';

interface UseProductsOptions {
  initialPage?: number;
  initialLimit?: number;
}

export function useProducts(options: UseProductsOptions = {}) {
  const { initialPage = 1, initialLimit = 50 } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<ProductFilters>({});
  const [appliedFilters, setAppliedFilters] = useState<ProductFilters>({});

  const limit = initialLimit;
  const totalPages = Math.ceil(total / limit);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await productService.getProducts(page, limit, debouncedSearch, appliedFilters);
      setProducts(result.data || []);
      setTotal(result.total || 0);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, appliedFilters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const applyFilters = useCallback(() => {
    setAppliedFilters({ ...filters });
    setPage(1);
  }, [filters]);

  const clearFilters = useCallback(() => {
    const cleared: ProductFilters = {};
    setFilters(cleared);
    setAppliedFilters(cleared);
    setPage(1);
  }, []);

  const activeFiltersCount = Object.values(appliedFilters).filter(Boolean).length;

  return {
    products,
    loading,
    total,
    page,
    totalPages,
    search,
    filters,
    appliedFilters,
    activeFiltersCount,
    setPage,
    setSearch,
    setFilters,
    applyFilters,
    clearFilters,
    refetch: fetchProducts,
  };
}
