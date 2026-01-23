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

    // Guardar sesión usando query directa para evitar problemas con parámetros
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1); // 1 día
    const expiresAtStr = expiresAt.toISOString().slice(0, 19).replace('T', ' ');

    try {
      // Eliminar sesiones anteriores del usuario
      await this.sessionRepository.query(
        `DELETE FROM ODS.USER_SESSIONS WHERE user_id = ${usuario.idUsuario}`
      );

      // Insertar nueva sesión
      await this.sessionRepository.query(
        `INSERT INTO ODS.USER_SESSIONS (user_id, token, expires_at) VALUES (${usuario.idUsuario}, '${token}', '${expiresAtStr}')`
      );
    } catch (error) {
      console.error('❌ [Login] Error al guardar sesión:', error);
      // No fallar el login si falla guardar la sesión
    }

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

    console.log('🔐 [ChangePassword] Iniciando cambio de contraseña para userId:', userId);

    // Buscar usuario usando query raw
    const result = await this.usuarioRepository.query(
      `SELECT idUsuario, contraseña FROM ODS.TAB_USUARIO WHERE idUsuario = ${userId}`,
    );

    if (!result || result.length === 0) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const usuario = result[0];
    console.log('🔐 [ChangePassword] Usuario encontrado:', usuario.idUsuario);
    console.log('🔐 [ChangePassword] Contraseña actual en BD:', usuario.contraseña);

    // Verificar contraseña actual
    if (usuario.contraseña === '123') {
      if (contraseñaActual !== '123') {
        throw new UnauthorizedException('Contraseña actual incorrecta');
      }
      console.log('🔐 [ChangePassword] Contraseña actual verificada (123)');
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
      console.log('🔐 [ChangePassword] Contraseña actual verificada (bcrypt)');
    }

    // Hash de la nueva contraseña
    const hashedPassword = await bcrypt.hash(contraseñaNueva, 10);
    console.log('🔐 [ChangePassword] Nueva contraseña hasheada, longitud:', hashedPassword.length);
    console.log('🔐 [ChangePassword] Hash generado:', hashedPassword);

    try {
      // Usar query SQL directa sin parámetros para evitar problemas de encoding
      const escapedHash = hashedPassword.replace(/'/g, "''"); // Escapar comillas simples
      await this.usuarioRepository.query(
        `UPDATE ODS.TAB_USUARIO SET contraseña = N'${escapedHash}' WHERE idUsuario = ${userId}`
      );

      console.log('✅ [ChangePassword] Contraseña actualizada correctamente');
    } catch (error) {
      console.error('❌ [ChangePassword] Error al actualizar:', error);
      throw error;
    }

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
