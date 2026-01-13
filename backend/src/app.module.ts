import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { SolicitudesModule } from './solicitudes/solicitudes.module';
import { ConfiguracionModule } from './configuracion/configuracion.module';
import { ProductEntity } from './products/infrastructure/product.entity';
import { GerenteEntity } from './auth/infrastructure/entities/gerente.entity';
import { MarketConfigEntity } from './products/infrastructure/market-config.entity';
import { SolicitudEntity } from './solicitudes/infrastructure/entities/solicitud.entity';
import { ConfiguracionEntity } from './configuracion/infrastructure/entities/configuracion.entity';

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
        entities: [ProductEntity, GerenteEntity, MarketConfigEntity, SolicitudEntity, ConfiguracionEntity],
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
})
export class AppModule { }
