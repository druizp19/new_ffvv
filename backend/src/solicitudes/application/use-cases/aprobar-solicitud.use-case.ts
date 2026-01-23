import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { ISolicitudRepository } from '../../domain/repositories/solicitud.repository.interface';
import { SOLICITUD_REPOSITORY } from '../../domain/repositories/solicitud.repository.interface';
import { AssignToMarketUseCase } from '../../../products/application/use-cases/assign-to-market.use-case';
import { ChangeMarketUseCase } from '../../../products/application/use-cases/change-market.use-case';
import { RemoveFromMarketUseCase } from '../../../products/application/use-cases/remove-from-market.use-case';
import { SolicitudesGateway } from '../../infrastructure/gateways/solicitudes.gateway';
import { EmailService } from '../../../common/email/email.service';

export interface AprobarSolicitudResult {
  success: boolean;
  message: string;
  count?: number;
}

@Injectable()
export class AprobarSolicitudUseCase {
  constructor(
    @Inject(SOLICITUD_REPOSITORY)
    private readonly solicitudRepository: ISolicitudRepository,
    private readonly assignToMarketUseCase: AssignToMarketUseCase,
    private readonly changeMarketUseCase: ChangeMarketUseCase,
    private readonly removeFromMarketUseCase: RemoveFromMarketUseCase,
    private readonly solicitudesGateway: SolicitudesGateway,
    private readonly emailService: EmailService,
  ) {}

  async execute(
    id: number,
    aprobadorEmail: string,
    comentario?: string,
  ): Promise<AprobarSolicitudResult> {
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

    // Ejecutar la operación según el tipo
    const resultado = await this.ejecutarOperacion(solicitud);

    if (!resultado.success) {
      return resultado;
    }

    // Marcar como aprobada
    const solicitudAprobada = solicitud.aprobar(aprobadorEmail, comentario);
    await this.solicitudRepository.update(solicitudAprobada);

    // Emitir evento WebSocket
    const updatedSolicitud = await this.solicitudRepository.findById(id);
    this.solicitudesGateway.emitSolicitudActualizada(updatedSolicitud);
    
    // Actualizar contador
    const count = await this.solicitudRepository.countPendientes();
    this.solicitudesGateway.emitContadorActualizado(count);

    // Enviar email al solicitante
    console.log('📧 [AprobarSolicitud] Enviando email al solicitante...');
    const datos = solicitud.datosSolicitud;
    const mercado = datos.mercado || datos.mercadoDestino || datos.mercadoOrigen || 'N/A';
    const cantidadProductos = datos.productos?.length || 0;
    
    await this.emailService.sendSolicitudAprobada(
      solicitud.solicitanteEmail,
      solicitud.solicitanteNombre,
      solicitud.tipoOperacion,
      mercado,
      cantidadProductos,
      id,
      aprobadorEmail,
    );
    console.log('✅ [AprobarSolicitud] Email enviado al solicitante');

    return {
      success: true,
      message: `Solicitud aprobada. ${resultado.message}`,
    };
  }

  private async ejecutarOperacion(solicitud: any): Promise<AprobarSolicitudResult> {
    const datos = solicitud.datosSolicitud;

    switch (solicitud.tipoOperacion) {
      case 'ASIGNAR':
        return this.assignToMarketUseCase.execute(
          datos.productos,
          datos.mercado,
          datos.franquicia,
          datos.tipoAgrupacion || 'PRESENTACION',
          false,
        );

      case 'CREAR':
        return this.assignToMarketUseCase.execute(
          datos.productos,
          datos.mercado,
          datos.franquicia,
          datos.tipoAgrupacion || 'PRESENTACION',
          true,
        );

      case 'CAMBIAR':
        const codigos = datos.productos.map((p: any) => p.codigo);
        return this.changeMarketUseCase.execute(
          codigos,
          datos.mercadoOrigen,
          datos.mercadoDestino,
          datos.franquiciaDestino,
        );

      case 'QUITAR':
        return this.removeFromMarketUseCase.execute(datos.productos, datos.mercadoOrigen);

      default:
        return { success: false, message: 'Tipo de operación no válido' };
    }
  }
}
