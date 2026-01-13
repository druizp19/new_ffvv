import { Controller, Get, Put, Body, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../../auth/infrastructure/guards/roles.guard';
import { ObtenerConfiguracionUseCase } from '../../application/use-cases/obtener-configuracion.use-case';
import { ActualizarConfiguracionUseCase } from '../../application/use-cases/actualizar-configuracion.use-case';
import { VerificarAccesoUseCase } from '../../application/use-cases/verificar-acceso.use-case';
import { ActualizarMultipleConfiguracionDto } from '../../application/dtos/configuracion.dto';

@Controller('configuracion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ConfiguracionController {
  constructor(
    private readonly obtenerConfiguracionUseCase: ObtenerConfiguracionUseCase,
    private readonly actualizarConfiguracionUseCase: ActualizarConfiguracionUseCase,
    private readonly verificarAccesoUseCase: VerificarAccesoUseCase,
  ) {}

  @Get()
  @Roles('SUPER_ADMIN')
  async obtenerConfiguracion() {
    return this.obtenerConfiguracionUseCase.execute();
  }

  @Get('all')
  @Roles('SUPER_ADMIN')
  async obtenerTodasConfiguraciones() {
    return this.obtenerConfiguracionUseCase.executeAll();
  }

  @Put()
  @Roles('SUPER_ADMIN')
  async actualizarConfiguracion(
    @Body() dto: ActualizarMultipleConfiguracionDto,
    @Request() req: { user: { email: string } },
  ) {
    return this.actualizarConfiguracionUseCase.execute(dto, req.user.email);
  }

  @Get('verificar-acceso')
  async verificarAcceso() {
    return this.verificarAccesoUseCase.execute();
  }
}
