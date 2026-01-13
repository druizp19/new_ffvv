import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'configuracion_sistema', schema: 'dbo' })
export class ConfiguracionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  clave: string;

  @Column({ type: 'nvarchar', length: 500 })
  valor: string;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  descripcion: string;

  @Column({ name: 'fecha_actualizacion', type: 'datetime', default: () => 'GETDATE()' })
  fechaActualizacion: Date;

  @Column({ name: 'actualizado_por', type: 'varchar', length: 255, nullable: true })
  actualizadoPor: string;
}
