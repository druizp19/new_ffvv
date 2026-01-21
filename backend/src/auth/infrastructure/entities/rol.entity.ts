import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'TAB_ROL', schema: 'ODS' })
export class RolEntity {
  @PrimaryGeneratedColumn({ name: 'idRol' })
  idRol: number;

  @Column({ name: 'rol', type: 'nvarchar', length: 100 })
  rol: string;

  @Column({ name: 'idEstado', type: 'int' })
  idEstado: number;
}
