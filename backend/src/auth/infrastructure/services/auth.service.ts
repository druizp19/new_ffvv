import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IAuthService } from '../../domain/auth-service.interface';
import { User } from '../../domain/user.entity';
import { GerenteEntity } from '../entities/gerente.entity';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(GerenteEntity)
    private readonly gerenteRepository: Repository<GerenteEntity>,
  ) {}

  async validateUser(
    microsoftId: string,
    email: string,
    microsoftName: string,
  ): Promise<User> {
    // Buscar el usuario con su rol usando query raw
    const result = await this.gerenteRepository.query(
      `
      SELECT g.email, g.usuario, g.idRol, r.rol
      FROM ods.TAB_GERENTE g
      LEFT JOIN ods.tab_rol r ON g.idRol = r.idRol
      WHERE LOWER(g.email) = LOWER(@0)
      `,
      [email],
    );

    if (!result || result.length === 0) {
      throw new UnauthorizedException(
        'No tiene permisos para acceder a esta aplicación.',
      );
    }

    const gerente = result[0];
    const displayName = gerente.usuario || microsoftName;
    const rol = gerente.rol || 'GERENTE';

    return new User(microsoftId, email, displayName, rol);
  }

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
