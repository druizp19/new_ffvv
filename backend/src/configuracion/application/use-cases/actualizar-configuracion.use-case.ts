import { Inject, Injectable } from '@nestjs/common';
import type { IConfiguracionRepository } from '../../domain/repositories/configuracion.repository.interface';
import { CONFIGURACION_REPOSITORY } from '../../domain/repositories/configuracion.repository.interface';
import { ActualizarMultipleConfiguracionDto } from '../dtos/configuracion.dto';

export interface ActualizarConfiguracionResult {
  success: boolean;
  message: string;
}

@Injectable()
export class ActualizarConfiguracionUseCase {
  constructor(
    @Inject(CONFIGURACION_REPOSITORY)
    private readonly configuracionRepository: IConfiguracionRepository,
  ) {}

  async execute(
    dto: ActualizarMultipleConfiguracionDto,
    actualizadoPor: string,
  ): Promise<ActualizarConfiguracionResult> {
    try {
      const updates: Array<{ clave: string; valor: string }> = [];

      if (dto.sistemaActivo !== undefined) {
        updates.push({ clave: 'SISTEMA_ACTIVO', valor: dto.sistemaActivo ? 'true' : 'false' });
      }
      if (dto.diaInicio !== undefined) {
        updates.push({ clave: 'DIA_INICIO', valor: dto.diaInicio });
      }
      if (dto.diaFin !== undefined) {
        updates.push({ clave: 'DIA_FIN', valor: dto.diaFin });
      }
      if (dto.horaInicio !== undefined) {
        updates.push({ clave: 'HORA_INICIO', valor: dto.horaInicio });
      }
      if (dto.horaFin !== undefined) {
        updates.push({ clave: 'HORA_FIN', valor: dto.horaFin });
      }
      if (dto.mensajeFueraHorario !== undefined) {
        updates.push({ clave: 'MENSAJE_FUERA_HORARIO', valor: dto.mensajeFueraHorario });
      }

      for (const update of updates) {
        await this.configuracionRepository.update(update.clave, update.valor, actualizadoPor);
      }

      return {
        success: true,
        message: `${updates.length} configuración(es) actualizada(s) correctamente`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al actualizar configuración',
      };
    }
  }
}
