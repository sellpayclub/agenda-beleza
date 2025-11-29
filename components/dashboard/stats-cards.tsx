'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Users, Scissors, DollarSign, Clock, CheckCircle } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import type { DashboardStats } from '@/types'

interface StatsCardsProps {
  stats: DashboardStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: 'Agendamentos Hoje',
      value: stats.todayAppointments,
      icon: Calendar,
      color: 'from-violet-500 to-violet-600',
      textColor: 'text-violet-600',
      bgColor: 'bg-violet-50',
    },
    {
      title: 'Serviços Ativos',
      value: stats.activeServices,
      icon: Scissors,
      color: 'from-pink-500 to-pink-600',
      textColor: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      title: 'Funcionários',
      value: stats.activeEmployees,
      icon: Users,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Receita Mensal',
      value: formatCurrency(stats.monthlyRevenue),
      icon: DollarSign,
      color: 'from-emerald-500 to-emerald-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Pendentes',
      value: stats.pendingAppointments,
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Concluídos Hoje',
      value: stats.completedToday,
      icon: CheckCircle,
      color: 'from-teal-500 to-teal-600',
      textColor: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <Card key={card.title} className="overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {card.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-4 w-4 ${card.textColor}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${card.textColor}`}>
              {card.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

