'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Download,
  CreditCard,
  Banknote,
  Smartphone,
  RefreshCw,
} from 'lucide-react'
import { formatCurrency, formatDate, getPaymentStatusLabel } from '@/lib/utils/format'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface FinanceiroClientProps {
  initialAppointments: any[]
}

const paymentStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-emerald-100 text-emerald-700',
  refunded: 'bg-gray-100 text-gray-700',
}

const paymentMethodIcons: Record<string, any> = {
  dinheiro: Banknote,
  pix: Smartphone,
  cartao_credito: CreditCard,
  cartao_debito: CreditCard,
}

export function FinanceiroClient({ initialAppointments }: FinanceiroClientProps) {
  const router = useRouter()
  const [appointments, setAppointments] = useState(initialAppointments)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Helper function to safely get service price
  const getServicePrice = (appointment: any): number => {
    if (!appointment) return 0
    
    // Handle service as object or array
    const service = Array.isArray(appointment.service) 
      ? appointment.service[0] 
      : appointment.service
    
    if (!service) {
      return 0
    }
    
    // Handle price - PostgreSQL DECIMAL comes as string
    let priceValue = service.price
    
    // Convert to number if string
    if (typeof priceValue === 'string') {
      // Remove currency symbols and convert comma to dot
      priceValue = priceValue.replace(/[^\d,.-]/g, '').replace(',', '.')
      priceValue = parseFloat(priceValue) || 0
    } else {
      priceValue = Number(priceValue) || 0
    }
    
    return priceValue
  }

  // Update appointments when initialAppointments changes (after refresh)
  useEffect(() => {
    setAppointments(initialAppointments || [])
  }, [initialAppointments])

  // Auto-refresh when page receives focus
  useEffect(() => {
    const handleFocus = () => {
      router.refresh()
    }

    window.addEventListener('focus', handleFocus)
    
    // Also refresh when coming back to this tab
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        router.refresh()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])
  
  // Refresh data periodically (every 15 seconds) to keep it updated
  useEffect(() => {
    const interval = setInterval(() => {
      router.refresh()
    }, 15000) // 15 seconds - more frequent updates

    return () => clearInterval(interval)
  }, [router])

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const statusMatch = filterStatus === 'all' || apt.status === filterStatus
      const paymentMatch = filterPaymentStatus === 'all' || apt.payment_status === filterPaymentStatus
      return statusMatch && paymentMatch
    })
  }, [appointments, filterStatus, filterPaymentStatus])

  const stats = useMemo(() => {
    if (!appointments || appointments.length === 0) {
      return {
        totalRevenue: 0,
        pendingRevenue: 0,
        projectedRevenue: 0,
        completedCount: 0,
        paidCount: 0,
        pendingCount: 0,
      }
    }

    // Receita Recebida: Agendamentos com payment_status='paid'
    const paid = appointments.filter((a) => a.payment_status === 'paid')
    const totalRevenue = paid.reduce((sum, a) => sum + getServicePrice(a), 0)

    // A Receber: Agendamentos com payment_status='pending' E status não cancelado
    const pending = appointments.filter(
      (a) => a.payment_status === 'pending' && a.status !== 'cancelled'
    )
    const pendingRevenue = pending.reduce((sum, a) => sum + getServicePrice(a), 0)

    // Receita Projetada: Todos os agendamentos não cancelados (completed, pending, confirmed)
    const nonCancelled = appointments.filter((a) => a.status !== 'cancelled')
    const projectedRevenue = nonCancelled.reduce((sum, a) => sum + getServicePrice(a), 0)

    const completed = appointments.filter((a) => a.status === 'completed')

    return {
      totalRevenue,
      pendingRevenue,
      projectedRevenue,
      completedCount: completed.length,
      paidCount: paid.length,
      pendingCount: pending.length,
    }
  }, [appointments])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    router.refresh()
    // Aguardar um pouco para a atualização completar e atualizar estado local
    setTimeout(() => {
      setIsRefreshing(false)
    }, 1000)
  }

  const handleExport = () => {
    // Generate CSV
    const headers = ['Data', 'Cliente', 'Serviço', 'Funcionário', 'Valor', 'Status', 'Pagamento']
    const rows = filteredAppointments.map((apt) => {
      const service = Array.isArray(apt.service) ? apt.service[0] : apt.service
      const client = Array.isArray(apt.client) ? apt.client[0] : apt.client
      const employee = Array.isArray(apt.employee) ? apt.employee[0] : apt.employee
      
      return [
        format(new Date(apt.start_time), 'dd/MM/yyyy HH:mm'),
        client?.name || '',
        service?.name || '',
        employee?.name || '',
        getServicePrice(apt),
        apt.status,
        apt.payment_status,
      ]
    })

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `financeiro-${format(new Date(), 'yyyy-MM')}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financeiro</h1>
          <p className="text-gray-500">
            {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receita Recebida
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-sm text-gray-500">
              {stats.paidCount} pagamentos confirmados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              A Receber
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-50">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatCurrency(stats.pendingRevenue)}
            </div>
            <p className="text-sm text-gray-500">
              {stats.pendingCount} pagamentos pendentes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receita Projetada
            </CardTitle>
            <div className="p-2 rounded-lg bg-violet-50">
              <DollarSign className="h-4 w-4 text-violet-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-600">
              {formatCurrency(stats.projectedRevenue)}
            </div>
            <p className="text-sm text-gray-500">
              {appointments.filter((a) => a.status !== 'cancelled').length} agendamentos ativos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Transações</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="confirmed">Confirmado</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPaymentStatus} onValueChange={setFilterPaymentStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Pagamento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="refunded">Reembolsado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                Nenhuma transação encontrada
              </h3>
              <p className="text-gray-500">Ajuste os filtros para ver mais resultados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Serviço</TableHead>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead>Método</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppointments.map((apt) => {
                  const PaymentIcon = apt.payment_method
                    ? paymentMethodIcons[apt.payment_method] || DollarSign
                    : null

                  return (
                    <TableRow key={apt.id}>
                      <TableCell className="whitespace-nowrap">
                        {format(new Date(apt.start_time), 'dd/MM/yyyy HH:mm')}
                      </TableCell>
                      <TableCell>{(Array.isArray(apt.client) ? apt.client[0] : apt.client)?.name || ''}</TableCell>
                      <TableCell>{(Array.isArray(apt.service) ? apt.service[0] : apt.service)?.name || ''}</TableCell>
                      <TableCell>{(Array.isArray(apt.employee) ? apt.employee[0] : apt.employee)?.name || ''}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(getServicePrice(apt))}
                      </TableCell>
                      <TableCell>
                        <Badge className={paymentStatusColors[apt.payment_status]}>
                          {getPaymentStatusLabel(apt.payment_status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {apt.payment_method ? (
                          <div className="flex items-center gap-2">
                            {PaymentIcon && <PaymentIcon className="w-4 h-4 text-gray-500" />}
                            <span className="text-sm capitalize">
                              {apt.payment_method.replace('_', ' ')}
                            </span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

