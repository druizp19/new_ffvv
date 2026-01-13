import { IsArray, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductoRestoDto {
  @IsString()
  codigo: string;

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

export class RemoveMarketDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductoRestoDto)
  productos: ProductoRestoDto[];

  @IsOptional()
  @IsString()
  mercado?: string;

  @IsOptional()
  @IsString()
  comentarioSolicitante?: string;
}
