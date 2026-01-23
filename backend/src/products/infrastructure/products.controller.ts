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
import { EmailService } from '../../common/email/email.service';

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
    private readonly emailService: EmailService,
  ) {}

  private isAdmin(user: any): boolean {
    const rol = user?.rol?.toUpperCase().replace(/\s+/g, '_');
    return rol === 'ADMINISTRADOR' || rol === 'ADMIN' || rol === 'SUPER_ADMIN';
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(30000) // 30 segundos - balance entre frescura y rendimiento
  async findAll(@Query() query: GetProductsQueryDto) {
    const startTime = Date.now();
    const { page, limit, search, ...filters } = query;
    
    const result = await this.getProductsUseCase.execute(page || 1, limit || 50, search, filters);
    
    const duration = Date.now() - startTime;
    console.log(`⚡ [GetProducts] Tiempo de respuesta: ${duration}ms | Página: ${page || 1} | Resultados: ${result.data.length}`);
    
    return result;
  }

  @Get('suggestions')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000) // 60 segundos para sugerencias
  async getSuggestions(
    @Query('field') field: string,
    @Query('query') query: string,
    @Query('limit') limit?: number,
  ) {
    return this.getSuggestionsUseCase.execute(field, query, limit);
  }

  @Get('markets')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000) // 60 segundos para mercados
  async getMarkets() {
    return this.getMarketsUseCase.execute();
  }

  @Get('franquicias')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60000) // 60 segundos para franquicias
  async getFranquicias() {
    return this.getMarketsUseCase.getFranquicias();
  }

  @Post('assign-market')
  async assignToMarket(@Body() dto: AssignMarketDto, @Request() req: any) {
    console.log('🔧 [AssignMarket] Usuario:', req.user.email, 'Rol:', req.user.rol);
    console.log('🔧 [AssignMarket] isAdmin:', this.isAdmin(req.user));
    
    // Si es ADMIN, ejecutar directamente
    if (this.isAdmin(req.user)) {
      console.log('✅ [AssignMarket] Usuario es ADMIN, ejecutando directamente');
      const result = await this.assignToMarketUseCase.execute(
        dto.productos,
        dto.mercado,
        dto.franquicia || '',
        (dto.tipoAgrupacion as any) || 'PRESENTACION',
        dto.isNewMarket || false,
      );
      
      // Enviar email a gerentes notificando el cambio directo
      if (result.success) {
        const tipoOperacion = dto.isNewMarket ? 'CREAR MERCADO' : 'ASIGNAR A MERCADO';
        await this.emailService.sendCambioDirectoAdmin(
          req.user.email,
          req.user.name,
          tipoOperacion,
          dto.mercado,
          dto.productos.length,
        );
        console.log('📧 [AssignMarket] Email enviado a gerentes');
      }
      
      return result;
    }

    // Si es GERENTE, crear solicitud
    console.log('📝 [AssignMarket] Usuario es GERENTE, creando solicitud');
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
      const result = await this.changeMarketUseCase.execute(
        dto.codigos,
        dto.oldMercado,
        dto.newMercado,
        dto.newFranquicia,
      );
      
      // Enviar email a gerentes notificando el cambio directo
      if (result.success) {
        await this.emailService.sendCambioDirectoAdmin(
          req.user.email,
          req.user.name,
          'CAMBIAR MERCADO',
          `${dto.oldMercado} → ${dto.newMercado}`,
          dto.codigos.length,
        );
        console.log('📧 [ChangeMarket] Email enviado a gerentes');
      }
      
      return result;
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
      const result = await this.removeFromMarketUseCase.execute(dto.productos, dto.mercado);
      
      // Enviar email a gerentes notificando el cambio directo
      if (result.success) {
        await this.emailService.sendCambioDirectoAdmin(
          req.user.email,
          req.user.name,
          'QUITAR DE MERCADO',
          dto.mercado || 'RESTO',
          dto.productos.length,
        );
        console.log('📧 [RemoveMarket] Email enviado a gerentes');
      }
      
      return result;
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
