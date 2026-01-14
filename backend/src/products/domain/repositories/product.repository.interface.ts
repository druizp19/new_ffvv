import { Product, ProductFullData } from '../entities/product.entity';

export interface ProductFilters {
  marca?: string;
  marcaGenerico?: string;
  eticoPopular?: string;
  mercado?: string;
  franquicia?: string;
  molecula?: string;
  ff3?: string;
  atc4?: string;
  laboratorio?: string;
  corporacion?: string;
  concentracion?: string;
  volumen?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
}

export interface IProductRepository {
  findAll(
    page: number,
    limit: number,
    search?: string,
    filters?: ProductFilters,
  ): Promise<PaginatedResult<Product>>;

  findFullDataByCode(codigoPresentacion: string): Promise<ProductFullData | null>;

  getSuggestions(field: string, query: string, limit?: number): Promise<string[]>;
}

export const PRODUCT_REPOSITORY = Symbol('IProductRepository');
