import { IsOptional, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetProductsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 50;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  marcaGenerico?: string;

  @IsOptional()
  @IsString()
  eticoPopular?: string;

  @IsOptional()
  @IsString()
  mercado?: string;

  @IsOptional()
  @IsString()
  molecula?: string;

  @IsOptional()
  @IsString()
  ff3?: string;

  @IsOptional()
  @IsString()
  atc4?: string;

  @IsOptional()
  @IsString()
  laboratorio?: string;

  @IsOptional()
  @IsString()
  corporacion?: string;

  @IsOptional()
  @IsString()
  concentracion?: string;

  @IsOptional()
  @IsString()
  volumen?: string;
}
