import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/solicitudes',
})
export class SolicitudesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(SolicitudesGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Cliente desconectado: ${client.id}`);
  }

  // Emitir cuando se crea una nueva solicitud
  emitNuevaSolicitud(solicitud: any) {
    this.logger.log(`Emitiendo nueva solicitud: ${solicitud.id}`);
    this.server.emit('nueva-solicitud', solicitud);
  }

  // Emitir cuando se actualiza una solicitud (aprobada/rechazada)
  emitSolicitudActualizada(solicitud: any) {
    this.logger.log(`Emitiendo solicitud actualizada: ${solicitud.id}`);
    this.server.emit('solicitud-actualizada', solicitud);
  }

  // Emitir actualización del contador de pendientes
  emitContadorActualizado(count: number) {
    this.logger.log(`Emitiendo contador actualizado: ${count}`);
    this.server.emit('contador-actualizado', { count });
  }
}
