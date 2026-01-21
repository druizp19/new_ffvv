import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { SolicitudesModule } from './solicitudes/solicitudes.module';
import { ConfiguracionModule } from './configuracion/configuracion.module';
import { ProductEntity } from './products/infrastructure/product.entity';
import { GerenteEntity } from './auth/infrastructure/entities/gerente.entity';
import { MarketConfigEntity } from './products/infrastructure/market-config.entity';
import { SolicitudEntity } from './solicitudes/infrastructure/entities/solicitud.entity';
import { ConfiguracionEntity } from './configuracion/infrastructure/entities/configuracion.entity';
import { UsuarioEntity } from './auth/infrastructure/entities/usuario.entity';
import { RolEntity } from './auth/infrastructure/entities/rol.entity';
import { EstadoEntity } from './auth/infrastructure/entities/estado.entity';
import { UserSessionEntity } from './auth/infrastructure/entities/user-session.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.register({
      isGlobal: true,
      ttl: 300000, // 5 minutos en milisegundos
      max: 100, // máximo 100 items en caché
    }),
    // Security: Rate limiting - 100 requests por minuto por IP
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests por minuto
      },
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get<string>('DB_HOST'),
        port: Number(configService.get<number>('DB_PORT') || 1433),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [
          ProductEntity,
          GerenteEntity,
          MarketConfigEntity,
          SolicitudEntity,
          ConfiguracionEntity,
          UsuarioEntity,
          RolEntity,
          EstadoEntity,
          UserSessionEntity,
        ],
        synchronize: false, // Don't use synchronize in production for existing tables
        options: {
          trustServerCertificate: configService.get<string>('DB_TRUST_SERVER_CERTIFICATE') === 'true',
          requestTimeout: 60000, // 60 segundos
          connectionTimeout: 60000,
        },
      }),
    }),
    AuthModule,
    ProductsModule,
    SolicitudesModule,
    ConfiguracionModule,
  ],
  providers: [
    // Security: Aplicar rate limiting globalmente
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
