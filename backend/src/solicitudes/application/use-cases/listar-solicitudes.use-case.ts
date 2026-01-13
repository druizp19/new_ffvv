import { Inject, Injectable } from '@nestjs/common';
import { Solicitud } from '../../domain/entities/solicitud.entity';
import type { EstadoSolicitud } from '../../domain/entities/solicitud.entity';
import type { ISolicitudRepository } from '../../domain/repositories/solicitud.repository.interface';
import { SOLICITUD_REPOSITORY } from '../../domain/repositories/solicitud.repository.interface';

@Injectable()
export class ListarSolicitudesUseCase {
  constructor(
    @Inject(SOLICITUD_REPOSITORY)
    private readonly solicitudRepository: ISolicitudRepository,
  ) {}

  async execute(estado?: EstadoSolicitud): Promise<Solicitud[]> {
    return this.solicitudRepository.findAll(estado);
  }

  async countPendientes(): Promise<number> {
    return this.solicitudRepository.countPendientes();
  }
}
