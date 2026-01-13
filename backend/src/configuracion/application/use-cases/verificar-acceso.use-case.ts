import { Inject, Injectable } from '@nestjs/common';
import type { IConfiguracionRepository } from '../../domain/repositories/configuracion.repository.interface';
import { CONFIGURACION_REPOSITORY } from '../../domain/repositories/configuracion.repository.interface';

export interface VerificarAccesoResult {
  permitido: boolean;
  mensaje?: string;
}

@Injectable()
export class VerificarAccesoUseCase {
  constructor(
    @Inject(CONFIGURACION_REPOSITORY)
    private readonly configuracionRepository: IConfiguracionRepository,
  ) {}

  async execute(): Promise<VerificarAccesoResult> {
    const configs = await this.configuracionRepository.getConfiguracionAcceso();

    const sistemaActivo = configs['SISTEMA_ACTIVO'] === 'true';
    if (!sistemaActivo) {
      return {
        permitido: false,
        mensaje: configs['MENSAJE_FUERA_HORARIO'] || 'El sistema está desactivado',
      };
    }

    const now = new Date();
    const diaActual = now.getDate();
    const horaActual = now.getHours() * 60 + now.getMinutes();

    const diaInicio = parseInt(configs['DIA_INICIO'] || '1', 10);
    const diaFin = parseInt(configs['DIA_FIN'] || '31', 10);

    // Verificar día
    if (diaActual < diaInicio || diaActual > diaFin) {
      return {
        permitido: false,
        mensaje: `El sistema está disponible del día ${diaInicio} al ${diaFin} de cada mes`,
      };
    }

    // Verificar hora
    const [horaInicioH, horaInicioM] = (configs['HORA_INICIO'] || '08:00').split(':').map(Number);
    const [horaFinH, horaFinM] = (configs['HORA_FIN'] || '18:00').split(':').map(Number);
    
    const minutosInicio = horaInicioH * 60 + horaInicioM;
    const minutosFin = horaFinH * 60 + horaFinM;

    if (horaActual < minutosInicio || horaActual > minutosFin) {
      return {
        permitido: false,
        mensaje: `El sistema está disponible de ${configs['HORA_INICIO']} a ${configs['HORA_FIN']}`,
      };
    }

    return { permitido: true };
  }
}
