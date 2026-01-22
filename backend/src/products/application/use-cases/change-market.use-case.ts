import { Inject, Injectable } from '@nestjs/common';
import type { IMarketConfigRepository } from '../../domain/repositories/market-config.repository.interface';
import { MARKET_CONFIG_REPOSITORY } from '../../domain/repositories/market-config.repository.interface';

export interface ChangeMarketResult {
  success: boolean;
  message: string;
  count: number;
}

@Injectable()
export class ChangeMarketUseCase {
  constructor(
    @Inject(MARKET_CONFIG_REPOSITORY)
    private readonly marketConfigRepository: IMarketConfigRepository,
  ) {}

  async execute(
    codigos: string[],
    oldMercado: string,
    newMercado: string,
    newFranquicia: string,
  ): Promise<ChangeMarketResult> {
    console.log('🔄 [ChangeMarket] Iniciando cambio de mercado');
    console.log('🔄 [ChangeMarket] Códigos:', codigos);
    console.log('🔄 [ChangeMarket] Mercado origen:', oldMercado);
    console.log('🔄 [ChangeMarket] Mercado destino:', newMercado);
    console.log('🔄 [ChangeMarket] Franquicia destino:', newFranquicia);

    try {
      // Obtener el gerente del nuevo mercado
      console.log('🔍 [ChangeMarket] Buscando gerente por mercado:', newMercado);
      const gerente = await this.marketConfigRepository.findGerenteByMercado(newMercado);
      console.log('👤 [ChangeMarket] Gerente encontrado:', gerente);

      const count = await this.marketConfigRepository.updateMercado(
        codigos,
        oldMercado,
        newMercado,
        newFranquicia,
        gerente,
      );

      console.log(`✅ [ChangeMarket] Proceso completado. Total actualizados: ${count}`);
      return {
        success: true,
        message: `Productos cambiados al mercado ${newMercado}`,
        count,
      };
    } catch (error: any) {
      console.error('❌ [ChangeMarket] Error:', error);
      console.error('❌ [ChangeMarket] Stack:', error.stack);
      return {
        success: false,
        message: error.message || 'Error al cambiar mercado',
        count: 0,
      };
    }
  }
}
