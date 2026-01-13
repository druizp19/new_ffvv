import { apiService } from './api.service';

export type TipoOperacion = 'ASIGNAR' | 'CAMBIAR' | 'QUITAR' | 'CREAR';
export type EstadoSolicitud = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

export interface DatosSolicitud {
  productos: Array<{
    codigo: string;
    presentacion?: string;
    atc4?: string;
    molecula?: string;
    ff1?: string;
    ff3?: string;
    stghVal?: string;
  }>;
  mercado?: string;
  franquicia?: string;
  mercadoOrigen?: string;
  mercadoDestino?: string;
  franquiciaDestino?: string;
  tipoAgrupacion?: string;
  isNewMarket?: boolean;
}

export interface Solicitud {
  id: number;
  tipoOperacion: TipoOperacion;
  datosSolicitud: DatosSolicitud;
  solicitanteEmail: string;
  solicitanteNombre: string;
  estado: EstadoSolicitud;
  fechaSolicitud: string;
  fechaRespuesta: string | null;
  aprobadorEmail: string | null;
  comentario: string | null;
  comentarioSolicitante: string | null;
}

export interface SolicitudListResponse {
  success: boolean;
  data: Solicitud[];
}

export interface SolicitudCountResponse {
  success: boolean;
  count: number;
}

export interface SolicitudActionResponse {
  success: boolean;
  message: string;
}

class SolicitudService {
  async getSolicitudes(estado?: EstadoSolicitud): Promise<Solicitud[]> {
    const url = estado ? `/solicitudes?estado=${estado}` : '/solicitudes';
    const response = await apiService.get<SolicitudListResponse>(url);
    return response.data;
  }

  async countPendientes(): Promise<number> {
    const response = await apiService.get<SolicitudCountResponse>('/solicitudes/pendientes/count');
    return response.count;
  }

  async aprobar(id: number, comentario?: string): Promise<SolicitudActionResponse> {
    return apiService.post<SolicitudActionResponse>(`/solicitudes/${id}/aprobar`, { comentario });
  }

  async rechazar(id: number, comentario?: string): Promise<SolicitudActionResponse> {
    return apiService.post<SolicitudActionResponse>(`/solicitudes/${id}/rechazar`, { comentario });
  }
}

export const solicitudService = new SolicitudService();
