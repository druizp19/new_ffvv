import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfiguracionEntity } from '../entities/configuracion.entity';
import { IConfiguracionRepository } from '../../domain/repositories/configuracion.repository.interface';
import { Configuracion } from '../../domain/entities/configuracion.entity';

@Injectable()
export class ConfiguracionRepository implements IConfiguracionRepository {
  constructor(
    @InjectRepository(ConfiguracionEntity)
    private readonly repository: Repository<ConfiguracionEntity>,
  ) {}

  async findAll(): Promise<Configuracion[]> {
    const entities = await this.repository.find({
      order: { clave: 'ASC' },
    });
    return entities.map((e) => this.toDomain(e));
  }

  async findByClave(clave: string): Promise<Configuracion | null> {
    const entity = await this.repository.findOne({ where: { clave } });
    return entity ? this.toDomain(entity) : null;
  }

  async update(clave: string, valor: string, actualizadoPor: string): Promise<void> {
    await this.repository.update(
      { clave },
      {
        valor,
        actualizadoPor,
        fechaActualizacion: new Date(),
      },
    );
  }

  async getConfiguracionAcceso(): Promise<Record<string, string>> {
    const configs = await this.repository.find();
    const result: Record<string, string> = {};
    configs.forEach((c) => {
      result[c.clave] = c.valor;
    });
    return result;
  }

  private toDomain(entity: ConfiguracionEntity): Configuracion {
    return new Configuracion(
      entity.id,
      entity.clave,
      entity.valor,
      entity.descripcion,
      entity.fechaActualizacion,
      entity.actualizadoPor,
    );
  }
}
