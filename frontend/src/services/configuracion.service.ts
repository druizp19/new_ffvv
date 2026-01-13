import { apiService } from './api.service';

export interface ConfiguracionAcceso {
  sistemaActivo: boolean;
  diaInicio: number;
  diaFin: number;
  horaInicio: string;
  horaFin: string;
  mensajeFueraHorario: string;
}

export interface ActualizarConfiguracionDto {
  sistemaActivo?: boolean;
  diaInicio?: string;
  diaFin?: string;
  horaInicio?: string;
  horaFin?: string;
  mensajeFueraHorario?: string;
}

export interface VerificarAccesoResult {
  permitido: boolean;
  mensaje?: string;
}

export const configuracionService = {
  async obtenerConfiguracion(): Promise<ConfiguracionAcceso> {
    return apiService.get<ConfiguracionAcceso>('/configuracion');
  },

  async actualizarConfiguracion(dto: ActualizarConfiguracionDto): Promise<{ success: boolean; message: string }> {
    return apiService.put<{ success: boolean; message: string }>('/configuracion', dto);
  },

  async verificarAcceso(): Promise<VerificarAccesoResult> {
    return apiService.get<VerificarAccesoResult>('/configuracion/verificar-acceso');
  },
};
