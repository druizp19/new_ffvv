import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracionEntity } from './infrastructure/entities/configuracion.entity';
import { ConfiguracionRepository } from './infrastructure/repositories/configuracion.repository';
import { ConfiguracionController } from './infrastructure/controllers/configuracion.controller';
import { ObtenerConfiguracionUseCase } from './application/use-cases/obtener-configuracion.use-case';
import { ActualizarConfiguracionUseCase } from './application/use-cases/actualizar-configuracion.use-case';
import { VerificarAccesoUseCase } from './application/use-cases/verificar-acceso.use-case';
import { CONFIGURACION_REPOSITORY } from './domain/repositories/configuracion.repository.interface';

@Module({
  imports: [TypeOrmModule.forFeature([ConfiguracionEntity])],
  controllers: [ConfiguracionController],
  providers: [
    {
      provide: CONFIGURACION_REPOSITORY,
      useClass: ConfiguracionRepository,
    },
    ObtenerConfiguracionUseCase,
    ActualizarConfiguracionUseCase,
    VerificarAccesoUseCase,
  ],
  exports: [VerificarAccesoUseCase],
})
export class ConfiguracionModule {}
