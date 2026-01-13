'use client';

import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import type { Market } from '@/types';

interface MarketSelectorProps {
  markets: Market[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const ITEMS_PER_PAGE = 5;

export function MarketSelector({
  markets,
  value,
  onChange,
  placeholder = 'Seleccione un mercado...',
}: MarketSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filteredMarkets = useMemo(() => {
    if (!search) return markets;
    const searchLower = search.toLowerCase();
    return markets.filter(
      (m) =>
        (m.mercado || '').toLowerCase().includes(searchLower) ||
        (m.franquicia || '').toLowerCase().includes(searchLower),
    );
  }, [markets, search]);

  const totalPages = Math.ceil(filteredMarkets.length / ITEMS_PER_PAGE);
  const paginatedMarkets = filteredMarkets.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  const selectedMarket = markets.find((m) => m.mercado === value);

  const handleSelect = (mercado: string) => {
    onChange(mercado === value ? '' : mercado);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-[40px] py-2"
        >
          {selectedMarket ? (
            <div className="flex flex-col items-start">
              <span className="font-medium">{selectedMarket.mercado}</span>
              <span className="text-xs text-muted-foreground">{selectedMarket.franquicia}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar mercado..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8 h-9"
            />
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {paginatedMarkets.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              No se encontraron mercados.
            </div>
          ) : (
            <div className="p-1">
              {paginatedMarkets.map((market) => (
                <div
                  key={market.mercado}
                  className={cn(
                    'flex items-center justify-between px-3 py-2 rounded-md cursor-pointer transition-colors',
                    value === market.mercado
                      ? 'bg-accent text-accent-foreground'
                      : 'hover:bg-muted',
                  )}
                  onClick={() => handleSelect(market.mercado)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{market.mercado}</span>
                    <span className="text-xs text-muted-foreground">{market.franquicia}</span>
                  </div>
                  {value === market.mercado && <Check className="h-4 w-4 text-primary" />}
                </div>
              ))}
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-2 border-t">
            <span className="text-xs text-muted-foreground">
              {filteredMarkets.length} resultados
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}