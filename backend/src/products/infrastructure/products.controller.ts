import { Controller, Get, Post, Put, Delete, Query, Body, UseGuards, Request, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  GetProductsUseCase,
  GetSuggestionsUseCase,
  GetMarketsUseCase,
  AssignToMarketUseCase,
  ChangeMarketUseCase,
  RemoveFromMarketUseCase,
} from '../application/use-cases';
import {
  GetProductsQueryDto,
  AssignMarketDto,
  ChangeMarketDto,
  RemoveMarketDto,
} from '../application/dtos';
import { CrearSolicitudUseCase } from '../../solicitudes/application/use-cases/crear-solicitud.use-case';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly getSuggestionsUseCase: GetSuggestionsUseCase,
    private readonly getMarketsUseCase: GetMarketsUseCase,
    private readonly assignToMarketUseCase: AssignToMarketUseCase,
    private readonly changeMarketUseCase: ChangeMarketUseCase,
    private readonly removeFromMarketUseCase: RemoveFromMarketUseCase,
    private readonly crearSolicitudUseCase: CrearSolicitudUseCase,
  ) {}

  private isAdmin(user: any): boolean {
    return user?.rol?.toUpperCase() === 'ADMINISTRADOR';
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // 5 minutos
  async findAll(@Query() query: GetProductsQueryDto) {
    const { page, limit, search, ...filters } = query;
    return this.getProductsUseCase.execute(page || 1, limit || 50, search, filters);
  }

  @Get('suggestions')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(600000) // 10 minutos para sugerencias
  async getSuggestions(
    @Query('field') field: string,
    @Query('query') query: string,
    @Query('limit') limit?: number,
  ) {
    return this.getSuggestionsUseCase.execute(field, query, limit);
  }

  @Get('markets')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(600000) // 10 minutos para mercados
  async getMarkets() {
    return this.getMarketsUseCase.execute();
  }

  @Get('franquicias')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(600000) // 10 minutos para franquicias
  async getFranquicias() {
    return this.getMarketsUseCase.getFranquicias();
  }

  @Post('assign-market')
  async assignToMarket(@Body() dto: AssignMarketDto, @Request() req: any) {
    // Si es ADMIN, ejecutar directamente
    if (this.isAdmin(req.user)) {
      return this.assignToMarketUseCase.execute(
        dto.productos,
        dto.mercado,
        dto.franquicia || '',
        (dto.tipoAgrupacion as any) || 'PRESENTACION',
        dto.isNewMarket || false,
      );
    }

    // Si es GERENTE, crear solicitud
    const tipoOperacion = dto.isNewMarket ? 'CREAR' : 'ASIGNAR';
    return this.crearSolicitudUseCase.execute(
      {
        tipoOperacion,
        productos: dto.productos,
        mercado: dto.mercado,
        franquicia: dto.franquicia || '',
        tipoAgrupacion: dto.tipoAgrupacion,
        isNewMarket: dto.isNewMarket,
        comentarioSolicitante: dto.comentarioSolicitante,
      },
      req.user.email,
      req.user.name,
    );
  }

  @Put('change-market')
  async changeMarket(@Body() dto: ChangeMarketDto, @Request() req: any) {
    // Si es ADMIN, ejecutar directamente
    if (this.isAdmin(req.user)) {
      return this.changeMarketUseCase.execute(
        dto.codigos,
        dto.oldMercado,
        dto.newMercado,
        dto.newFranquicia,
      );
    }

    // Si es GERENTE, crear solicitud - usar productos si están disponibles
    const productos = dto.productos || dto.codigos.map((codigo) => ({ codigo }));
    return this.crearSolicitudUseCase.execute(
      {
        tipoOperacion: 'CAMBIAR',
        productos,
        mercadoOrigen: dto.oldMercado,
        mercadoDestino: dto.newMercado,
        franquiciaDestino: dto.newFranquicia,
        comentarioSolicitante: dto.comentarioSolicitante,
      },
      req.user.email,
      req.user.name,
    );
  }

  @Delete('remove-market')
  async removeFromMarket(@Body() dto: RemoveMarketDto, @Request() req: any) {
    // Si es ADMIN, ejecutar directamente
    if (this.isAdmin(req.user)) {
      return this.removeFromMarketUseCase.execute(dto.productos, dto.mercado);
    }

    // Si es GERENTE, crear solicitud
    return this.crearSolicitudUseCase.execute(
      {
        tipoOperacion: 'QUITAR',
        productos: dto.productos,
        mercadoOrigen: dto.mercado,
        comentarioSolicitante: dto.comentarioSolicitante,
      },
      req.user.email,
      req.user.name,
    );
  }
}
