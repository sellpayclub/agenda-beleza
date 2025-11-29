'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatRelativeDate, formatCurrency, getStatusLabel } from '@/lib/utils/format'
import { Calendar, Clock } from 'lucide-react'
import type { AppointmentWithRelations } from '@/types'

interface UpcomingAppointmentsProps {
  appointments: AppointmentWithRelations[]
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-blue-100 text-blue-700',
  cancelled: 'bg-red-100 text-red-700',
  no_show: 'bg-gray-100 text-gray-700',
}

export function UpcomingAppointments({ appointments }: UpcomingAppointmentsProps) {
  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-violet-600" />
            Próximos Agendamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500">Nenhum agendamento próximo</p>
            <p className="text-sm text-gray-400">
              Os próximos agendamentos aparecerão aqui
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-violet-600" />
          Próximos Agendamentos
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {appointments.map((appointment) => (
          <div
            key={appointment.id}
            className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
          >
            <Avatar className="h-10 w-10">
              <AvatarImage src={undefined} />
              <AvatarFallback className="bg-violet-100 text-violet-700">
                {appointment.client?.name?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {appointment.client?.name}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {appointment.service?.name} • {appointment.employee?.name}
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Clock className="h-3 w-3" />
                {formatRelativeDate(appointment.start_time)}
              </div>
              <Badge className={statusColors[appointment.status]}>
                {getStatusLabel(appointment.status)}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

