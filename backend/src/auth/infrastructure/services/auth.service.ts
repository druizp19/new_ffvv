import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { IAuthService } from '../../domain/auth-service.interface';
import { User } from '../../domain/user.entity';
import { UsuarioEntity } from '../entities/usuario.entity';
import { UserSessionEntity } from '../entities/user-session.entity';
import { LoginDto, ChangePasswordDto } from '../../application/dtos/login.dto';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UsuarioEntity)
    private readonly usuarioRepository: Repository<UsuarioEntity>,
    @InjectRepository(UserSessionEntity)
    private readonly sessionRepository: Repository<UserSessionEntity>,
  ) {}

  async login(loginDto: LoginDto): Promise<{ token: string; debeCambiarPassword: boolean; usuario: any }> {
    const { login, contraseña } = loginDto;

    // Buscar usuario con su rol
    const result = await this.usuarioRepository.query(
      `
      SELECT u.[idUsuario], u.[idRol], u.[usuario], u.[login], u.[contraseña], u.[email], u.[idEstado], r.[rol]
      FROM [ODS].[TAB_USUARIO] u
      LEFT JOIN [ODS].[TAB_ROL] r ON u.[idRol] = r.[idRol]
      WHERE u.[login] = @0
      `,
      [login],
    );

    if (!result || result.length === 0) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const usuario = result[0];

    // DEBUG: Ver qué columnas devuelve SQL Server
    console.log('Columnas del usuario:', Object.keys(usuario));
    console.log('Usuario completo:', usuario);

    // Verificar que el usuario esté activo (idEstado = 2)
    if (usuario.idEstado !== 2) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Verificar contraseña
    const debeCambiarPassword = usuario.contraseña === '123';
    
    if (debeCambiarPassword) {
      // Primera vez: contraseña es "123"
      if (contraseña !== '123') {
        throw new UnauthorizedException('Credenciales inválidas');
      }
    } else {
      // Contraseña ya fue cambiada: verificar con bcrypt
      // Convertir hash de PHP ($2y$) a Node.js ($2b$) si es necesario
      let hashToCompare = usuario.contraseña;
      if (hashToCompare.startsWith('$2y$')) {
        hashToCompare = '$2b$' + hashToCompare.substring(4);
      }
      
      const isPasswordValid = await bcrypt.compare(contraseña, hashToCompare);
      if (!isPasswordValid) {
        console.log('Contraseña inválida para usuario:', usuario.login);
        throw new UnauthorizedException('Credenciales inválidas');
      }
    }

    // Normalizar rol (SUPER ADMIN -> SUPER_ADMIN)
    const rolNormalizado = usuario.rol?.replace(/\s+/g, '_') || 'GERENTE';

    // Generar JWT
    const payload = {
      sub: usuario.idUsuario,
      login: usuario.login,
      email: usuario.email,
      name: usuario.usuario,
      rol: rolNormalizado,
    };
    const token = this.jwtService.sign(payload);

    // Guardar sesión
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 1 día

    await this.sessionRepository.save({
      userId: usuario.idUsuario,
      token,
      expiresAt,
    });

    return {
      token,
      debeCambiarPassword,
      usuario: {
        idUsuario: usuario.idUsuario,
        login: usuario.login,
        usuario: usuario.usuario,
        email: usuario.email,
        rol: rolNormalizado,
      },
    };
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<{ success: boolean; message: string }> {
    const { contraseñaActual, contraseñaNueva } = changePasswordDto;

    // Buscar usuario
    const result = await this.usuarioRepository.query(
      `SELECT idUsuario, [contraseña] FROM ODS.TAB_USUARIO WHERE idUsuario = @0`,
      [userId],
    );

    if (!result || result.length === 0) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const usuario = result[0];

    // Verificar contraseña actual
    if (usuario.contraseña === '123') {
      if (contraseñaActual !== '123') {
        throw new UnauthorizedException('Contraseña actual incorrecta');
      }
    } else {
      // Convertir hash de PHP ($2y$) a Node.js ($2b$) si es necesario
      let hashToCompare = usuario.contraseña;
      if (hashToCompare.startsWith('$2y$')) {
        hashToCompare = '$2b$' + hashToCompare.substring(4);
      }
      
      const isPasswordValid = await bcrypt.compare(contraseñaActual, hashToCompare);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Contraseña actual incorrecta');
      }
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(contraseñaNueva, 10);

    // Actualizar contraseña
    await this.usuarioRepository.query(
      `UPDATE ODS.TAB_USUARIO SET [contraseña] = @0 WHERE idUsuario = @1`,
      [hashedPassword, userId],
    );

    return {
      success: true,
      message: 'Contraseña actualizada correctamente',
    };
  }

  // Mantener método para compatibilidad con Microsoft (comentado)
  /*
  async validateUser(
    microsoftId: string,
    email: string,
    microsoftName: string,
  ): Promise<User> {
    const result = await this.usuarioRepository.query(
      `
      SELECT u.email, u.usuario, u.idRol, r.rol
      FROM ODS.TAB_USUARIO u
      LEFT JOIN ODS.TAB_ROL r ON u.idRol = r.idRol
      WHERE LOWER(u.email) = LOWER(@0)
      `,
      [email],
    );

    if (!result || result.length === 0) {
      throw new UnauthorizedException(
        'No tiene permisos para acceder a esta aplicación.',
      );
    }

    const usuario = result[0];
    const displayName = usuario.usuario || microsoftName;
    const rol = usuario.rol?.replace(/\s+/g, '_') || 'GERENTE';

    return new User(microsoftId, email, displayName, rol);
  }
  */

  generateJwt(user: User): string {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      rol: user.rol,
    };
    return this.jwtService.sign(payload);
  }
}
