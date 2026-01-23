import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ISolicitudRepository } from '../../domain/repositories/solicitud.repository.interface';
import { SOLICITUD_REPOSITORY } from '../../domain/repositories/solicitud.repository.interface';
import { SolicitudesGateway } from '../../infrastructure/gateways/solicitudes.gateway';
import { EmailService } from '../../../common/email/email.service';

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
    private readonly emailService: EmailService,
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

    // Enviar email al solicitante
    console.log('📧 [RechazarSolicitud] Enviando email al solicitante...');
    const datos = solicitud.datosSolicitud;
    const mercado = datos.mercado || datos.mercadoDestino || datos.mercadoOrigen || 'N/A';
    
    await this.emailService.sendSolicitudRechazada(
      solicitud.solicitanteEmail,
      solicitud.solicitanteNombre,
      solicitud.tipoOperacion,
      mercado,
      id,
      aprobadorEmail,
      comentario,
    );
    console.log('✅ [RechazarSolicitud] Email enviado al solicitante');

    return {
      success: true,
      message: 'Solicitud rechazada correctamente',
    };
  }
}
