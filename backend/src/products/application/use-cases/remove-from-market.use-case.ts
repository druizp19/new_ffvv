import { Inject, Injectable } from '@nestjs/common';
import type {
  IMarketConfigRepository} from '../../domain/repositories/market-config.repository.interface';
import {
  MARKET_CONFIG_REPOSITORY,
} from '../../domain/repositories/market-config.repository.interface';
import type {
  IProductRepository} from '../../domain/repositories/product.repository.interface';
import {
  PRODUCT_REPOSITORY,
} from '../../domain/repositories/product.repository.interface';
import { ProductoRestoDto } from '../dtos/remove-market.dto';

export interface RemoveFromMarketResult {
  success: boolean;
  message: string;
  count: number;
}

@Injectable()
export class RemoveFromMarketUseCase {
  constructor(
    @Inject(MARKET_CONFIG_REPOSITORY)
    private readonly marketConfigRepository: IMarketConfigRepository,
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(productos: ProductoRestoDto[], mercado?: string): Promise<RemoveFromMarketResult> {
    console.log('🗑️ [RemoveFromMarket] Iniciando remoción de productos');
    console.log('🗑️ [RemoveFromMarket] Cantidad productos:', productos.length);
    console.log('🗑️ [RemoveFromMarket] Mercado origen:', mercado || 'Todos los mercados');

    try {
      // Separar productos que existen vs los que no existen
      const existingCodes: string[] = [];
      const newProducts: ProductoRestoDto[] = [];

      console.log('🔍 [RemoveFromMarket] Verificando existencia de productos...');
      // Verificar cuáles existen en lote sería más eficiente, pero por simplicidad mantenemos el loop
      for (const producto of productos) {
        const exists = await this.marketConfigRepository.existsByCodigo(producto.codigo);
        if (exists) {
          existingCodes.push(producto.codigo);
        } else {
          newProducts.push(producto);
        }
      }

      console.log(`📊 [RemoveFromMarket] Productos existentes: ${existingCodes.length}`);
      console.log(`📊 [RemoveFromMarket] Productos nuevos: ${newProducts.length}`);

      let processedCount = 0;

      // Actualizar todos los existentes a RESTO en una sola operación
      if (existingCodes.length > 0) {
        console.log('🔄 [RemoveFromMarket] Moviendo productos existentes a RESTO...');
        await this.marketConfigRepository.moveToResto(existingCodes, mercado);
        processedCount += existingCodes.length;
        console.log(`✅ [RemoveFromMarket] ${existingCodes.length} productos movidos a RESTO`);
      }

      // Insertar los nuevos como RESTO
      if (newProducts.length > 0) {
        console.log('➕ [RemoveFromMarket] Insertando productos nuevos como RESTO...');
        for (const producto of newProducts) {
          const productData = await this.productRepository.findFullDataByCode(producto.codigo);

          await this.marketConfigRepository.insertAsResto({
            codigo: producto.codigo,
            tipo: 'PRODUCTO',
            unicoTipo: 1,
            gerente: undefined, // RESTO no tiene gerente
            unidadNegocio: productData?.unidadNegocio || 'SIN ASIGNAR',
            contratadoCu: 'SI',
            atc: producto.atc4 || '',
            molecula: producto.molecula || '',
            f1: producto.ff1 || '',
            codigoFf3: producto.ff3 || '',
            stghVal: producto.stghVal || '',
            codPack: producto.codigo,
            pack: '',
          });
          processedCount++;
        }
        console.log(`✅ [RemoveFromMarket] ${newProducts.length} productos insertados como RESTO`);
      }

      console.log(`✅ [RemoveFromMarket] Proceso completado. Total procesados: ${processedCount}`);
      return {
        success: true,
        message: `${processedCount} producto(s) movido(s) a RESTO`,
        count: processedCount,
      };
    } catch (error: any) {
      console.error('❌ [RemoveFromMarket] Error:', error);
      console.error('❌ [RemoveFromMarket] Stack:', error.stack);
      return {
        success: false,
        message: error.message || 'Error al mover productos a RESTO',
        count: 0,
      };
    }
  }
}
