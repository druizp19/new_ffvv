import { Inject, Injectable } from '@nestjs/common';
import type {
  IProductRepository,
} from '../../domain/repositories/product.repository.interface';
import {
  PRODUCT_REPOSITORY,
} from '../../domain/repositories/product.repository.interface';

@Injectable()
export class GetSuggestionsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(field: string, query: string, limit: number = 20): Promise<string[]> {
    return this.productRepository.getSuggestions(field, query, limit);
  }
}
