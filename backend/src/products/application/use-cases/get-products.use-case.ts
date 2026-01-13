import { Inject, Injectable } from '@nestjs/common';
import type {
  IProductRepository,
  ProductFilters,
  PaginatedResult,
} from '../../domain/repositories/product.repository.interface';
import {
  PRODUCT_REPOSITORY,
} from '../../domain/repositories/product.repository.interface';
import { Product } from '../../domain/entities/product.entity';

@Injectable()
export class GetProductsUseCase {
  constructor(
    @Inject(PRODUCT_REPOSITORY)
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(
    page: number,
    limit: number,
    search?: string,
    filters?: ProductFilters,
  ): Promise<PaginatedResult<Product>> {
    return this.productRepository.findAll(page, limit, search, filters);
  }
}
