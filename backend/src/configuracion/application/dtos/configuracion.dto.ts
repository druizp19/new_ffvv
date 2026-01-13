import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class ActualizarConfiguracionDto {
  @IsString()
  @IsNotEmpty()
  clave: string;

  @IsString()
  @IsNotEmpty()
  valor: string;
}

export class ActualizarMultipleConfiguracionDto {
  @IsOptional()
  @IsBoolean()
  sistemaActivo?: boolean;

  @IsOptional()
  @IsString()
  diaInicio?: string;

  @IsOptional()
  @IsString()
  diaFin?: string;

  @IsOptional()
  @IsString()
  horaInicio?: string;

  @IsOptional()
  @IsString()
  horaFin?: string;

  @IsOptional()
  @IsString()
  mensajeFueraHorario?: string;
}
