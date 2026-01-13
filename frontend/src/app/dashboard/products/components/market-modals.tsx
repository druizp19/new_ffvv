'use client';

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageSquare } from 'lucide-react';
import { MarketSelector } from './market-selector';
import type { Market, TipoAgrupacion } from '@/types';

function useUserRole() {
  const [isGerente, setIsGerente] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: { rol?: string } = jwtDecode(token);
        const rol = decoded.rol || '';
        setIsGerente(rol.toUpperCase() !== 'ADMINISTRADOR');
      } catch {
        setIsGerente(true);
      }
    }
  }, []);

  return isGerente;
}

interface ComentarioFieldProps {
  value: string;
  onChange: (value: string) => void;
}

function ComentarioField({ value, onChange }: ComentarioFieldProps) {
  return (
    <div className="border-t border-slate-100 pt-4 mt-4">
      <label className="text-sm text-slate-600 mb-2 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-amber-500" />
        Comentario para el administrador (opcional)
      </label>
      <Textarea
        placeholder="Explica el motivo de esta solicitud..."
        value={value}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        className="resize-none"
        rows={2}
      />
      <p className="text-xs text-slate-400 mt-1">
        Tu solicitud será revisada por un administrador antes de aplicarse
      </p>
    </div>
  );
}

interface AssignMarketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  markets: Market[];
  selectedMarket: string;
  assignType: TipoAgrupacion;
  processing: boolean;
  onMarketChange: (value: string) => void;
  onTypeChange: (value: TipoAgrupacion) => void;
  onConfirm: (comentario?: string) => void;
}

export function AssignMarketModal({
  open,
  onOpenChange,
  selectedCount,
  markets,
  selectedMarket,
  assignType,
  processing,
  onMarketChange,
  onTypeChange,
  onConfirm,
}: AssignMarketModalProps) {
  const showTypeSelector = selectedCount > 1;
  const isGerente = useUserRole();
  const [comentario, setComentario] = useState('');

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) setComentario('');
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={showTypeSelector ? 'max-w-2xl' : 'max-w-md'}>
        <DialogHeader>
          <DialogTitle className="text-lg text-slate-900">Asignar a Mercado</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Se asignarán {selectedCount} productos a un nuevo mercado.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {showTypeSelector && (
            <div>
              <label className="text-sm text-slate-600 mb-2 block">Tipo de agrupación</label>
              <Select value={assignType} onValueChange={(v) => onTypeChange(v as TipoAgrupacion)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENTACION">Por Código de Presentación (individual)</SelectItem>
                  <SelectItem value="ATC4">Por ATC4</SelectItem>
                  <SelectItem value="MOLECULA">Por Molécula</SelectItem>
                  <SelectItem value="ATC4_MOLECULA">Por ATC4 + Molécula</SelectItem>
                  <SelectItem value="ATC4_FF1">Por ATC4 + FF1</SelectItem>
                  <SelectItem value="ATC4_MOLECULA_FF1">Por ATC4 + Molécula + FF1</SelectItem>
                  <SelectItem value="ATC4_MOLECULA_FF3">Por ATC4 + Molécula + FF3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label className="text-sm text-slate-600 mb-2 block">Mercado destino</label>
            <MarketSelector markets={markets} value={selectedMarket} onChange={onMarketChange} />
          </div>
          {isGerente && <ComentarioField value={comentario} onChange={setComentario} />}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(comentario || undefined)} disabled={!selectedMarket || processing}>
            {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isGerente ? 'Enviar Solicitud' : 'Asignar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface ChangeMarketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  markets: Market[];
  currentMarket: string;
  currentFranquicia: string;
  newMarket: string;
  processing: boolean;
  onNewMarketChange: (value: string) => void;
  onConfirm: (comentario?: string) => void;
}

export function ChangeMarketModal({
  open,
  onOpenChange,
  selectedCount,
  markets,
  currentMarket,
  currentFranquicia,
  newMarket,
  processing,
  onNewMarketChange,
  onConfirm,
}: ChangeMarketModalProps) {
  const availableMarkets = markets.filter((m) => m.mercado !== currentMarket);
  const isGerente = useUserRole();
  const [comentario, setComentario] = useState('');

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) setComentario('');
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-lg text-slate-900">Cambiar de Mercado</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Mover {selectedCount} productos a otra categoría.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-slate-600 mb-2 block">Mercado actual</label>
              <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 overflow-hidden">
                <p className="font-medium text-slate-900 truncate" title={currentMarket}>{currentMarket}</p>
                <p className="text-xs text-slate-500 truncate" title={currentFranquicia}>{currentFranquicia}</p>
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-600 mb-2 block">Mercado nuevo</label>
              <MarketSelector
                markets={availableMarkets}
                value={newMarket}
                onChange={onNewMarketChange}
              />
            </div>
          </div>
          {isGerente && <ComentarioField value={comentario} onChange={setComentario} />}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onConfirm(comentario || undefined)} disabled={!newMarket || processing}>
            {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isGerente ? 'Enviar Solicitud' : 'Cambiar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RemoveMarketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  processing: boolean;
  onConfirm: (comentario?: string) => void;
}

export function RemoveMarketModal({
  open,
  onOpenChange,
  selectedCount,
  processing,
  onConfirm,
}: RemoveMarketModalProps) {
  const isGerente = useUserRole();
  const [comentario, setComentario] = useState('');

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) setComentario('');
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg text-slate-900">Quitar del Mercado</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Se moverán {selectedCount} productos a SIN MERCADO.
          </DialogDescription>
        </DialogHeader>
        <div className="py-2">
          {isGerente && <ComentarioField value={comentario} onChange={setComentario} />}
        </div>
        <DialogFooter className="gap-2 pt-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={() => onConfirm(comentario || undefined)} disabled={processing}>
            {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isGerente ? 'Enviar Solicitud' : 'Quitar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CreateMarketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  assignType: TipoAgrupacion;
  processing: boolean;
  onTypeChange: (value: TipoAgrupacion) => void;
  onConfirm: (mercado: string, franquicia: string, comentario?: string) => void;
}

export function CreateMarketModal({
  open,
  onOpenChange,
  selectedCount,
  assignType,
  processing,
  onTypeChange,
  onConfirm,
}: CreateMarketModalProps) {
  const [mercado, setMercado] = useState('');
  const [franquicia, setFranquicia] = useState('');
  const [comentario, setComentario] = useState('');
  const showTypeSelector = selectedCount > 1;
  const isGerente = useUserRole();

  const handleConfirm = () => {
    if (mercado.trim()) {
      onConfirm(mercado.trim().toUpperCase(), franquicia.trim().toUpperCase(), comentario || undefined);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setMercado('');
      setFranquicia('');
      setComentario('');
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={showTypeSelector ? 'max-w-2xl' : 'max-w-md'}>
        <DialogHeader>
          <DialogTitle className="text-lg text-slate-900">Crear Nuevo Mercado</DialogTitle>
          <DialogDescription className="text-sm text-slate-500">
            Se creará un nuevo mercado y se asignarán {selectedCount} productos.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          {showTypeSelector && (
            <div>
              <label className="text-sm text-slate-600 mb-2 block">Tipo de agrupación</label>
              <Select value={assignType} onValueChange={(v) => onTypeChange(v as TipoAgrupacion)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENTACION">Por Código de Presentación (individual)</SelectItem>
                  <SelectItem value="ATC4">Por ATC4</SelectItem>
                  <SelectItem value="MOLECULA">Por Molécula</SelectItem>
                  <SelectItem value="ATC4_MOLECULA">Por ATC4 + Molécula</SelectItem>
                  <SelectItem value="ATC4_FF1">Por ATC4 + FF1</SelectItem>
                  <SelectItem value="ATC4_MOLECULA_FF1">Por ATC4 + Molécula + FF1</SelectItem>
                  <SelectItem value="ATC4_MOLECULA_FF3">Por ATC4 + Molécula + FF3</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label className="text-sm text-slate-600 mb-2 block">Nombre del mercado</label>
            <Input
              placeholder="Ej: ANALGESICOS_PREMIUM"
              value={mercado}
              onChange={(e) => setMercado(e.target.value)}
              className="uppercase"
            />
          </div>
          <div>
            <label className="text-sm text-slate-600 mb-2 block">Franquicia</label>
            <Input
              placeholder="Ej: SALUD CARDIOMETABOLICA"
              value={franquicia}
              onChange={(e) => setFranquicia(e.target.value)}
              className="uppercase"
            />
          </div>
          {isGerente && <ComentarioField value={comentario} onChange={setComentario} />}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!mercado.trim() || processing}>
            {processing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {isGerente ? 'Enviar Solicitud' : 'Crear y Asignar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
