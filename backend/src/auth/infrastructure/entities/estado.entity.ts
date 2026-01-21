import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'TAB_ESTADO', schema: 'ODS' })
export class EstadoEntity {
  @PrimaryGeneratedColumn({ name: 'idEstado' })
  idEstado: number;

  @Column({ name: 'estado', type: 'int' })
  estado: number;
}
