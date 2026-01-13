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

export interface ProductFullData {
  codigoPresentacion: string;
  descripcionPresentacion: string;
  codigoAtc4: string;
  molecula: string;
  codigoFf1: string;
  codigoFf3: string;
  stghVal: string;
  gerenteProducto: string;
  unidadNegocio: string;
}
