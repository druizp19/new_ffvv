import { Solicitud, EstadoSolicitud } from '../entities/solicitud.entity';

export const SOLICITUD_REPOSITORY = Symbol('SOLICITUD_REPOSITORY');

export interface ISolicitudRepository {
  create(solicitud: Solicitud): Promise<Solicitud>;
  findById(id: number): Promise<Solicitud | null>;
  findAll(estado?: EstadoSolicitud): Promise<Solicitud[]>;
  findByEmail(email: string): Promise<Solicitud[]>;
  update(solicitud: Solicitud): Promise<void>;
  countPendientes(): Promise<number>;
}
