import { Inject, Injectable } from '@nestjs/common';
import type {
  IMarketConfigRepository} from '../../domain/repositories/market-config.repository.interface';
import {
  MARKET_CONFIG_REPOSITORY,
} from '../../domain/repositories/market-config.repository.interface';
import { Market } from '../../domain/entities/market-config.entity';

@Injectable()
export class GetMarketsUseCase {
  constructor(
    @Inject(MARKET_CONFIG_REPOSITORY)
    private readonly marketConfigRepository: IMarketConfigRepository,
  ) {}

  async execute(): Promise<Market[]> {
    return this.marketConfigRepository.findAllMarkets();
  }

  async getFranquicias(): Promise<string[]> {
    return this.marketConfigRepository.findAllFranquicias();
  }
}
