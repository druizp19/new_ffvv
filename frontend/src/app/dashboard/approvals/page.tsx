'use client';

import { useState } from 'react';
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  User,
  Calendar,
  ArrowRight,
  Package,
  Eye,
  MessageSquare,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useSolicitudes } from '@/hooks';
import type { Solicitud, EstadoSolicitud, TipoOperacion } from '@/services/solicitud.service';

const estadoConfig: Record<EstadoSolicitud, { color: string; icon: typeof Clock }> = {
  PENDIENTE: { color: 'bg-amber-500', icon: Clock },
  APROBADO: { color: 'bg-emerald-500', icon: CheckCircle },
  RECHAZADO: { color: 'bg-red-500', icon: XCircle },
};

const tipoConfig: Record<TipoOperacion, { label: string; color: string }> = {
  ASIGNAR: { label: 'Asignar', color: 'text-emerald-600 bg-emerald-50' },
  CAMBIAR: { label: 'Cambiar', color: 'text-blue-600 bg-blue-50' },
  QUITAR: { label: 'Quitar', color: 'text-red-600 bg-red-50' },
  CREAR: { label: 'Crear', color: 'text-purple-600 bg-purple-50' },
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ApprovalsPage() {
  const [estadoFilter, setEstadoFilter] = useState<EstadoSolicitud | undefined>('PENDIENTE');
  const { solicitudes, loading, processing, aprobar, rechazar } = useSolicitudes(estadoFilter);

  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [actionType, setActionType] = useState<'aprobar' | 'rechazar' | null>(null);
  const [comentario, setComentario] = useState('');
  const [detailSolicitud, setDetailSolicitud] = useState<Solicitud | null>(null);

  const handleAction = async () => {
    if (!selectedSolicitud || !actionType) return;

    if (actionType === 'aprobar') {
      await aprobar(selectedSolicitud.id, comentario || undefined);
    } else {
      await rechazar(selectedSolicitud.id, comentario || undefined);
    }

    setSelectedSolicitud(null);
    setActionType(null);
    setComentario('');
  };

  const openActionDialog = (solicitud: Solicitud, action: 'aprobar' | 'rechazar') => {
    setSelectedSolicitud(solicitud);
    setActionType(action);
    setComentario('');
  };

  return (
    <div className="flex flex-col h-full w-full gap-5 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl text-slate-900">Solicitudes de Cambio</h1>
          <p className="text-sm text-slate-500">Gestión de aprobaciones de mercado</p>
        </div>

        <Select
          value={estadoFilter || 'ALL'}
          onValueChange={(v) => setEstadoFilter(v === 'ALL' ? undefined : (v as EstadoSolicitud))}
        >
          <SelectTrigger className="w-[160px] h-9">
            <SelectValue placeholder="Filtrar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos</SelectItem>
            <SelectItem value="PENDIENTE">Pendientes</SelectItem>
            <SelectItem value="APROBADO">Aprobados</SelectItem>
            <SelectItem value="RECHAZADO">Rechazados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      ) : solicitudes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 bg-white rounded-lg border">
          <FileText className="h-12 w-12 mb-3 text-slate-300" />
          <p>No hay solicitudes {estadoFilter?.toLowerCase() || ''}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto pb-4">
          {solicitudes.map((solicitud) => (
            <SolicitudCard
              key={solicitud.id}
              solicitud={solicitud}
              onAprobar={() => openActionDialog(solicitud, 'aprobar')}
              onRechazar={() => openActionDialog(solicitud, 'rechazar')}
              onViewDetails={() => setDetailSolicitud(solicitud)}
            />
          ))}
        </div>
      )}

      {/* Action Dialog */}
      <Dialog
        open={!!selectedSolicitud && !!actionType}
        onOpenChange={() => {
          setSelectedSolicitud(null);
          setActionType(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {actionType === 'aprobar' ? 'Aprobar Solicitud' : 'Rechazar Solicitud'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'aprobar'
                ? 'Se aplicarán los cambios solicitados.'
                : 'Se rechazará sin aplicar cambios.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <label className="text-sm text-slate-600">Comentario (opcional)</label>
            <Textarea
              value={comentario}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setComentario(e.target.value)}
              placeholder="Agregar comentario..."
              className="mt-1.5 resize-none"
              rows={2}
            />
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedSolicitud(null)}>
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleAction}
              disabled={processing}
              className={
                actionType === 'aprobar'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-red-600 hover:bg-red-700'
              }
            >
              {processing && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
              {actionType === 'aprobar' ? 'Aprobar' : 'Rechazar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!detailSolicitud} onOpenChange={() => setDetailSolicitud(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Package className="h-4 w-4" />
              Detalle #{detailSolicitud?.id}
            </DialogTitle>
          </DialogHeader>

          {detailSolicitud && (
            <div className="flex-1 overflow-auto">
              <div className="mb-3 p-2.5 bg-slate-50 rounded-lg text-sm">
                <MercadoInfo solicitud={detailSolicitud} />
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Código</TableHead>
                    <TableHead className="text-xs">Presentación</TableHead>
                    <TableHead className="text-xs">Molécula</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailSolicitud.datosSolicitud.productos.map((producto, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-mono text-xs py-2">{producto.codigo}</TableCell>
                      <TableCell className="text-xs py-2">{producto.presentacion || '-'}</TableCell>
                      <TableCell className="text-xs py-2">{producto.molecula || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDetailSolicitud(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MercadoInfo({ solicitud }: { solicitud: Solicitud }) {
  const datos = solicitud.datosSolicitud;

  switch (solicitud.tipoOperacion) {
    case 'ASIGNAR':
    case 'CREAR':
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <ArrowRight className="h-3.5 w-3.5 text-emerald-500" />
          <span className="font-medium text-slate-700">{datos.mercado}</span>
          {datos.franquicia && <span className="text-slate-400 text-xs">({datos.franquicia})</span>}
        </div>
      );

    case 'CAMBIAR':
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500">{datos.mercadoOrigen || 'N/A'}</span>
          <ArrowRight className="h-3.5 w-3.5 text-blue-500" />
          <span className="font-medium text-blue-700">{datos.mercadoDestino}</span>
        </div>
      );

    case 'QUITAR':
      return (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-500">{datos.mercadoOrigen || 'Mercado actual'}</span>
          <ArrowRight className="h-3.5 w-3.5 text-red-500" />
          <span className="font-medium text-orange-600">SIN MERCADO</span>
        </div>
      );

    default:
      return null;
  }
}

function SolicitudCard({
  solicitud,
  onAprobar,
  onRechazar,
  onViewDetails,
}: {
  solicitud: Solicitud;
  onAprobar: () => void;
  onRechazar: () => void;
  onViewDetails: () => void;
}) {
  const datos = solicitud.datosSolicitud;
  const productCount = datos.productos?.length || 0;
  const isSingleProduct = productCount === 1;
  const producto = isSingleProduct ? datos.productos[0] : null;
  const isPending = solicitud.estado === 'PENDIENTE';
  const StatusIcon = estadoConfig[solicitud.estado].icon;

  return (
    <Card className="flex flex-col hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${estadoConfig[solicitud.estado].color}`} />
            <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 ${tipoConfig[solicitud.tipoOperacion].color}`}>
              {tipoConfig[solicitud.tipoOperacion].label}
            </Badge>
          </div>
          <span className="text-[10px] text-slate-400">#{solicitud.id}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 px-4 py-2 space-y-3">
        {/* Producto */}
        {isSingleProduct && producto ? (
          <div>
            <p className="text-sm font-medium text-slate-800 line-clamp-2">
              {producto.presentacion || producto.codigo}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {producto.molecula || producto.codigo}
            </p>
          </div>
        ) : (
          <button
            onClick={onViewDetails}
            className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700"
          >
            <Package className="h-3.5 w-3.5" />
            <span>{productCount} productos</span>
            <Eye className="h-3 w-3 ml-1" />
          </button>
        )}

        {/* Mercado Flow */}
        <div className="text-xs">
          <MercadoInfo solicitud={solicitud} />
        </div>

        {/* Solicitante */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <User className="h-3 w-3" />
            {solicitud.solicitanteNombre?.split(' ')[0]}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {formatDate(solicitud.fechaSolicitud)}
          </span>
        </div>

        {/* Comentario del solicitante */}
        {solicitud.comentarioSolicitante && (
          <div className="flex items-start gap-1.5 p-2 bg-amber-50 rounded text-[11px] text-amber-700">
            <MessageSquare className="h-3 w-3 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{solicitud.comentarioSolicitante}</span>
          </div>
        )}

        {/* Respuesta */}
        {solicitud.comentario && (
          <p className="text-[11px] text-slate-500 italic line-clamp-2">
            Respuesta: {solicitud.comentario}
          </p>
        )}
      </CardContent>

      {isPending && (
        <CardFooter className="px-4 py-2.5 border-t gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={onRechazar}
          >
            <XCircle className="h-3.5 w-3.5 mr-1" />
            Rechazar
          </Button>
          <Button
            size="sm"
            className="flex-1 h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
            onClick={onAprobar}
          >
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            Aprobar
          </Button>
        </CardFooter>
      )}

      {!isPending && (
        <CardFooter className="px-4 py-2 border-t">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <StatusIcon className="h-3 w-3" />
            <span>{solicitud.estado}</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
