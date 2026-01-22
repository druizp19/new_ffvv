import { Inject, Injectable } from '@nestjs/common';
import type {
  IProductRepository} from '../../domain/repositories/product.repository.interface';
import {
  PRODUCT_REPOSITORY,
} from '../../domain/repositories/product.repository.interface';
import type {
  IMarketConfigRepository} from '../../domain/repositories/market-config.repository.interface';
import {
  MARKET_CONFIG_REPOSITORY,
} from '../../domain/repositories/market-config.repository.interface';
import { ProductDataDto } from '../dtos/assign-market.dto';

export interface AssignToMarketResult {
  success: boolean;
  message: string;
  count: number;
}

type TipoAgrupacion =
  | 'PRESENTACION'
  | 'ATC4'
  | 'MOLECULA'
  | 'ATC4_MOLECULA'
  | 'ATC4_FF1'
  | 'ATC4_MOLECULA_FF1'
  | 'ATC4_MOLECULA_FF3';

@Injectable()
export class AssignToMarketUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
    @Inject(MARKET_CONFIG_REPOSITORY)
    private readonly marketConfigRepository: IMarketConfigRepository,
  ) {}

  async execute(
    productos: ProductDataDto[],
    mercado: string,
    franquicia: string,
    tipoAgrupacion: TipoAgrupacion = 'PRESENTACION',
    isNewMarket: boolean = false,
  ): Promise<AssignToMarketResult> {
    console.log('🎯 [AssignToMarket] Iniciando asignación');
    console.log('🎯 [AssignToMarket] Mercado:', mercado);
    console.log('🎯 [AssignToMarket] Franquicia:', franquicia);
    console.log('🎯 [AssignToMarket] Tipo agrupación:', tipoAgrupacion);
    console.log('🎯 [AssignToMarket] Es mercado nuevo:', isNewMarket);
    console.log('🎯 [AssignToMarket] Cantidad productos:', productos.length);

    try {
      let processedCount = 0;
      const processedCodigos = new Set<string>();

      // Obtener el gerente según el caso
      let gerente: string | null = null;

      if (isNewMarket) {
        console.log('🔍 [AssignToMarket] Buscando gerente por franquicia:', franquicia);
        gerente = await this.marketConfigRepository.findGerenteByFranquicia(franquicia);
        console.log('👤 [AssignToMarket] Gerente encontrado:', gerente);
      } else {
        console.log('🔍 [AssignToMarket] Buscando gerente por mercado:', mercado);
        gerente = await this.marketConfigRepository.findGerenteByMercado(mercado);
        console.log('👤 [AssignToMarket] Gerente encontrado:', gerente);
      }

      for (const producto of productos) {
        const codigoGenerado = this.generateCodigo(producto, tipoAgrupacion);
        console.log(`📦 [AssignToMarket] Procesando código: ${codigoGenerado}`);

        if (processedCodigos.has(codigoGenerado)) {
          console.log(`⏭️  [AssignToMarket] Código ya procesado, saltando: ${codigoGenerado}`);
          continue;
        }
        processedCodigos.add(codigoGenerado);

        // Verificar si ya existe el código en la tabla (sin importar el mercado)
        const exists = await this.marketConfigRepository.existsByCodigo(codigoGenerado);
        console.log(`🔍 [AssignToMarket] ¿Existe código ${codigoGenerado}?`, exists);

        if (exists) {
          // Si existe, hacer UPDATE del mercado, franquicia y gerente
          console.log(`🔄 [AssignToMarket] Actualizando código existente: ${codigoGenerado}`);
          await this.marketConfigRepository.updateMercadoByCodigo(
            codigoGenerado,
            mercado,
            franquicia || '',
            gerente,
          );
          console.log(`✅ [AssignToMarket] Código actualizado: ${codigoGenerado}`);
        } else {
          // Si no existe, hacer INSERT
          console.log(`➕ [AssignToMarket] Insertando nuevo código: ${codigoGenerado}`);
          const productData =
            tipoAgrupacion === 'PRESENTACION'
              ? await this.productRepository.findFullDataByCode(producto.codigo)
              : null;

          console.log(`📊 [AssignToMarket] ProductData:`, productData);
          console.log(`📊 [AssignToMarket] UnidadNegocio del producto:`, productData?.unidadNegocio);

          const tipo = this.getTipoFromAgrupacion(tipoAgrupacion);
          
          // Determinar qué campos deben ser NULL según el tipo de agrupación
          const shouldIncludeDetailFields = tipoAgrupacion === 'PRESENTACION';

          const dataToInsert = {
            codigo: codigoGenerado,
            mercado,
            tipo,
            unicoTipo: 1,
            franquicia: franquicia || '',
            gerente: gerente || productData?.gerenteProducto || undefined,
            unidadNegocio: (productData?.unidadNegocio && productData.unidadNegocio !== 'SIN ASIGNAR') 
              ? productData.unidadNegocio 
              : 'FARMA',
            contratadoCu: 'SI',
            atc: producto.atc4 || '',
            molecula: producto.molecula || '',
            f1: shouldIncludeDetailFields ? (producto.ff1 || '') : undefined,
            codigoFf3: shouldIncludeDetailFields ? (producto.ff3 || '') : undefined,
            stghVal: shouldIncludeDetailFields ? (producto.stghVal || '') : undefined,
            codPack: shouldIncludeDetailFields ? producto.codigo : undefined,
            pack: shouldIncludeDetailFields ? '' : undefined,
          };

          console.log(`📊 [AssignToMarket] Datos a insertar:`, dataToInsert);
          await this.marketConfigRepository.create(dataToInsert);
          console.log(`✅ [AssignToMarket] Código insertado: ${codigoGenerado}`);
        }

        processedCount++;
      }

      console.log(`✅ [AssignToMarket] Proceso completado. Total procesados: ${processedCount}`);
      return {
        success: true,
        message: `${processedCount} producto(s) asignado(s) al mercado ${mercado}`,
        count: processedCount,
      };
    } catch (error: any) {
      console.error('❌ [AssignToMarket] Error:', error);
      console.error('❌ [AssignToMarket] Stack:', error.stack);
      return {
        success: false,
        message: error.message || 'Error al asignar productos',
        count: 0,
      };
    }
  }

  private generateCodigo(producto: ProductDataDto, tipoAgrupacion: TipoAgrupacion): string {
    switch (tipoAgrupacion) {
      case 'PRESENTACION':
        return producto.codigo;
      case 'ATC4':
        return producto.atc4 || '';
      case 'MOLECULA':
        return producto.molecula || '';
      case 'ATC4_MOLECULA':
        return `${producto.atc4 || ''}${producto.molecula || ''}`;
      case 'ATC4_FF1':
        return `${producto.atc4 || ''}${producto.ff1 || ''}`;
      case 'ATC4_MOLECULA_FF1':
        return `${producto.atc4 || ''}${producto.molecula || ''}${producto.ff1 || ''}`;
      case 'ATC4_MOLECULA_FF3':
        return `${producto.atc4 || ''}${producto.molecula || ''}${producto.ff3 || ''}`;
      default:
        return producto.codigo;
    }
  }

  private getTipoFromAgrupacion(tipoAgrupacion: TipoAgrupacion): string {
    const mapping: Record<TipoAgrupacion, string> = {
      PRESENTACION: 'PRODUCTO',
      ATC4: 'ATC4',
      MOLECULA: 'MOLECULA',
      ATC4_MOLECULA: 'ATC4_MOLECULA',
      ATC4_FF1: 'ATC4_FF1',
      ATC4_MOLECULA_FF1: 'ATC4_MOLECULA_FF1',
      ATC4_MOLECULA_FF3: 'ATC4_MOLECULA_FF3',
    };
    return mapping[tipoAgrupacion] || 'PRODUCTO';
  }
}
