export type TipoOperacion = 'ASIGNAR' | 'CAMBIAR' | 'QUITAR' | 'CREAR';
export type EstadoSolicitud = 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';

export interface DatosSolicitud {
  productos: Array<{
    codigo: string;
    presentacion?: string;
    atc4?: string;
    molecula?: string;
    ff1?: string;
    ff3?: string;
    stghVal?: string;
  }>;
  mercado?: string;
  franquicia?: string;
  mercadoOrigen?: string;
  mercadoDestino?: string;
  franquiciaDestino?: string;
  tipoAgrupacion?: string;
  isNewMarket?: boolean;
}

export class Solicitud {
  constructor(
    public readonly id: number | null,
    public readonly tipoOperacion: TipoOperacion,
    public readonly datosSolicitud: DatosSolicitud,
    public readonly solicitanteEmail: string,
    public readonly solicitanteNombre: string,
    public readonly estado: EstadoSolicitud = 'PENDIENTE',
    public readonly fechaSolicitud: Date = new Date(),
    public readonly fechaRespuesta: Date | null = null,
    public readonly aprobadorEmail: string | null = null,
    public readonly comentario: string | null = null,
    public readonly comentarioSolicitante: string | null = null,
  ) {}

  static create(
    tipoOperacion: TipoOperacion,
    datosSolicitud: DatosSolicitud,
    solicitanteEmail: string,
    solicitanteNombre: string,
    comentarioSolicitante?: string,
  ): Solicitud {
    return new Solicitud(
      null,
      tipoOperacion,
      datosSolicitud,
      solicitanteEmail,
      solicitanteNombre,
      'PENDIENTE',
      new Date(),
      null,
      null,
      null,
      comentarioSolicitante || null,
    );
  }

  aprobar(aprobadorEmail: string, comentario?: string): Solicitud {
    return new Solicitud(
      this.id,
      this.tipoOperacion,
      this.datosSolicitud,
      this.solicitanteEmail,
      this.solicitanteNombre,
      'APROBADO',
      this.fechaSolicitud,
      new Date(),
      aprobadorEmail,
      comentario || null,
      this.comentarioSolicitante,
    );
  }

  rechazar(aprobadorEmail: string, comentario?: string): Solicitud {
    return new Solicitud(
      this.id,
      this.tipoOperacion,
      this.datosSolicitud,
      this.solicitanteEmail,
      this.solicitanteNombre,
      'RECHAZADO',
      this.fechaSolicitud,
      new Date(),
      aprobadorEmail,
      comentario || null,
      this.comentarioSolicitante,
    );
  }
}
