import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SolicitudEntity } from './infrastructure/entities/solicitud.entity';
import { SolicitudRepository } from './infrastructure/repositories/solicitud.repository';
import { SOLICITUD_REPOSITORY } from './domain/repositories/solicitud.repository.interface';
import { SolicitudesController } from './infrastructure/controllers/solicitudes.controller';
import { SolicitudesGateway } from './infrastructure/gateways/solicitudes.gateway';
import { CrearSolicitudUseCase } from './application/use-cases/crear-solicitud.use-case';
import { AprobarSolicitudUseCase } from './application/use-cases/aprobar-solicitud.use-case';
import { RechazarSolicitudUseCase } from './application/use-cases/rechazar-solicitud.use-case';
import { ListarSolicitudesUseCase } from './application/use-cases/listar-solicitudes.use-case';
import { ProductsModule } from '../products/products.module';
import { EmailModule } from '../common/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SolicitudEntity]),
    forwardRef(() => ProductsModule),
    EmailModule,
  ],
  controllers: [SolicitudesController],
  providers: [
    {
      provide: SOLICITUD_REPOSITORY,
      useClass: SolicitudRepository,
    },
    SolicitudesGateway,
    CrearSolicitudUseCase,
    AprobarSolicitudUseCase,
    RechazarSolicitudUseCase,
    ListarSolicitudesUseCase,
  ],
  exports: [CrearSolicitudUseCase, SolicitudesGateway],
})
export class SolicitudesModule {}
