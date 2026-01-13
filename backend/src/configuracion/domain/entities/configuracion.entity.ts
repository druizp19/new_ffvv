export class Configuracion {
  constructor(
    public readonly id: number,
    public readonly clave: string,
    public readonly valor: string,
    public readonly descripcion: string | null,
    public readonly fechaActualizacion: Date,
    public readonly actualizadoPor: string | null,
  ) {}

  static create(
    clave: string,
    valor: string,
    descripcion?: string,
    actualizadoPor?: string,
  ): Configuracion {
    return new Configuracion(
      0,
      clave,
      valor,
      descripcion || null,
      new Date(),
      actualizadoPor || null,
    );
  }

  actualizar(valor: string, actualizadoPor: string): Configuracion {
    return new Configuracion(
      this.id,
      this.clave,
      valor,
      this.descripcion,
      new Date(),
      actualizadoPor,
    );
  }
}

export interface ConfiguracionAcceso {
  sistemaActivo: boolean;
  diaInicio: number;
  diaFin: number;
  horaInicio: string;
  horaFin: string;
  mensajeFueraHorario: string;
}
