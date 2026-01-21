import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  login: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  contraseña: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  contraseñaActual: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  contraseñaNueva: string;
}
