import {
  IsArray,
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductDataDto {
  @IsString()
  @IsNotEmpty()
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

export class AssignMarketDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDataDto)
  productos: ProductDataDto[];

  @IsString()
  @IsNotEmpty()
  mercado: string;

  @IsOptional()
  @IsString()
  franquicia?: string;

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
