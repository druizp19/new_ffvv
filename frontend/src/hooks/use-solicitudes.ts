'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { solicitudService, socketService, type Solicitud, type EstadoSolicitud } from '@/services';

export function useSolicitudes(estadoFilter?: EstadoSolicitud) {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const fetchSolicitudes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await solicitudService.getSolicitudes(estadoFilter);
      setSolicitudes(data);
    } catch (error) {
      console.error('Error fetching solicitudes:', error);
      toast.error('Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  }, [estadoFilter]);

  // Carga inicial y conexión WebSocket
  useEffect(() => {
    fetchSolicitudes();
    socketService.connect();

    return () => {
      // No desconectamos aquí porque otros componentes pueden estar usando el socket
    };
  }, [fetchSolicitudes]);

  // Escuchar eventos WebSocket
  useEffect(() => {
    const unsubNueva = socketService.onNuevaSolicitud((solicitud) => {
      // Solo agregar si coincide con el filtro actual
      if (!estadoFilter || solicitud.estado === estadoFilter) {
        setSolicitudes((prev) => {
          // Evitar duplicados
          if (prev.some((s) => s.id === solicitud.id)) return prev;
          return [solicitud, ...prev];
        });
        toast.info('Nueva solicitud recibida', {
          description: `${solicitud.solicitanteNombre} - ${solicitud.tipoOperacion}`,
        });
      }
    });

    const unsubActualizada = socketService.onSolicitudActualizada((solicitud) => {
      setSolicitudes((prev) => {
        // Si el filtro no coincide, remover la solicitud
        if (estadoFilter && solicitud.estado !== estadoFilter) {
          return prev.filter((s) => s.id !== solicitud.id);
        }
        // Actualizar la solicitud existente
        return prev.map((s) => (s.id === solicitud.id ? solicitud : s));
      });
    });

    return () => {
      unsubNueva();
      unsubActualizada();
    };
  }, [estadoFilter]);

  const aprobar = useCallback(async (id: number, comentario?: string) => {
    setProcessing(true);
    try {
      const result = await solicitudService.aprobar(id, comentario);
      if (result.success) {
        toast.success('Solicitud aprobada', { description: result.message });
        // No necesitamos refetch, el WebSocket actualizará la lista
      } else {
        toast.error('Error', { description: result.message });
      }
      return result;
    } catch {
      toast.error('Error de conexión');
      return { success: false, message: 'Error de conexión' };
    } finally {
      setProcessing(false);
    }
  }, []);

  const rechazar = useCallback(async (id: number, comentario?: string) => {
    setProcessing(true);
    try {
      const result = await solicitudService.rechazar(id, comentario);
      if (result.success) {
        toast.success('Solicitud rechazada', { description: result.message });
        // No necesitamos refetch, el WebSocket actualizará la lista
      } else {
        toast.error('Error', { description: result.message });
      }
      return result;
    } catch {
      toast.error('Error de conexión');
      return { success: false, message: 'Error de conexión' };
    } finally {
      setProcessing(false);
    }
  }, []);

  return {
    solicitudes,
    loading,
    processing,
    refetch: fetchSolicitudes,
    aprobar,
    rechazar,
  };
}

export function usePendingCount() {
  const [count, setCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const pendingCount = await solicitudService.countPendientes();
      setCount(pendingCount);
    } catch {
      // Silently fail - user might not have permission
    }
  }, []);

  useEffect(() => {
    fetchCount();
    socketService.connect();

    // Escuchar actualizaciones del contador via WebSocket
    const unsub = socketService.onContadorActualizado((data) => {
      setCount(data.count);
    });

    return () => {
      unsub();
    };
  }, [fetchCount]);

  return { count, refetch: fetchCount };
}
