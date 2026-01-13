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
    try {
      let processedCount = 0;
      const processedCodigos = new Set<string>();

      // Obtener el gerente según el caso
      let gerente: string | null = null;

      if (isNewMarket) {
        // Para mercado nuevo: buscar gerente por franquicia usando LIKE
        gerente = await this.marketConfigRepository.findGerenteByFranquicia(franquicia);
      } else {
        // Para mercado existente: obtener gerente del mercado
        gerente = await this.marketConfigRepository.findGerenteByMercado(mercado);
      }

      for (const producto of productos) {
        const codigoGenerado = this.generateCodigo(producto, tipoAgrupacion);

        if (processedCodigos.has(codigoGenerado)) continue;
        processedCodigos.add(codigoGenerado);

        // Verificar si ya existe el código en la tabla (sin importar el mercado)
        const exists = await this.marketConfigRepository.existsByCodigo(codigoGenerado);

        if (exists) {
          // Si existe, hacer UPDATE del mercado, franquicia y gerente
          await this.marketConfigRepository.updateMercadoByCodigo(
            codigoGenerado,
            mercado,
            franquicia || '',
            gerente,
          );
        } else {
          // Si no existe, hacer INSERT
          const productData =
            tipoAgrupacion === 'PRESENTACION'
              ? await this.productRepository.findFullDataByCode(producto.codigo)
              : null;

          const tipo = this.getTipoFromAgrupacion(tipoAgrupacion);

          await this.marketConfigRepository.create({
            codigo: codigoGenerado,
            mercado,
            tipo,
            unicoTipo: 1,
            franquicia: franquicia || '',
            gerente: gerente || productData?.gerenteProducto || '',
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
        }

        processedCount++;
      }

      return {
        success: true,
        message: `${processedCount} producto(s) asignado(s) al mercado ${mercado}`,
        count: processedCount,
      };
    } catch (error: any) {
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
