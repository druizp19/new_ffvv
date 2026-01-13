'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { productService } from '@/services';
import type { Product, Market, TipoAgrupacion, ProductData } from '@/types';

interface UseMarketActionsOptions {
  onSuccess?: () => void;
}

// Helper para mapear productos con presentación
function mapProductsToData(products: Product[]): ProductData[] {
  return products.map((p) => ({
    codigo: p.id,
    presentacion: p.presentacion,
    atc4: p.atc4?.split(' - ')[0] || '',
    molecula: p.molecula,
    ff1: p.ff1,
    ff3: p.ff3?.split(' - ')[0] || '',
    stghVal: p.sizePack,
  }));
}

export function useMarketActions(options: UseMarketActionsOptions = {}) {
  const { onSuccess } = options;

  const [processing, setProcessing] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState('');
  const [newMarket, setNewMarket] = useState('');
  const [assignType, setAssignType] = useState<TipoAgrupacion>('PRESENTACION');
  const [comentario, setComentario] = useState('');

  const resetState = useCallback(() => {
    setSelectedMarket('');
    setNewMarket('');
    setAssignType('PRESENTACION');
    setComentario('');
  }, []);

  const openAssignModal = useCallback(() => {
    resetState();
    setIsAssignModalOpen(true);
  }, [resetState]);

  const openChangeModal = useCallback(() => {
    resetState();
    setIsChangeModalOpen(true);
  }, [resetState]);

  const openRemoveModal = useCallback(() => {
    resetState();
    setIsRemoveModalOpen(true);
  }, [resetState]);

  const openCreateModal = useCallback(() => {
    resetState();
    setIsCreateModalOpen(true);
  }, [resetState]);

  const closeModals = useCallback(() => {
    setIsAssignModalOpen(false);
    setIsChangeModalOpen(false);
    setIsRemoveModalOpen(false);
    setIsCreateModalOpen(false);
    resetState();
  }, [resetState]);

  const assignToMarket = useCallback(
    async (selectedProducts: Product[], markets: Market[], comentarioSolicitante?: string) => {
      if (!selectedMarket) return;

      setProcessing(true);
      try {
        const marketData = markets.find((m) => m.mercado === selectedMarket);
        const productos = mapProductsToData(selectedProducts);
        const tipoFinal = selectedProducts.length === 1 ? 'PRESENTACION' : assignType;

        const result = await productService.assignToMarket(
          productos,
          selectedMarket,
          marketData?.franquicia || '',
          tipoFinal,
          false,
          comentarioSolicitante,
        );

        if (result.success) {
          toast.success(result.message.includes('Pendiente') ? 'Solicitud enviada' : 'Asignación exitosa', {
            description: result.message,
          });
          closeModals();
          onSuccess?.();
        } else {
          toast.error('Error', { description: result.message });
        }
      } catch {
        toast.error('Error de conexión', { description: 'No se pudo conectar con el servidor' });
      } finally {
        setProcessing(false);
      }
    },
    [selectedMarket, assignType, closeModals, onSuccess],
  );

  const changeMarket = useCallback(
    async (selectedProducts: Product[], currentMarket: string, markets: Market[], comentarioSolicitante?: string) => {
      if (!currentMarket || !newMarket) return;

      setProcessing(true);
      try {
        const marketData = markets.find((m) => m.mercado === newMarket);
        const productos = mapProductsToData(selectedProducts);

        const result = await productService.changeMarket(
          productos,
          currentMarket,
          newMarket,
          marketData?.franquicia || '',
          comentarioSolicitante,
        );

        if (result.success) {
          toast.success(result.message.includes('Pendiente') ? 'Solicitud enviada' : 'Cambio exitoso', {
            description: result.message,
          });
          closeModals();
          onSuccess?.();
        } else {
          toast.error('Error', { description: result.message });
        }
      } catch {
        toast.error('Error de conexión', { description: 'No se pudo conectar con el servidor' });
      } finally {
        setProcessing(false);
      }
    },
    [newMarket, closeModals, onSuccess],
  );

  const removeFromMarket = useCallback(
    async (selectedProducts: Product[], mercado?: string, comentarioSolicitante?: string) => {
      setProcessing(true);
      try {
        const productos = mapProductsToData(selectedProducts);
        const result = await productService.removeFromMarket(productos, mercado, comentarioSolicitante);

        if (result.success) {
          toast.success(result.message.includes('Pendiente') ? 'Solicitud enviada' : 'Movido a RESTO', {
            description: result.message,
          });
          closeModals();
          onSuccess?.();
        } else {
          toast.error('Error', { description: result.message });
        }
      } catch {
        toast.error('Error de conexión', { description: 'No se pudo conectar con el servidor' });
      } finally {
        setProcessing(false);
      }
    },
    [closeModals, onSuccess],
  );

  const createMarket = useCallback(
    async (selectedProducts: Product[], mercado: string, franquicia: string, comentarioSolicitante?: string) => {
      if (!mercado) return;

      setProcessing(true);
      try {
        const productos = mapProductsToData(selectedProducts);
        const tipoFinal = selectedProducts.length === 1 ? 'PRESENTACION' : assignType;

        const result = await productService.assignToMarket(
          productos,
          mercado,
          franquicia,
          tipoFinal,
          true,
          comentarioSolicitante,
        );

        if (result.success) {
          toast.success(result.message.includes('Pendiente') ? 'Solicitud enviada' : 'Mercado creado', {
            description: result.message,
          });
          closeModals();
          onSuccess?.();
        } else {
          toast.error('Error', { description: result.message });
        }
      } catch {
        toast.error('Error de conexión', { description: 'No se pudo conectar con el servidor' });
      } finally {
        setProcessing(false);
      }
    },
    [assignType, closeModals, onSuccess],
  );

  return {
    processing,
    isAssignModalOpen,
    isChangeModalOpen,
    isRemoveModalOpen,
    isCreateModalOpen,
    selectedMarket,
    newMarket,
    assignType,
    comentario,
    setSelectedMarket,
    setNewMarket,
    setAssignType,
    setComentario,
    openAssignModal,
    openChangeModal,
    openRemoveModal,
    openCreateModal,
    closeModals,
    assignToMarket,
    changeMarket,
    removeFromMarket,
    createMarket,
  };
}
