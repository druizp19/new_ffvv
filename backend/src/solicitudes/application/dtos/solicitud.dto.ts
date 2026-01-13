import { IsString, IsOptional, IsArray, IsBoolean } from 'class-validator';

export class ProductoSolicitudDto {
  @IsString()
  codigo: string;

  @IsOptional()
  @IsString()
  presentacion?: string;

  @IsOptional()
  @IsString()
  atc4?: string;

  @IsOptional()
  @IsString()
  molecula?: string;

  @IsOptional()
  @IsString()
  ff1?: string;

  @IsOptional()
  @IsString()
  ff3?: string;

  @IsOptional()
  @IsString()
  stghVal?: string;
}

export class CrearSolicitudDto {
  @IsString()
  tipoOperacion: 'ASIGNAR' | 'CAMBIAR' | 'QUITAR' | 'CREAR';

  @IsArray()
  productos: ProductoSolicitudDto[];

  @IsOptional()
  @IsString()
  mercado?: string;

  @IsOptional()
  @IsString()
  franquicia?: string;

  @IsOptional()
  @IsString()
  mercadoOrigen?: string;

  @IsOptional()
  @IsString()
  mercadoDestino?: string;

  @IsOptional()
  @IsString()
  franquiciaDestino?: string;

  @IsOptional()
  @IsString()
  tipoAgrupacion?: string;

  @IsOptional()
  @IsBoolean()
  isNewMarket?: boolean;

  @IsOptional()
  @IsString()
  comentarioSolicitante?: string;
}

export class ResponderSolicitudDto {
  @IsOptional()
  @IsString()
  comentario?: string;
}
