export interface Product {
  id: string;
  presentacion: string;
  marca: string;
  marcaGenerico: string;
  eticoPopular: string;
  molecula: string;
  ff1: string;
  ff3: string;
  atc4: string;
  corporacion: string;
  laboratorio: string;
  mercado: string;
  sizePack: string;
  concentracion: string;
  volumen: string;
  fuente: string;
}

export interface Market {
  mercado: string;
  franquicia: string;
}

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

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}

export interface ApiResult {
  success: boolean;
  message: string;
  count: number;
}

export type TipoAgrupacion =
  | 'PRESENTACION'
  | 'ATC4'
  | 'MOLECULA'
  | 'ATC4_MOLECULA'
  | 'ATC4_FF1'
  | 'ATC4_MOLECULA_FF1'
  | 'ATC4_MOLECULA_FF3';

export interface ProductData {
  codigo: string;
  presentacion?: string;
  atc4?: string;
  molecula?: string;
  ff1?: string;
  ff3?: string;
  stghVal?: string;
}


export type UserRole = 'ADMINISTRADOR' | 'GERENTE' | 'SUPER_ADMIN';

export interface UserData {
  name: string;
  email: string;
  rol: UserRole;
}
