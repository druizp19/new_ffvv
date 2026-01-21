import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import type { RolEntity } from './rol.entity';

@Entity({ name: 'TAB_USUARIO', schema: 'ODS' })
export class UsuarioEntity {
  @PrimaryGeneratedColumn({ name: 'idUsuario' })
  idUsuario: number;

  @Column({ name: 'idRol', type: 'int' })
  idRol: number;

  @Column({ name: 'usuario', type: 'nvarchar', length: 100 })
  usuario: string;

  @Column({ name: 'login', type: 'nvarchar', length: 50 })
  login: string;

  @Column({ name: 'contraseña', type: 'nvarchar', length: 255 })
  contraseña: string;

  @Column({ name: 'email', type: 'nvarchar', length: 150 })
  email: string;

  @Column({ name: 'idEstado', type: 'int' })
  idEstado: number;

  @ManyToOne('RolEntity')
  @JoinColumn({ name: 'idRol' })
  rol: RolEntity;
}
