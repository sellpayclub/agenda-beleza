'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  CalendarDays,
  Clock,
  MoreHorizontal,
  Check,
  X,
  Ban,
  Phone,
  Mail,
  DollarSign,
  RefreshCw,
} from 'lucide-react'
import {
  updateAppointmentStatus,
  updatePaymentStatus,
  deleteAppointment,
  getAppointments,
} from '@/lib/actions/appointments'
import {
  formatCurrency,
  formatPhone,
  formatTime,
  formatDate,
  getStatusLabel,
  getPaymentStatusLabel,
} from '@/lib/utils/format'
import { format, isToday, isTomorrow, parseISO, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import type { AppointmentWithRelations, Employee, Service, AppointmentStatus, PaymentStatus } from '@/types'

interface AppointmentsClientProps {
  initialAppointments: any[]
  employees: Employee[]
  services: Service[]
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700 hover:bg-amber-200',
  confirmed: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200',
  completed: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
  cancelled: 'bg-red-100 text-red-700 hover:bg-red-200',
  no_show: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
}

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  refunded: 'bg-gray-100 text-gray-700',
}

export function AppointmentsClient({
  initialAppointments,
  employees,
  services,
}: AppointmentsClientProps) {
  const router = useRouter()
  const [appointments, setAppointments] = useState(initialAppointments)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [filterEmployee, setFilterEmployee] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [payingId, setPayingId] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState('')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const newAppointments = await getAppointments()
      setAppointments(newAppointments)
      toast.success('Agendamentos atualizados')
    } catch (error) {
      toast.error('Erro ao atualizar agendamentos')
    } finally {
      setIsRefreshing(false)
    }
  }

  const filteredAppointments = appointments.filter((apt) => {
    const aptDate = startOfDay(parseISO(apt.start_time))
    const selectedDateStart = startOfDay(selectedDate)

    const dateMatch = aptDate.getTime() === selectedDateStart.getTime()
    const employeeMatch = filterEmployee === 'all' || apt.employee_id === filterEmployee
    const statusMatch = filterStatus === 'all' || apt.status === filterStatus

    return dateMatch && employeeMatch && statusMatch
  })

  const getDateLabel = () => {
    if (isToday(selectedDate)) return 'Hoje'
    if (isTomorrow(selectedDate)) return 'Amanhã'
    return format(selectedDate, "EEEE, dd 'de' MMMM", { locale: ptBR })
  }

  const handleStatusChange = async (id: string, status: AppointmentStatus) => {
    if (status === 'cancelled') {
      setCancellingId(id)
      setCancelDialogOpen(true)
      return
    }

    const result = await updateAppointmentStatus(id, status)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Status atualizado')
      setAppointments(appointments.map((a) => (a.id === id ? { ...a, status } : a)))
      router.refresh() // Refresh to update all pages (dashboard, financeiro, analytics)
    }
  }

  const handleCancelConfirm = async () => {
    if (!cancellingId) return

    const result = await updateAppointmentStatus(cancellingId, 'cancelled', cancellationReason)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Agendamento cancelado')
      setAppointments(
        appointments.map((a) =>
          a.id === cancellingId
            ? { ...a, status: 'cancelled', cancellation_reason: cancellationReason }
            : a
        )
      )
      router.refresh() // Refresh to update all pages (dashboard, financeiro, analytics)
    }
    setCancelDialogOpen(false)
    setCancellingId(null)
    setCancellationReason('')
  }

  const handlePaymentClick = (id: string) => {
    setPayingId(id)
    setPaymentDialogOpen(true)
  }

  const handlePaymentConfirm = async () => {
    if (!payingId) return

    const result = await updatePaymentStatus(payingId, 'paid', paymentMethod)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Pagamento registrado')
      setAppointments(
        appointments.map((a) =>
          a.id === payingId ? { ...a, payment_status: 'paid', payment_method: paymentMethod } : a
        )
      )
      router.refresh() // Refresh to update financeiro, dashboard, and analytics pages
    }
    setPaymentDialogOpen(false)
    setPayingId(null)
    setPaymentMethod('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) return

    const result = await deleteAppointment(id)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Agendamento excluído')
      setAppointments(appointments.filter((a) => a.id !== id))
      router.refresh() // Refresh to update dashboard and analytics pages
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agendamentos</h1>
          <p className="text-gray-500">Gerencie todos os agendamentos</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Sidebar with Calendar and Filters */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={ptBR}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Filtros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm">Funcionário</Label>
                <Select value={filterEmployee} onValueChange={setFilterEmployee}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Status</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                    <SelectItem value="no_show">Não compareceu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Appointments List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-violet-600" />
                {getDateLabel()}
                <Badge variant="secondary" className="ml-2">
                  {filteredAppointments.length} agendamentos
                </Badge>
              </CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAppointments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarDays className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  Nenhum agendamento
                </h3>
                <p className="text-gray-500">Não há agendamentos para esta data</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col items-center justify-center min-w-[60px] py-2 px-3 rounded-lg bg-violet-50">
                      <Clock className="h-4 w-4 text-violet-600 mb-1" />
                      <span className="text-sm font-semibold text-violet-700">
                        {formatTime(appointment.start_time)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {appointment.service?.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            com {appointment.employee?.name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={statusColors[appointment.status]}>
                            {getStatusLabel(appointment.status)}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                                disabled={appointment.status === 'confirmed'}
                              >
                                <Check className="w-4 h-4 mr-2 text-emerald-600" />
                                Confirmar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(appointment.id, 'completed')}
                                disabled={appointment.status === 'completed'}
                              >
                                <Check className="w-4 h-4 mr-2 text-blue-600" />
                                Concluir
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(appointment.id, 'no_show')}
                                disabled={appointment.status === 'no_show'}
                              >
                                <Ban className="w-4 h-4 mr-2 text-gray-600" />
                                Não compareceu
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handlePaymentClick(appointment.id)}>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Registrar pagamento
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                                className="text-red-600"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Cancelar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(appointment.id)}
                                className="text-red-600"
                              >
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                              {appointment.client?.name?.charAt(0) || 'C'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{appointment.client?.name}</p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Phone className="h-3 w-3" />
                                {formatPhone(appointment.client?.phone || '')}
                              </span>
                              {appointment.client?.email && (
                                <span className="flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {appointment.client.email}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(appointment.service?.price || 0)}
                        </span>
                        <Badge className={paymentStatusColors[appointment.payment_status]}>
                          {getPaymentStatusLabel(appointment.payment_status)}
                        </Badge>
                        {appointment.payment_method && (
                          <span className="text-xs text-gray-500">
                            via {appointment.payment_method}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Agendamento</DialogTitle>
            <DialogDescription>
              Informe o motivo do cancelamento (opcional)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Motivo do cancelamento..."
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setCancelDialogOpen(false)}
              >
                Voltar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancelConfirm}
              >
                Confirmar Cancelamento
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pagamento</DialogTitle>
            <DialogDescription>
              Selecione a forma de pagamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setPaymentDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-violet-500 to-pink-500"
                onClick={handlePaymentConfirm}
                disabled={!paymentMethod}
              >
                Confirmar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

