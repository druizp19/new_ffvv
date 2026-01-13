'use client';

import { Suspense } from 'react';
import {
  Loader2,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  ArrowRightLeft,
  Trash2,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useProducts, useMarkets, useProductSelection, useMarketActions } from '@/hooks';
import {
  ProductTable,
  ProductFiltersSheet,
  AssignMarketModal,
  ChangeMarketModal,
  RemoveMarketModal,
  CreateMarketModal,
} from './components';

function ProductsContent() {
  const {
    products,
    loading,
    total,
    page,
    totalPages,
    search,
    filters,
    activeFiltersCount,
    setPage,
    setSearch,
    setFilters,
    applyFilters,
    clearFilters,
    refetch,
  } = useProducts();

  const { markets, refetch: refetchMarkets } = useMarkets();

  const {
    selectedIds,
    selectedProducts,
    isSelected,
    isAllSelected,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
  } = useProductSelection(products);

  const marketActions = useMarketActions({
    onSuccess: () => {
      clearSelection();
      refetch();
      refetchMarkets();
    },
  });

  return (
    <div className="flex flex-col h-full w-full gap-5 animate-in fade-in duration-500 overflow-hidden relative">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl text-slate-900">Catalogo de Productos</h1>
          <p className="text-sm text-slate-500">Gestion Estrategica de Mercado</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Action Buttons */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-1 bg-white border border-slate-200 px-3 py-1.5 rounded-lg mr-2">
              <span className="text-sm text-slate-600 pr-2 border-r border-slate-200 mr-2">
                {selectedIds.length} sel.
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-slate-700 gap-1.5 px-2"
                onClick={marketActions.openAssignModal}
              >
                <Plus className="h-3.5 w-3.5 text-emerald-500" />
                Asignar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-slate-700 gap-1.5 px-2"
                onClick={marketActions.openChangeModal}
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-blue-500" />
                Cambiar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-slate-700 gap-1.5 px-2"
                onClick={marketActions.openRemoveModal}
              >
                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                Quitar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-slate-700 gap-1.5 px-2"
                onClick={marketActions.openCreateModal}
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                Crear
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-slate-400"
                onClick={clearSelection}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por presentacion..."
              className="pl-10 h-10 text-sm border-slate-200 bg-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Filters */}
          <ProductFiltersSheet
            filters={filters}
            activeFiltersCount={activeFiltersCount}
            onFiltersChange={setFilters}
            onApply={applyFilters}
            onClear={clearFilters}
          />

          {/* Pagination */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-lg ml-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center px-3 min-w-[100px] justify-center text-sm text-slate-600">
              {page} de {totalPages || 1}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || loading || total === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 min-h-0 bg-white rounded-lg border border-slate-200 overflow-hidden flex flex-col relative">
        <ProductTable
          products={products}
          loading={loading}
          isSelected={isSelected}
          isAllSelected={isAllSelected}
          onToggleSelect={toggleSelect}
          onToggleSelectAll={toggleSelectAll}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-2 shrink-0">
        <div className="flex items-center gap-4">
          <p className="text-xs text-slate-500">
            Registros: <span className="text-slate-700">{total.toLocaleString()}</span>
          </p>
          <p className="text-xs text-slate-500">
            Pagina: <span className="text-slate-700">{page}</span> de{' '}
            <span className="text-slate-700">{totalPages}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-slate-400">
          <CheckCircle2 className="h-3 w-3 text-emerald-500" />
          <span className="text-xs text-slate-500">Sincronizado</span>
        </div>
      </div>

      {/* Modals */}
      <AssignMarketModal
        open={marketActions.isAssignModalOpen}
        onOpenChange={(open: boolean) => !open && marketActions.closeModals()}
        selectedCount={selectedIds.length}
        markets={markets}
        selectedMarket={marketActions.selectedMarket}
        assignType={marketActions.assignType}
        processing={marketActions.processing}
        onMarketChange={marketActions.setSelectedMarket}
        onTypeChange={marketActions.setAssignType}
        onConfirm={(comentario?: string) => marketActions.assignToMarket(selectedProducts, markets, comentario)}
      />

      <ChangeMarketModal
        open={marketActions.isChangeModalOpen}
        onOpenChange={(open: boolean) => !open && marketActions.closeModals()}
        selectedCount={selectedIds.length}
        markets={markets}
        currentMarket={selectedProducts[0]?.mercado || ''}
        currentFranquicia={
          markets.find((m) => m.mercado === selectedProducts[0]?.mercado)?.franquicia || ''
        }
        newMarket={marketActions.newMarket}
        processing={marketActions.processing}
        onNewMarketChange={marketActions.setNewMarket}
        onConfirm={(comentario?: string) =>
          marketActions.changeMarket(selectedProducts, selectedProducts[0]?.mercado || '', markets, comentario)
        }
      />

      <RemoveMarketModal
        open={marketActions.isRemoveModalOpen}
        onOpenChange={(open: boolean) => !open && marketActions.closeModals()}
        selectedCount={selectedIds.length}
        processing={marketActions.processing}
        onConfirm={(comentario?: string) => marketActions.removeFromMarket(selectedProducts, filters.mercado, comentario)}
      />

      <CreateMarketModal
        open={marketActions.isCreateModalOpen}
        onOpenChange={(open: boolean) => !open && marketActions.closeModals()}
        selectedCount={selectedIds.length}
        assignType={marketActions.assignType}
        processing={marketActions.processing}
        onTypeChange={marketActions.setAssignType}
        onConfirm={(mercado: string, franquicia: string, comentario?: string) =>
          marketActions.createMarket(selectedProducts, mercado, franquicia, comentario)
        }
      />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <Loader2 className="animate-spin" />
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}