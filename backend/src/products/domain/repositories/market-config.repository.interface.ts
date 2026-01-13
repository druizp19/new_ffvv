import { Market, MarketConfig } from '../entities/market-config.entity';

export interface IMarketConfigRepository {
  findAllMarkets(): Promise<Market[]>;

  findByCodigoAndMercado(codigo: string, mercado: string): Promise<MarketConfig | null>;

  create(config: Partial<MarketConfig>): Promise<void>;

  updateMercado(
    codigos: string[],
    oldMercado: string,
    newMercado: string,
    newFranquicia: string,
    gerente: string | null,
  ): Promise<number>;

  moveToResto(codigos: string[], mercado?: string): Promise<number>;

  insertAsResto(config: Partial<MarketConfig>): Promise<void>;

  existsByCodigo(codigo: string): Promise<boolean>;

  updateMercadoByCodigo(
    codigo: string,
    mercado: string,
    franquicia: string,
    gerente: string | null,
  ): Promise<void>;

  findGerenteByFranquicia(franquicia: string): Promise<string | null>;

  findGerenteByMercado(mercado: string): Promise<string | null>;

  findMercadosByCodigo(codigo: string): Promise<string[]>;
}

export const MARKET_CONFIG_REPOSITORY = Symbol('IMarketConfigRepository');
