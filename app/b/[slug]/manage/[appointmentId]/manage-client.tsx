'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import { 
  Calendar, 
  Clock, 
  User, 
  Scissors, 
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  CalendarX
} from 'lucide-react'
import { format, parseISO, isPast, addHours } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency } from '@/lib/utils/format'
import { toast } from 'sonner'
import type { Tenant } from '@/types'

interface ManageAppointmentClientProps {
  tenant: Tenant
  appointment: any
}

export function ManageAppointmentClient({ tenant, appointment }: ManageAppointmentClientProps) {
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [cancelled, setCancelled] = useState(appointment.status === 'cancelled')

  const appointmentDate = parseISO(appointment.start_time)
  const isPastAppointment = isPast(appointmentDate)
  const canCancel = !isPastAppointment && !cancelled && appointment.status !== 'completed'
  
  // Check if within cancellation window (e.g., at least 2 hours before)
  const cancellationDeadline = addHours(new Date(), 2)
  const withinCancellationWindow = appointmentDate > cancellationDeadline

  const handleCancel = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/public/appointments/${appointment.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reason: cancellationReason,
          tenantId: tenant.id,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao cancelar')
      }

      toast.success('Agendamento cancelado com sucesso')
      setCancelled(true)
      setIsCancelDialogOpen(false)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cancelar agendamento')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = () => {
    const status = cancelled ? 'cancelled' : appointment.status
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string, icon: React.ReactNode }> = {
      pending: { variant: 'secondary', label: 'Pendente', icon: <AlertCircle className="w-3 h-3" /> },
      confirmed: { variant: 'default', label: 'Confirmado', icon: <CheckCircle2 className="w-3 h-3" /> },
      completed: { variant: 'outline', label: 'Concluído', icon: <CheckCircle2 className="w-3 h-3" /> },
      cancelled: { variant: 'destructive', label: 'Cancelado', icon: <XCircle className="w-3 h-3" /> },
      no_show: { variant: 'destructive', label: 'Não compareceu', icon: <XCircle className="w-3 h-3" /> },
    }

    const config = statusConfig[status] || statusConfig.pending
    return (
      <Badge variant={config.variant} className="gap-1">
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  return (
    <div 
      className="min-h-screen py-8 px-4"
      style={{ 
        background: `linear-gradient(135deg, ${tenant.primary_color}15 0%, ${tenant.secondary_color}15 100%)` 
      }}
    >
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          {tenant.logo_url ? (
            <img
              src={tenant.logo_url}
              alt={tenant.name}
              className="w-16 h-16 mx-auto rounded-xl object-cover mb-4"
            />
          ) : (
            <div
              className="w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-white text-2xl font-bold mb-4"
              style={{ backgroundColor: tenant.primary_color }}
            >
              {tenant.name.charAt(0)}
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
          <p className="text-gray-500">Gerenciar Agendamento</p>
        </div>

        {/* Appointment Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detalhes do Agendamento</CardTitle>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Service */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Scissors className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">{appointment.service?.name}</p>
                <p className="text-sm text-gray-500">
                  {appointment.service?.duration_minutes} minutos • {formatCurrency(appointment.service?.price || 0)}
                </p>
              </div>
            </div>

            {/* Professional */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">{appointment.employee?.name}</p>
                <p className="text-sm text-gray-500">Profissional</p>
              </div>
            </div>

            {/* Date & Time */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">
                  {format(appointmentDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {format(appointmentDate, 'HH:mm')} - {format(parseISO(appointment.end_time), 'HH:mm')}
                </p>
              </div>
            </div>

            {/* Address */}
            {tenant.address && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <MapPin className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">Endereço</p>
                  <p className="text-sm text-gray-500">{tenant.address}</p>
                </div>
              </div>
            )}

            {/* Contact */}
            {tenant.phone && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium">Contato</p>
                  <p className="text-sm text-gray-500">{tenant.phone}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        {!cancelled && !isPastAppointment && appointment.status !== 'completed' && (
          <Card>
            <CardHeader>
              <CardTitle>Ações</CardTitle>
              <CardDescription>
                Precisa fazer alguma alteração?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* Reschedule */}
              <Link href={`/b/${tenant.slug}`}>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  Fazer novo agendamento
                </Button>
              </Link>

              {/* Cancel */}
              {canCancel && (
                <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" className="w-full justify-start">
                      <CalendarX className="w-4 h-4 mr-2" />
                      Cancelar agendamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancelar Agendamento</DialogTitle>
                      <DialogDescription>
                        Tem certeza que deseja cancelar este agendamento?
                        {!withinCancellationWindow && (
                          <span className="block mt-2 text-amber-600">
                            ⚠️ O agendamento está próximo. Por favor, entre em contato pelo telefone se possível.
                          </span>
                        )}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                        <p className="font-medium">{appointment.service?.name}</p>
                        <p className="text-sm text-gray-500">
                          {format(appointmentDate, "dd/MM/yyyy 'às' HH:mm")}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Motivo do cancelamento (opcional)
                        </label>
                        <Textarea
                          value={cancellationReason}
                          onChange={(e) => setCancellationReason(e.target.value)}
                          placeholder="Ex: Imprevisto, compromisso urgente..."
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setIsCancelDialogOpen(false)}
                        disabled={loading}
                      >
                        Voltar
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        {loading ? 'Cancelando...' : 'Confirmar Cancelamento'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        )}

        {/* Cancelled Message */}
        {cancelled && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="font-medium text-red-900">Agendamento Cancelado</p>
                  <p className="text-sm text-red-700">
                    Este agendamento foi cancelado.
                  </p>
                </div>
              </div>
              <Link href={`/b/${tenant.slug}`} className="block mt-4">
                <Button className="w-full" style={{ backgroundColor: tenant.primary_color }}>
                  Fazer novo agendamento
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Past Appointment */}
        {isPastAppointment && !cancelled && (
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-8 h-8 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Agendamento Passado</p>
                  <p className="text-sm text-gray-600">
                    Este agendamento já ocorreu.
                  </p>
                </div>
              </div>
              <Link href={`/b/${tenant.slug}`} className="block mt-4">
                <Button className="w-full" style={{ backgroundColor: tenant.primary_color }}>
                  Fazer novo agendamento
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Back Link */}
        <div className="text-center">
          <Link 
            href={`/b/${tenant.slug}`}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar para página de agendamento
          </Link>
        </div>
      </div>
    </div>
  )
}

