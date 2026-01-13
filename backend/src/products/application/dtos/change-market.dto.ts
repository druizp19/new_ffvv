import { IsArray, IsString, IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ProductDataDto } from './assign-market.dto';

export class ChangeMarketDto {
  @IsArray()
  @IsString({ each: true })
  codigos: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDataDto)
  productos?: ProductDataDto[];

  @IsString()
  @IsNotEmpty()
  oldMercado: string;

  @IsString()
  @IsNotEmpty()
  newMercado: string;

  @IsString()
  newFranquicia: string;

  @IsOptional()
  @IsString()
  comentarioSolicitante?: string;
}
