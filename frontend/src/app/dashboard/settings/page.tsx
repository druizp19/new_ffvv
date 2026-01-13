'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { Settings, Clock, Calendar, Power, MessageSquare, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useConfiguracion } from '@/hooks/use-configuracion';

export default function SettingsPage() {
  const router = useRouter();
  const { configuracion, loading, saving, actualizarConfiguracion } = useConfiguracion();
  
  const [formData, setFormData] = useState({
    sistemaActivo: true,
    diaInicio: '1',
    diaFin: '31',
    horaInicio: '08:00',
    horaFin: '18:00',
    mensajeFueraHorario: 'El sistema no está disponible en este momento.',
  });

  // Verificar rol SUPER_ADMIN
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: { rol?: string } = jwtDecode(token);
        const normalizedRole = decoded.rol?.toUpperCase().replace(/\s+/g, '_');
        if (normalizedRole !== 'SUPER_ADMIN') {
          router.push('/dashboard/products');
        }
      } catch {
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  // Cargar configuración inicial
  useEffect(() => {
    if (configuracion) {
      setFormData({
        sistemaActivo: configuracion.sistemaActivo,
        diaInicio: String(configuracion.diaInicio),
        diaFin: String(configuracion.diaFin),
        horaInicio: configuracion.horaInicio,
        horaFin: configuracion.horaFin,
        mensajeFueraHorario: configuracion.mensajeFueraHorario,
      });
    }
  }, [configuracion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await actualizarConfiguracion(formData);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Settings className="h-6 w-6 text-blue-600" />
          Configuración del Sistema
        </h1>
        <p className="text-slate-500 mt-1">
          Administra los horarios y días de acceso al sistema
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Estado del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Power className="h-5 w-5 text-green-600" />
                Estado del Sistema
              </CardTitle>
              <CardDescription>
                Activa o desactiva el acceso al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sistemaActivo" className="text-base">
                    Sistema Activo
                  </Label>
                  <p className="text-sm text-slate-500">
                    Cuando está desactivado, los usuarios no podrán acceder
                  </p>
                </div>
                <Switch
                  id="sistemaActivo"
                  checked={formData.sistemaActivo}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, sistemaActivo: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Días de Acceso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
                Días de Acceso
              </CardTitle>
              <CardDescription>
                Define el rango de días del mes en que el sistema estará disponible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="diaInicio">Día de Inicio</Label>
                  <Input
                    id="diaInicio"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.diaInicio}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, diaInicio: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="diaFin">Día de Fin</Label>
                  <Input
                    id="diaFin"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.diaFin}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, diaFin: e.target.value }))
                    }
                  />
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                El sistema estará disponible del día {formData.diaInicio} al {formData.diaFin} de cada mes
              </p>
            </CardContent>
          </Card>

          {/* Horario de Acceso */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-purple-600" />
                Horario de Acceso
              </CardTitle>
              <CardDescription>
                Define el horario en que el sistema estará disponible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="horaInicio">Hora de Inicio</Label>
                  <Input
                    id="horaInicio"
                    type="time"
                    value={formData.horaInicio}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, horaInicio: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="horaFin">Hora de Fin</Label>
                  <Input
                    id="horaFin"
                    type="time"
                    value={formData.horaFin}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, horaFin: e.target.value }))
                    }
                  />
                </div>
              </div>
              <p className="text-sm text-slate-500 mt-2">
                El sistema estará disponible de {formData.horaInicio} a {formData.horaFin}
              </p>
            </CardContent>
          </Card>

          {/* Mensaje Fuera de Horario */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageSquare className="h-5 w-5 text-orange-600" />
                Mensaje Fuera de Horario
              </CardTitle>
              <CardDescription>
                Mensaje que se mostrará cuando el sistema no esté disponible
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="mensajeFueraHorario"
                value={formData.mensajeFueraHorario}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mensajeFueraHorario: e.target.value }))
                }
                rows={3}
                placeholder="Ingrese el mensaje que verán los usuarios..."
              />
            </CardContent>
          </Card>

          {/* Botón Guardar */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="min-w-[150px]">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
