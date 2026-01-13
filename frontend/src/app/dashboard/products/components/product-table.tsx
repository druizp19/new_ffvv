'use client';

import { Loader2, Package } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import type { Product } from '@/types';

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  isSelected: (id: string) => boolean;
  isAllSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onClearFilters: () => void;
}

export function ProductTable({
  products,
  loading,
  isSelected,
  isAllSelected,
  onToggleSelect,
  onToggleSelectAll,
  onClearFilters,
}: ProductTableProps) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 py-12">
        <Package className="h-10 w-10 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No se encontraron productos</p>
        <Button variant="link" size="sm" onClick={onClearFilters}>
          Limpiar filtros
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-auto flex-1">
      <table className="w-full text-xs">
        <thead className="bg-muted/50 sticky top-0 z-10">
          <tr className="border-b">
            <th className="w-10 px-3 py-2">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={onToggleSelectAll}
              />
            </th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Presentación</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Marca</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Marca/Gen.</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Ético/Pop.</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Molécula</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">FF3</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">ATC4</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Corporación</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Laboratorio</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Mercado</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">SizePack</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Conc.</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Volumen</th>
            <th className="px-3 py-2 text-left font-medium text-muted-foreground">Fuente</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            const selected = isSelected(product.id);
            
            return (
              <tr
                key={product.id}
                onClick={() => onToggleSelect(product.id)}
                className={`border-b cursor-pointer transition-colors hover:bg-muted/50 ${
                  selected ? 'bg-accent' : ''
                }`}
              >
                <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => onToggleSelect(product.id)}
                  />
                </td>
                <td className="px-3 py-2 max-w-[160px] truncate" title={product.presentacion}>
                  {product.presentacion}
                </td>
                <td className="px-3 py-2">{product.marca}</td>
                <td className="px-3 py-2">{product.marcaGenerico}</td>
                <td className="px-3 py-2">{product.eticoPopular}</td>
                <td className="px-3 py-2 max-w-[100px] truncate" title={product.molecula}>
                  {product.molecula}
                </td>
                <td className="px-3 py-2 max-w-[80px] truncate" title={product.ff3}>
                  {product.ff3}
                </td>
                <td className="px-3 py-2 max-w-[100px] truncate" title={product.atc4}>
                  {product.atc4}
                </td>
                <td className="px-3 py-2 max-w-[100px] truncate" title={product.corporacion}>
                  {product.corporacion}
                </td>
                <td className="px-3 py-2 max-w-[100px] truncate" title={product.laboratorio}>
                  {product.laboratorio}
                </td>
                <td className="px-3 py-2 max-w-[150px]" title={product.mercado}>
                  {product.mercado?.toUpperCase() === 'RESTO' ? (
                    <span className="inline-flex px-2 py-0.5 rounded-md text-[11px] font-medium bg-orange-100 text-orange-600 whitespace-nowrap">
                      SIN MERCADO
                    </span>
                  ) : (
                    <span className="block truncate">{product.mercado || '-'}</span>
                  )}
                </td>
                <td className="px-3 py-2">{product.sizePack || '-'}</td>
                <td className="px-3 py-2">{product.concentracion || '-'}</td>
                <td className="px-3 py-2">{product.volumen || '-'}</td>
                <td className="px-3 py-2">{product.fuente || '-'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
