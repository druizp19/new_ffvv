import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SolicitudEntity } from '../entities/solicitud.entity';
import { ISolicitudRepository } from '../../domain/repositories/solicitud.repository.interface';
import { Solicitud, EstadoSolicitud, DatosSolicitud, TipoOperacion } from '../../domain/entities/solicitud.entity';

@Injectable()
export class SolicitudRepository implements ISolicitudRepository {
  constructor(
    @InjectRepository(SolicitudEntity)
    private readonly repository: Repository<SolicitudEntity>,
  ) {}

  async create(solicitud: Solicitud): Promise<Solicitud> {
    const entity = this.repository.create({
      tipoOperacion: solicitud.tipoOperacion,
      datosSolicitud: JSON.stringify(solicitud.datosSolicitud),
      solicitanteEmail: solicitud.solicitanteEmail,
      solicitanteNombre: solicitud.solicitanteNombre,
      estado: solicitud.estado,
      comentarioSolicitante: solicitud.comentarioSolicitante || undefined,
    });

    const saved = await this.repository.save(entity);
    return this.toDomain(saved);
  }

  async findById(id: number): Promise<Solicitud | null> {
    const entity = await this.repository.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async findAll(estado?: EstadoSolicitud): Promise<Solicitud[]> {
    const where = estado ? { estado } : {};
    const entities = await this.repository.find({
      where,
      order: { fechaSolicitud: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findByEmail(email: string): Promise<Solicitud[]> {
    const entities = await this.repository.find({
      where: { solicitanteEmail: email },
      order: { fechaSolicitud: 'DESC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async update(solicitud: Solicitud): Promise<void> {
    if (!solicitud.id) return;

    await this.repository.update(solicitud.id, {
      estado: solicitud.estado,
      fechaRespuesta: solicitud.fechaRespuesta ?? undefined,
      aprobadorEmail: solicitud.aprobadorEmail ?? undefined,
      comentario: solicitud.comentario ?? undefined,
    });
  }

  async countPendientes(): Promise<number> {
    return this.repository.count({ where: { estado: 'PENDIENTE' } });
  }

  private toDomain(entity: SolicitudEntity): Solicitud {
    return new Solicitud(
      entity.id,
      entity.tipoOperacion as TipoOperacion,
      JSON.parse(entity.datosSolicitud) as DatosSolicitud,
      entity.solicitanteEmail,
      entity.solicitanteNombre,
      entity.estado as EstadoSolicitud,
      entity.fechaSolicitud,
      entity.fechaRespuesta,
      entity.aprobadorEmail,
      entity.comentario,
      entity.comentarioSolicitante,
    );
  }
}
