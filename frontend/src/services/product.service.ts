import { apiService } from './api.service';
import type {
  Product,
  Market,
  ProductFilters,
  PaginatedResponse,
  ApiResult,
  ProductData,
  TipoAgrupacion,
} from '@/types';

class ProductService {
  async getProducts(
    page: number,
    limit: number,
    search?: string,
    filters?: ProductFilters,
  ): Promise<PaginatedResponse<Product>> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (search) params.append('search', search);

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    return apiService.get<PaginatedResponse<Product>>(`/products?${params.toString()}`);
  }

  async getSuggestions(field: string, query: string): Promise<string[]> {
    return apiService.get<string[]>(
      `/products/suggestions?field=${field}&query=${encodeURIComponent(query)}`,
    );
  }

  async getMarkets(): Promise<Market[]> {
    return apiService.get<Market[]>('/products/markets');
  }

  async assignToMarket(
    productos: ProductData[],
    mercado: string,
    franquicia: string,
    tipoAgrupacion: TipoAgrupacion,
    isNewMarket: boolean = false,
    comentarioSolicitante?: string,
  ): Promise<ApiResult> {
    return apiService.post<ApiResult>('/products/assign-market', {
      productos,
      mercado,
      franquicia,
      tipoAgrupacion,
      isNewMarket,
      comentarioSolicitante,
    });
  }

  async changeMarket(
    productos: ProductData[],
    oldMercado: string,
    newMercado: string,
    newFranquicia: string,
    comentarioSolicitante?: string,
  ): Promise<ApiResult> {
    return apiService.put<ApiResult>('/products/change-market', {
      productos,
      codigos: productos.map((p) => p.codigo),
      oldMercado,
      newMercado,
      newFranquicia,
      comentarioSolicitante,
    });
  }

  async removeFromMarket(
    productos: ProductData[],
    mercado?: string,
    comentarioSolicitante?: string,
  ): Promise<ApiResult> {
    return apiService.delete<ApiResult>('/products/remove-market', {
      productos,
      mercado,
      comentarioSolicitante,
    });
  }
}

export const productService = new ProductService();
