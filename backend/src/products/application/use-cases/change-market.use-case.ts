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
    try {
      // Obtener el gerente del nuevo mercado
      const gerente = await this.marketConfigRepository.findGerenteByMercado(newMercado);

      const count = await this.marketConfigRepository.updateMercado(
        codigos,
        oldMercado,
        newMercado,
        newFranquicia,
        gerente,
      );

      return {
        success: true,
        message: `Productos cambiados al mercado ${newMercado}`,
        count,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Error al cambiar mercado',
        count: 0,
      };
    }
  }
}
