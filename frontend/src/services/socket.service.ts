import { io, Socket } from 'socket.io-client';
import type { Solicitud } from './solicitud.service';

type SolicitudCallback = (solicitud: Solicitud) => void;
type ContadorCallback = (data: { count: number }) => void;

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;

  connect() {
    if (this.socket?.connected) return;

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    this.socket = io(`${backendUrl}/solicitudes`, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('🔌 WebSocket conectado');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 WebSocket desconectado');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Error de conexión WebSocket:', error.message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  onNuevaSolicitud(callback: SolicitudCallback) {
    this.socket?.on('nueva-solicitud', callback);
    return () => {
      this.socket?.off('nueva-solicitud', callback);
    };
  }

  onSolicitudActualizada(callback: SolicitudCallback) {
    this.socket?.on('solicitud-actualizada', callback);
    return () => {
      this.socket?.off('solicitud-actualizada', callback);
    };
  }

  onContadorActualizado(callback: ContadorCallback) {
    this.socket?.on('contador-actualizado', callback);
    return () => {
      this.socket?.off('contador-actualizado', callback);
    };
  }

  getConnectionStatus() {
    return this.isConnected;
  }
}

export const socketService = new SocketService();
