import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'solicitudes_cambio', schema: 'dbo' })
export class SolicitudEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'tipo_operacion', type: 'varchar', length: 50 })
  tipoOperacion: string;

  @Column({ name: 'datos_solicitud', type: 'nvarchar', length: 'MAX' })
  datosSolicitud: string;

  @Column({ name: 'solicitante_email', type: 'varchar', length: 255 })
  solicitanteEmail: string;

  @Column({ name: 'solicitante_nombre', type: 'varchar', length: 255, nullable: true })
  solicitanteNombre: string;

  @Column({ name: 'estado', type: 'varchar', length: 20, default: 'PENDIENTE' })
  estado: string;

  @Column({ name: 'fecha_solicitud', type: 'datetime', default: () => 'GETDATE()' })
  fechaSolicitud: Date;

  @Column({ name: 'fecha_respuesta', type: 'datetime', nullable: true })
  fechaRespuesta: Date;

  @Column({ name: 'aprobador_email', type: 'varchar', length: 255, nullable: true })
  aprobadorEmail: string;

  @Column({ name: 'comentario', type: 'nvarchar', length: 500, nullable: true })
  comentario: string;

  @Column({ name: 'comentario_solicitante', type: 'nvarchar', length: 500, nullable: true })
  comentarioSolicitante: string;
}
