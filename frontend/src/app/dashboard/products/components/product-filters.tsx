'use client';

import { useState, useEffect } from 'react';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AutocompleteInput } from './autocomplete-input';
import { productService } from '@/services';
import type { ProductFilters } from '@/types';

interface ProductFiltersSheetProps {
  filters: ProductFilters;
  activeFiltersCount: number;
  onFiltersChange: (filters: ProductFilters) => void;
  onApply: () => void;
  onClear: () => void;
}

export function ProductFiltersSheet({
  filters,
  activeFiltersCount,
  onFiltersChange,
  onApply,
  onClear,
}: ProductFiltersSheetProps) {
  const [open, setOpen] = useState(false);
  const [franquicias, setFranquicias] = useState<string[]>([]);

  useEffect(() => {
    productService.getFranquicias().then(setFranquicias).catch(() => setFranquicias([]));
  }, []);

  const handleApply = () => {
    onApply();
    setOpen(false);
  };

  const updateFilter = (key: keyof ProductFilters, value: string) => {
    onFiltersChange({ ...filters, [key]: value || undefined });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Filter className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[320px] sm:w-[360px] p-0 flex flex-col h-full">
        <SheetHeader className="px-4 py-3 border-b shrink-0">
          <SheetTitle className="text-base">Filtros</SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2.5">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Marca</Label>
            <AutocompleteInput
              field="marca"
              value={filters.marca || ''}
              onChange={(v) => updateFilter('marca', v)}
              placeholder="Buscar marca..."
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Tipo</Label>
              <Select
                value={filters.marcaGenerico || 'todos'}
                onValueChange={(v) => updateFilter('marcaGenerico', v === 'todos' ? '' : v)}
              >
                <SelectTrigger className="h-8 text-xs rounded-md">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="MARCA">Marca</SelectItem>
                  <SelectItem value="GENERICO">Genérico</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Ético/Pop</Label>
              <Select
                value={filters.eticoPopular || 'todos'}
                onValueChange={(v) => updateFilter('eticoPopular', v === 'todos' ? '' : v)}
              >
                <SelectTrigger className="h-8 text-xs rounded-md">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ETICO">Ético</SelectItem>
                  <SelectItem value="POPULAR">Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Mercado</Label>
            <AutocompleteInput
              field="mercado"
              value={filters.mercado || ''}
              onChange={(v) => updateFilter('mercado', v)}
              placeholder="Buscar mercado..."
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Franquicia</Label>
            <Select
              value={filters.franquicia || 'todos'}
              onValueChange={(v) => updateFilter('franquicia', v === 'todos' ? '' : v)}
            >
              <SelectTrigger className="h-8 text-xs rounded-md">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {franquicias.map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Molécula</Label>
            <AutocompleteInput
              field="molecula"
              value={filters.molecula || ''}
              onChange={(v) => updateFilter('molecula', v)}
              placeholder="Buscar molécula..."
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">FF3</Label>
            <AutocompleteInput
              field="ff3"
              value={filters.ff3 || ''}
              onChange={(v) => updateFilter('ff3', v)}
              placeholder="Forma farmacéutica..."
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">ATC4</Label>
            <AutocompleteInput
              field="atc4"
              value={filters.atc4 || ''}
              onChange={(v) => updateFilter('atc4', v)}
              placeholder="Clasificación ATC..."
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Laboratorio</Label>
            <AutocompleteInput
              field="laboratorio"
              value={filters.laboratorio || ''}
              onChange={(v) => updateFilter('laboratorio', v)}
              placeholder="Nombre laboratorio..."
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Corporación</Label>
            <AutocompleteInput
              field="corporacion"
              value={filters.corporacion || ''}
              onChange={(v) => updateFilter('corporacion', v)}
              placeholder="Nombre corporación..."
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pb-2">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Conc.</Label>
              <Input
                placeholder="500 MG..."
                value={filters.concentracion || ''}
                onChange={(e) => updateFilter('concentracion', e.target.value)}
                className="h-8 text-xs rounded-md"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Vol.</Label>
              <Input
                placeholder="10 ML..."
                value={filters.volumen || ''}
                onChange={(e) => updateFilter('volumen', e.target.value)}
                className="h-8 text-xs rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="px-4 py-3 border-t flex gap-2 shrink-0 bg-white">
          <SheetClose asChild>
            <Button variant="outline" onClick={onClear} className="flex-1 h-9 rounded-lg text-sm">
              Limpiar
            </Button>
          </SheetClose>
          <Button onClick={handleApply} className="flex-1 h-9 rounded-lg text-sm">
            Aplicar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
