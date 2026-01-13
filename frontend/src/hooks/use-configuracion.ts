'use client';

import { useState, useEffect, useCallback } from 'react';
import { configuracionService, ConfiguracionAcceso, ActualizarConfiguracionDto } from '@/services/configuracion.service';
import { toast } from 'sonner';

export function useConfiguracion() {
  const [configuracion, setConfiguracion] = useState<ConfiguracionAcceso | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const cargarConfiguracion = useCallback(async () => {
    try {
      setLoading(true);
      const data = await configuracionService.obtenerConfiguracion();
      setConfiguracion(data);
    } catch (error) {
      console.error('Error al cargar configuración:', error);
      toast.error('Error al cargar la configuración del sistema');
    } finally {
      setLoading(false);
    }
  }, []);

  const actualizarConfiguracion = useCallback(async (dto: ActualizarConfiguracionDto) => {
    try {
      setSaving(true);
      const result = await configuracionService.actualizarConfiguracion(dto);
      if (result.success) {
        toast.success(result.message);
        await cargarConfiguracion();
      } else {
        toast.error(result.message);
      }
      return result;
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      toast.error('Error al actualizar la configuración');
      return { success: false, message: 'Error al actualizar' };
    } finally {
      setSaving(false);
    }
  }, [cargarConfiguracion]);

  useEffect(() => {
    cargarConfiguracion();
  }, [cargarConfiguracion]);

  return {
    configuracion,
    loading,
    saving,
    cargarConfiguracion,
    actualizarConfiguracion,
  };
}

export function useVerificarAcceso() {
  const [acceso, setAcceso] = useState<{ permitido: boolean; mensaje?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verificar = async () => {
      try {
        const result = await configuracionService.verificarAcceso();
        setAcceso(result);
      } catch (error) {
        console.error('Error al verificar acceso:', error);
        setAcceso({ permitido: true }); // Por defecto permitir si hay error
      } finally {
        setLoading(false);
      }
    };
    verificar();
  }, []);

  return { acceso, loading };
}
