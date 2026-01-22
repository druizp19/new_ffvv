import { Inject, Injectable } from '@nestjs/common';
import { Solicitud, DatosSolicitud } from '../../domain/entities/solicitud.entity';
import type { TipoOperacion } from '../../domain/entities/solicitud.entity';
import type { ISolicitudRepository } from '../../domain/repositories/solicitud.repository.interface';
import { SOLICITUD_REPOSITORY } from '../../domain/repositories/solicitud.repository.interface';
import { CrearSolicitudDto } from '../dtos/solicitud.dto';
import { SolicitudesGateway } from '../../infrastructure/gateways/solicitudes.gateway';

export interface CrearSolicitudResult {
  success: boolean;
  message: string;
  solicitudId?: number;
}

@Injectable()
export class CrearSolicitudUseCase {
  constructor(
    @Inject(SOLICITUD_REPOSITORY)
    private readonly solicitudRepository: ISolicitudRepository,
    private readonly solicitudesGateway: SolicitudesGateway,
  ) {}

  async execute(
    dto: CrearSolicitudDto,
    solicitanteEmail: string,
    solicitanteNombre: string,
  ): Promise<CrearSolicitudResult> {
    console.log('📝 [CrearSolicitud] Iniciando creación de solicitud');
    console.log('📝 [CrearSolicitud] Tipo:', dto.tipoOperacion);
    console.log('📝 [CrearSolicitud] Solicitante:', solicitanteEmail, '-', solicitanteNombre);
    console.log('📝 [CrearSolicitud] Datos:', JSON.stringify(dto, null, 2));

    try {
      const datosSolicitud: DatosSolicitud = {
        productos: dto.productos,
        mercado: dto.mercado,
        franquicia: dto.franquicia,
        mercadoOrigen: dto.mercadoOrigen,
        mercadoDestino: dto.mercadoDestino,
        franquiciaDestino: dto.franquiciaDestino,
        tipoAgrupacion: dto.tipoAgrupacion,
        isNewMarket: dto.isNewMarket,
      };

      console.log('📝 [CrearSolicitud] Creando entidad Solicitud...');
      const solicitud = Solicitud.create(
        dto.tipoOperacion as TipoOperacion,
        datosSolicitud,
        solicitanteEmail,
        solicitanteNombre,
        dto.comentarioSolicitante,
      );

      console.log('📝 [CrearSolicitud] Guardando en base de datos...');
      const saved = await this.solicitudRepository.create(solicitud);
      console.log('✅ [CrearSolicitud] Solicitud guardada con ID:', saved.id);

      // Emitir evento WebSocket
      console.log('📡 [CrearSolicitud] Emitiendo evento WebSocket...');
      this.solicitudesGateway.emitNuevaSolicitud(saved);
      
      // Actualizar contador
      const count = await this.solicitudRepository.countPendientes();
      console.log('📊 [CrearSolicitud] Contador actualizado:', count);
      this.solicitudesGateway.emitContadorActualizado(count);

      console.log('✅ [CrearSolicitud] Proceso completado exitosamente');
      return {
        success: true,
        message: 'Solicitud creada correctamente. Pendiente de aprobación.',
        solicitudId: saved.id ?? undefined,
      };
    } catch (error: any) {
      console.error('❌ [CrearSolicitud] Error:', error);
      console.error('❌ [CrearSolicitud] Stack:', error.stack);
      return {
        success: false,
        message: error.message || 'Error al crear la solicitud',
      };
    }
  }
}
