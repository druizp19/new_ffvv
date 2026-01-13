import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../../auth/infrastructure/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../../../auth/infrastructure/guards/roles.guard';
import { CrearSolicitudUseCase } from '../../application/use-cases/crear-solicitud.use-case';
import { AprobarSolicitudUseCase } from '../../application/use-cases/aprobar-solicitud.use-case';
import { RechazarSolicitudUseCase } from '../../application/use-cases/rechazar-solicitud.use-case';
import { ListarSolicitudesUseCase } from '../../application/use-cases/listar-solicitudes.use-case';
import { CrearSolicitudDto, ResponderSolicitudDto } from '../../application/dtos/solicitud.dto';
import type { EstadoSolicitud } from '../../domain/entities/solicitud.entity';

@Controller('solicitudes')
@UseGuards(JwtAuthGuard)
export class SolicitudesController {
  constructor(
    private readonly crearSolicitudUseCase: CrearSolicitudUseCase,
    private readonly aprobarSolicitudUseCase: AprobarSolicitudUseCase,
    private readonly rechazarSolicitudUseCase: RechazarSolicitudUseCase,
    private readonly listarSolicitudesUseCase: ListarSolicitudesUseCase,
  ) {}

  @Post()
  async crear(@Body() dto: CrearSolicitudDto, @Request() req: any) {
    return this.crearSolicitudUseCase.execute(
      dto,
      req.user.email,
      req.user.name,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRADOR')
  async listar(@Query('estado') estado?: EstadoSolicitud) {
    const solicitudes = await this.listarSolicitudesUseCase.execute(estado);
    return { success: true, data: solicitudes };
  }

  @Get('pendientes/count')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRADOR')
  async countPendientes() {
    const count = await this.listarSolicitudesUseCase.countPendientes();
    return { success: true, count };
  }

  @Post(':id/aprobar')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRADOR')
  async aprobar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResponderSolicitudDto,
    @Request() req: any,
  ) {
    return this.aprobarSolicitudUseCase.execute(id, req.user.email, dto.comentario);
  }

  @Post(':id/rechazar')
  @UseGuards(RolesGuard)
  @Roles('ADMINISTRADOR')
  async rechazar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ResponderSolicitudDto,
    @Request() req: any,
  ) {
    return this.rechazarSolicitudUseCase.execute(id, req.user.email, dto.comentario);
  }
}
