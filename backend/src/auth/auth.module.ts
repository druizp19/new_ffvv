import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from './infrastructure/controllers/auth.controller';
import { AuthService } from './infrastructure/services/auth.service';
import { MicrosoftStrategy } from './infrastructure/strategies/microsoft.strategy';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { GerenteEntity } from './infrastructure/entities/gerente.entity';
import { AuthExceptionFilter } from './infrastructure/filters/auth-exception.filter';
import { RolesGuard } from './infrastructure/guards/roles.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([GerenteEntity]),
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
  providers: [AuthService, MicrosoftStrategy, JwtStrategy, AuthExceptionFilter, RolesGuard],
  exports: [AuthService, RolesGuard],
})
export class AuthModule {}
