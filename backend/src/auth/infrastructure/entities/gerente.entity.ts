import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity({ name: 'TAB_GERENTE', schema: 'ods' })
export class GerenteEntity {
  @PrimaryColumn({ name: 'email' })
  email: string;

  @Column({ name: 'usuario', nullable: true })
  usuario: string;

  @Column({ name: 'idRol', nullable: true })
  idRol: number;
}
