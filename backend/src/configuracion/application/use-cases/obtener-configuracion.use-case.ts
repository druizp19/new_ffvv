import { Inject, Injectable } from '@nestjs/common';
import type { IConfiguracionRepository } from '../../domain/repositories/configuracion.repository.interface';
import { CONFIGURACION_REPOSITORY } from '../../domain/repositories/configuracion.repository.interface';
import type { ConfiguracionAcceso } from '../../domain/entities/configuracion.entity';

@Injectable()
export class ObtenerConfiguracionUseCase {
  constructor(
    @Inject(CONFIGURACION_REPOSITORY)
    private readonly configuracionRepository: IConfiguracionRepository,
  ) {}

  async execute(): Promise<ConfiguracionAcceso> {
    const configs = await this.configuracionRepository.getConfiguracionAcceso();

    return {
      sistemaActivo: configs['SISTEMA_ACTIVO'] === 'true',
      diaInicio: parseInt(configs['DIA_INICIO'] || '1', 10),
      diaFin: parseInt(configs['DIA_FIN'] || '31', 10),
      horaInicio: configs['HORA_INICIO'] || '08:00',
      horaFin: configs['HORA_FIN'] || '18:00',
      mensajeFueraHorario: configs['MENSAJE_FUERA_HORARIO'] || 'Sistema no disponible',
    };
  }

  async executeAll() {
    return this.configuracionRepository.findAll();
  }
}
