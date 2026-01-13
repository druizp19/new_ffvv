import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ISolicitudRepository } from '../../domain/repositories/solicitud.repository.interface';
import { SOLICITUD_REPOSITORY } from '../../domain/repositories/solicitud.repository.interface';
import { SolicitudesGateway } from '../../infrastructure/gateways/solicitudes.gateway';

export interface RechazarSolicitudResult {
  success: boolean;
  message: string;
}

@Injectable()
export class RechazarSolicitudUseCase {
  constructor(
    @Inject(SOLICITUD_REPOSITORY)
    private readonly solicitudRepository: ISolicitudRepository,
    private readonly solicitudesGateway: SolicitudesGateway,
  ) {}

  async execute(
    id: number,
    aprobadorEmail: string,
    comentario?: string,
  ): Promise<RechazarSolicitudResult> {
    const solicitud = await this.solicitudRepository.findById(id);

    if (!solicitud) {
      throw new NotFoundException('Solicitud no encontrada');
    }

    if (solicitud.estado !== 'PENDIENTE') {
      return {
        success: false,
        message: `La solicitud ya fue ${solicitud.estado.toLowerCase()}`,
      };
    }

    const solicitudRechazada = solicitud.rechazar(aprobadorEmail, comentario);
    await this.solicitudRepository.update(solicitudRechazada);

    // Emitir evento WebSocket
    const updatedSolicitud = await this.solicitudRepository.findById(id);
    this.solicitudesGateway.emitSolicitudActualizada(updatedSolicitud);
    
    // Actualizar contador
    const count = await this.solicitudRepository.countPendientes();
    this.solicitudesGateway.emitContadorActualizado(count);

    return {
      success: true,
      message: 'Solicitud rechazada correctamente',
    };
  }
}
