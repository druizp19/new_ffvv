import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { AuthService } from './infrastructure/services/auth.service';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { UsuarioEntity } from './infrastructure/entities/usuario.entity';
import { RolEntity } from './infrastructure/entities/rol.entity';
import { UserSessionEntity } from './infrastructure/entities/user-session.entity';
import { EstadoEntity } from './infrastructure/entities/estado.entity';
import { GerenteEntity } from './infrastructure/entities/gerente.entity';
import { AuthExceptionFilter } from './infrastructure/filters/auth-exception.filter';
import { RolesGuard } from './infrastructure/guards/roles.guard';
// import { MicrosoftStrategy } from './infrastructure/strategies/microsoft.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UsuarioEntity,
      RolEntity,
      UserSessionEntity,
      EstadoEntity,
      GerenteEntity, // Mantener por compatibilidad
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // MicrosoftStrategy, // Comentado
    AuthExceptionFilter,
    RolesGuard,
  ],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
