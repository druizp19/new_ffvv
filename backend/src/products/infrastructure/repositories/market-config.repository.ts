import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../product.entity';
import { IMarketConfigRepository } from '../../domain/repositories/market-config.repository.interface';
import { Market, MarketConfig } from '../../domain/entities/market-config.entity';

@Injectable()
export class MarketConfigRepository implements IMarketConfigRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>,
  ) {}

  async findAllMarkets(): Promise<Market[]> {
    try {
      const results = await this.repository.query(`
        SELECT DISTINCT MERCADO as mercado, FRANQUICIA as franquicia
        FROM BD_MFFVV.dbo.VMAE_PROD_IQVIA
        where franquicia is not null 
        and Mercado NOT IN ('RESTO','OTROS')
        ORDER BY MERCADO
      `);
      return results;
    } catch {
      return [];
    }
  }

  async findAllFranquicias(): Promise<string[]> {
    try {
      const results = await this.repository.query(`
        SELECT DISTINCT FRANQUICIA as franquicia
        FROM BD_MFFVV.dbo.VMAE_PROD_IQVIA
        WHERE FRANQUICIA IS NOT NULL 
        AND FRANQUICIA <> ''
        AND FRANQUICIA NOT IN ('RESTO', 'OTROS')
        AND UNIDAD_NEGOCIO = 'FARMA'
        ORDER BY FRANQUICIA
      `);
      return results.map((r: { franquicia: string }) => r.franquicia).filter(Boolean);
    } catch {
      return [];
    }
  }

  async findByCodigoAndMercado(codigo: string, mercado: string): Promise<MarketConfig | null> {
    try {
      const result = await this.repository.query(
        `SELECT * FROM dbo.conf_mcdo_iqvia WHERE CODIGO = @0 AND MERCADO = @1`,
        [codigo, mercado],
      );
      return result[0] || null;
    } catch {
      return null;
    }
  }

  async create(config: Partial<MarketConfig>): Promise<void> {
    await this.repository.query(
      `
      INSERT INTO dbo.conf_mcdo_iqvia 
      (CODIGO, MERCADO, TIPO, UNICO_TIPO, FRANQUICIA, GERENTE, UNIDAD_NEGOCIO, CONTRATADO_CU, ATC, MOLECULA, F1, Código_FF_3, STGH_VAL, COD_PACK, PACK)
      VALUES (@0, @1, @2, @3, @4, @5, @6, @7, @8, @9, @10, @11, @12, @13, @14)
    `,
      [
        config.codigo,
        config.mercado,
        config.tipo,
        config.unicoTipo,
        config.franquicia,
        config.gerente,
        config.unidadNegocio,
        config.contratadoCu,
        config.atc,
        config.molecula,
        config.f1,
        config.codigoFf3,
        config.stghVal,
        config.codPack,
        config.pack,
      ],
    );
  }

  async updateMercado(
    codigos: string[],
    oldMercado: string,
    newMercado: string,
    newFranquicia: string,
    gerente: string | null,
  ): Promise<number> {
    const codigosList = codigos.map((c) => `'${this.escape(c)}'`).join(',');
    const gerenteValue = gerente ? `'${this.escape(gerente)}'` : 'NULL';
    await this.repository.query(`
      UPDATE dbo.conf_mcdo_iqvia 
      SET MERCADO = '${this.escape(newMercado)}', FRANQUICIA = '${this.escape(newFranquicia)}', GERENTE = ${gerenteValue}
      WHERE CODIGO IN (${codigosList})
      AND MERCADO = '${this.escape(oldMercado)}'
    `);
    return codigos.length;
  }

  async moveToResto(codigos: string[], mercado?: string): Promise<number> {
    const codigosList = codigos.map((c) => `'${this.escape(c)}'`).join(',');

    // Actualizar los registros existentes a RESTO con GERENTE = NULL
    let updateQuery = `
      UPDATE dbo.conf_mcdo_iqvia 
      SET MERCADO = 'RESTO', FRANQUICIA = 'RESTO', GERENTE = NULL
      WHERE CODIGO IN (${codigosList})
    `;

    if (mercado) {
      updateQuery += ` AND MERCADO = '${this.escape(mercado)}'`;
    }

    await this.repository.query(updateQuery);
    return codigos.length;
  }

  async insertAsResto(config: Partial<MarketConfig>): Promise<void> {
    await this.repository.query(
      `
      INSERT INTO dbo.conf_mcdo_iqvia 
      (CODIGO, MERCADO, TIPO, UNICO_TIPO, FRANQUICIA, GERENTE, UNIDAD_NEGOCIO, CONTRATADO_CU, ATC, MOLECULA, F1, Código_FF_3, STGH_VAL, COD_PACK, PACK)
      VALUES (@0, 'RESTO', @1, @2, 'RESTO', NULL, @3, @4, @5, @6, @7, @8, @9, @10, @11)
    `,
      [
        config.codigo,
        config.tipo || 'PRODUCTO',
        config.unicoTipo || 1,
        config.unidadNegocio || 'SIN ASIGNAR',
        config.contratadoCu || 'SI',
        config.atc || '',
        config.molecula || '',
        config.f1 || '',
        config.codigoFf3 || '',
        config.stghVal || '',
        config.codPack || '',
        config.pack || '',
      ],
    );
  }

  async existsByCodigo(codigo: string): Promise<boolean> {
    const result = await this.repository.query(
      `SELECT COUNT(*) as count FROM dbo.conf_mcdo_iqvia WHERE CODIGO = @0`,
      [codigo],
    );
    return result[0]?.count > 0;
  }

  async updateMercadoByCodigo(
    codigo: string,
    mercado: string,
    franquicia: string,
    gerente: string | null,
  ): Promise<void> {
    await this.repository.query(
      `
      UPDATE dbo.conf_mcdo_iqvia 
      SET MERCADO = @1, FRANQUICIA = @2, GERENTE = @3
      WHERE CODIGO = @0
    `,
      [codigo, mercado, franquicia, gerente],
    );
  }

  // Buscar gerente por franquicia - búsqueda exacta primero, luego LIKE
  async findGerenteByFranquicia(franquicia: string): Promise<string | null> {
    try {
      // Primero intentar búsqueda exacta
      let result = await this.repository.query(
        `
        SELECT TOP 1 GERENTE_PRODUCTO as gerente
        FROM BD_MFFVV.dbo.VMAE_PROD_IQVIA
        WHERE Unidad_Negocio = 'FARMA'
        AND FRANQUICIA = @0
        AND GERENTE_PRODUCTO IS NOT NULL
        ORDER BY GERENTE_PRODUCTO
        `,
        [franquicia],
      );
      
      // Si no encuentra, intentar con LIKE
      if (!result[0]?.gerente) {
        result = await this.repository.query(
          `
          SELECT TOP 1 GERENTE_PRODUCTO as gerente
          FROM BD_MFFVV.dbo.VMAE_PROD_IQVIA
          WHERE Unidad_Negocio = 'FARMA'
          AND FRANQUICIA LIKE @0
          AND GERENTE_PRODUCTO IS NOT NULL
          ORDER BY GERENTE_PRODUCTO
          `,
          [`%${franquicia}%`],
        );
      }
      
      return result[0]?.gerente || null;
    } catch {
      return null;
    }
  }

  // Obtener gerente de un mercado existente
  async findGerenteByMercado(mercado: string): Promise<string | null> {
    try {
      const result = await this.repository.query(
        `
        SELECT TOP 1 GERENTE_PRODUCTO as gerente
        FROM BD_MFFVV.dbo.VMAE_PROD_IQVIA
        WHERE Unidad_Negocio = 'FARMA'
        AND MERCADO = @0
        AND GERENTE_PRODUCTO IS NOT NULL
        `,
        [mercado],
      );
      return result[0]?.gerente || null;
    } catch {
      return null;
    }
  }

  async findMercadosByCodigo(codigo: string): Promise<string[]> {
    try {
      const results = await this.repository.query(
        `SELECT MERCADO FROM dbo.conf_mcdo_iqvia WHERE CODIGO = @0`,
        [codigo],
      );
      return results.map((r: { MERCADO: string }) => r.MERCADO);
    } catch {
      return [];
    }
  }

  private escape(value: string): string {
    return value.replace(/'/g, "''");
  }
}
