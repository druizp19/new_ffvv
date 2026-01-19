import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../product.entity';
import {
  IProductRepository,
  ProductFilters,
  PaginatedResult,
} from '../../domain/repositories/product.repository.interface';
import { Product, ProductFullData } from '../../domain/entities/product.entity';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async findAll(
    page: number,
    limit: number,
    search?: string,
    filters?: ProductFilters,
  ): Promise<PaginatedResult<Product>> {
    const safePage = Math.max(1, page);
    const offset = (safePage - 1) * limit;

    const whereConditions = this.buildWhereConditions(search, filters);
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const rawData = await this.repository.query(`
      SELECT 
        [Código_Presentación],
        [Descripción_Presentación],
        [Descripcion_Producto_Final],
        [Marca_Genérico],
        [Ético_Popular],
        [Molécula],
        [Código_FF_1],
        [Código_FF_3],
        [Descripción_FF_3],
        [Código_ATC_4],
        [Descripción_ATC_4],
        [Descripción_Corporación],
        [Descripción_Laboratorio],
        [MERCADO],
        [Size_Pack],
        [Stgh_Val],
        [Stgh_Mea],
        [Volu_Val],
        [Volu_Mea],
        [Fuente]
      FROM dbo.VMAE_PROD_IQVIA
      ${whereClause}
      ORDER BY [Código_Presentación]
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY
    `);

    const total = await this.getTotal(whereClause, search);

    const data = this.mapToProducts(rawData);

    return { data, total };
  }

  async findFullDataByCode(codigoPresentacion: string): Promise<ProductFullData | null> {
    try {
      const result = await this.repository.query(
        `
        SELECT 
          v.[Código_Presentación],
          v.[Descripción_Presentación],
          v.[Código_ATC_4],
          v.[Molécula],
          v.[Código_FF_1],
          v.[Código_FF_3],
          v.[Stgh_Val],
          v.[Gerente_Producto],
          COALESCE(mm.Unidad_Negocio, 'SIN ASIGNAR') as Unidad_Negocio
        FROM dbo.VMAE_PROD_IQVIA v
        LEFT JOIN [BD_BussinessI].[dbo].[MAE_CODIGO_PUENTE] pl
          ON pl.Codigo_Proveedor = v.[Código_Presentación] AND pl.Proveedor = 'IQVIA'
        LEFT JOIN [BD_BussinessI].[dbo].[MaestroMateriales] mm
          ON mm.Codigo_Interno = COALESCE(pl.Codigo_Interno, v.[Código_Presentación])
          AND mm.Unidad_Negocio <> 'Maquila'
        WHERE v.[Código_Presentación] = @0
      `,
        [codigoPresentacion],
      );

      if (!result[0]) return null;

      return {
        codigoPresentacion: result[0]['Código_Presentación'],
        descripcionPresentacion: result[0]['Descripción_Presentación'],
        codigoAtc4: result[0]['Código_ATC_4'],
        molecula: result[0]['Molécula'],
        codigoFf1: result[0]['Código_FF_1'],
        codigoFf3: result[0]['Código_FF_3'],
        stghVal: result[0]['Stgh_Val'],
        gerenteProducto: result[0]['Gerente_Producto'],
        unidadNegocio: result[0]['Unidad_Negocio'],
      };
    } catch {
      return null;
    }
  }

  async getSuggestions(field: string, query: string, limit: number = 20): Promise<string[]> {
    try {
      if (field === 'ff3') {
        const results = await this.repository.query(
          `
          SELECT DISTINCT TOP (@0) [Código_FF_3] + ' - ' + [Descripción_FF_3] as value
          FROM dbo.VMAE_PROD_IQVIA
          WHERE [Código_FF_3] LIKE @1 OR [Descripción_FF_3] LIKE @1
          ORDER BY value
        `,
          [limit, `%${query}%`],
        );
        return results.map((r: { value: string }) => r.value).filter(Boolean);
      }

      if (field === 'atc4') {
        const results = await this.repository.query(
          `
          SELECT DISTINCT TOP (@0) [Código_ATC_4] + ' - ' + [Descripción_ATC_4] as value
          FROM dbo.VMAE_PROD_IQVIA
          WHERE [Código_ATC_4] LIKE @1 OR [Descripción_ATC_4] LIKE @1
          ORDER BY value
        `,
          [limit, `%${query}%`],
        );
        return results.map((r: { value: string }) => r.value).filter(Boolean);
      }

      const fieldMapping: Record<string, string> = {
        marca: 'Descripcion_Producto_Final',
        mercado: 'MERCADO',
        molecula: 'Molécula',
        laboratorio: 'Descripción_Laboratorio',
        corporacion: 'Descripción_Corporación',
      };

      // Franquicia viene de otra tabla
      if (field === 'franquicia') {
        const results = await this.repository.query(
          `
          SELECT DISTINCT TOP (@0) [FRANQUICIA] as value
          FROM dbo.conf_mcdo_iqvia
          WHERE UPPER([FRANQUICIA]) LIKE UPPER(@1) AND [FRANQUICIA] IS NOT NULL AND [FRANQUICIA] <> ''
          ORDER BY [FRANQUICIA]
        `,
          [limit, `%${query}%`],
        );
        return results.map((r: { value: string }) => r.value).filter(Boolean);
      }

      const sqlField = fieldMapping[field];
      if (!sqlField) return [];

      const results = await this.repository.query(
        `
        SELECT DISTINCT TOP (@0) [${sqlField}] as value
        FROM dbo.VMAE_PROD_IQVIA
        WHERE [${sqlField}] LIKE @1
        ORDER BY [${sqlField}]
      `,
        [limit, `%${query}%`],
      );

      return results.map((r: { value: string }) => r.value).filter(Boolean);
    } catch {
      return [];
    }
  }

  private buildWhereConditions(search?: string, filters?: ProductFilters): string[] {
    const conditions: string[] = [];

    if (search) {
      conditions.push(`[Descripción_Presentación] LIKE '%${this.escape(search)}%'`);
    }

    if (filters) {
      if (filters.marca)
        conditions.push(`[Descripcion_Producto_Final] LIKE '%${this.escape(filters.marca)}%'`);
      if (filters.marcaGenerico)
        conditions.push(`[Marca_Genérico] = '${this.escape(filters.marcaGenerico)}'`);
      if (filters.eticoPopular)
        conditions.push(`[Ético_Popular] = '${this.escape(filters.eticoPopular)}'`);
      if (filters.mercado) conditions.push(`[MERCADO] LIKE '%${this.escape(filters.mercado)}%'`);
      if (filters.franquicia) {
        // Franquicia requiere JOIN con conf_mcdo_iqvia
        conditions.push(`EXISTS (
          SELECT 1 FROM dbo.conf_mcdo_iqvia c 
          WHERE c.CODIGO = [Código_Presentación] 
          AND UPPER(c.FRANQUICIA) LIKE UPPER('%${this.escape(filters.franquicia)}%')
        )`);
      }
      if (filters.molecula) {
        // Búsqueda exacta de molécula (sin LIKE)
        conditions.push(`[Molécula] = '${this.escape(filters.molecula)}'`);
      }

      if (filters.ff3) {
        if (filters.ff3.includes(' - ')) {
          const code = filters.ff3.split(' - ')[0];
          conditions.push(`[Código_FF_3] = '${this.escape(code)}'`);
        } else {
          conditions.push(
            `([Código_FF_3] LIKE '%${this.escape(filters.ff3)}%' OR [Descripción_FF_3] LIKE '%${this.escape(filters.ff3)}%')`,
          );
        }
      }

      if (filters.atc4) {
        if (filters.atc4.includes(' - ')) {
          const code = filters.atc4.split(' - ')[0];
          conditions.push(`[Código_ATC_4] = '${this.escape(code)}'`);
        } else {
          conditions.push(
            `([Código_ATC_4] LIKE '%${this.escape(filters.atc4)}%' OR [Descripción_ATC_4] LIKE '%${this.escape(filters.atc4)}%')`,
          );
        }
      }

      if (filters.laboratorio)
        conditions.push(`[Descripción_Laboratorio] LIKE '%${this.escape(filters.laboratorio)}%'`);
      if (filters.corporacion)
        conditions.push(`[Descripción_Corporación] LIKE '%${this.escape(filters.corporacion)}%'`);
      if (filters.concentracion)
        conditions.push(
          `([Stgh_Val] LIKE '%${this.escape(filters.concentracion)}%' OR [Stgh_Mea] LIKE '%${this.escape(filters.concentracion)}%')`,
        );
      if (filters.volumen)
        conditions.push(
          `([Volu_Val] LIKE '%${this.escape(filters.volumen)}%' OR [Volu_Mea] LIKE '%${this.escape(filters.volumen)}%')`,
        );
    }

    return conditions;
  }

  private async getTotal(whereClause: string, search?: string): Promise<number> {
    try {
      if (!search && !whereClause) {
        const partitionResult = await this.repository.query(`
          SELECT SUM(rows) as total FROM sys.partitions 
          WHERE object_id = OBJECT_ID('dbo.VMAE_PROD_IQVIA') AND index_id < 2
        `);
        const total = Number(partitionResult[0]?.total || 0);
        if (total > 0) return total;
      }

      const countResult = await this.repository.query(
        `SELECT COUNT(*) as total FROM dbo.VMAE_PROD_IQVIA ${whereClause}`,
      );
      return Number(countResult[0]?.total || 0);
    } catch {
      const countResult = await this.repository.query(
        `SELECT COUNT(*) as total FROM dbo.VMAE_PROD_IQVIA ${whereClause}`,
      );
      return Number(countResult[0]?.total || 0);
    }
  }

  private mapToProducts(rawData: any[]): Product[] {
    return rawData.map((item) => ({
      id: item['Código_Presentación'],
      presentacion: item['Descripción_Presentación'],
      marca: item['Descripcion_Producto_Final'],
      marcaGenerico: item['Marca_Genérico'],
      eticoPopular: item['Ético_Popular'],
      molecula: item['Molécula'],
      ff1: item['Código_FF_1'] || '',
      ff3: `${item['Código_FF_3'] || ''} - ${item['Descripción_FF_3'] || ''}`.trim(),
      atc4: `${item['Código_ATC_4'] || ''} - ${item['Descripción_ATC_4'] || ''}`.trim(),
      corporacion: item['Descripción_Corporación'],
      laboratorio: item['Descripción_Laboratorio'],
      mercado: item['MERCADO'],
      sizePack: item['Size_Pack'],
      concentracion: `${item['Stgh_Val'] || ''} ${item['Stgh_Mea'] || ''}`.trim(),
      volumen: `${item['Volu_Val'] || ''} ${item['Volu_Mea'] || ''}`.trim(),
      fuente: item['Fuente'],
    }));
  }

  private escape(value: string): string {
    return value.replace(/'/g, "''");
  }
}
