import { Configuracion } from '../entities/configuracion.entity';

export const CONFIGURACION_REPOSITORY = Symbol('CONFIGURACION_REPOSITORY');

export interface IConfiguracionRepository {
  findAll(): Promise<Configuracion[]>;
  findByClave(clave: string): Promise<Configuracion | null>;
  update(clave: string, valor: string, actualizadoPor: string): Promise<void>;
  getConfiguracionAcceso(): Promise<Record<string, string>>;
}
