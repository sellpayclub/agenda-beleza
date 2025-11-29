'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  Users,
  Clock,
  AlertTriangle,
  UserX,
  Scissors,
  BarChart3,
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import type {
  DashboardStats,
  MonthlyRevenue,
  TopService,
  EmployeePerformance,
  HourlyDistribution,
} from '@/types'

interface AnalyticsClientProps {
  stats: DashboardStats
  revenueData: MonthlyRevenue[]
  topServices: TopService[]
  employeePerformance: EmployeePerformance[]
  hourlyDistribution: HourlyDistribution[]
  cancellationRate: { rate: number; total: number; cancelled: number }
  noShowRate: { rate: number; total: number; noShows: number }
}

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#10b981']

export function AnalyticsClient({
  stats,
  revenueData,
  topServices,
  employeePerformance,
  hourlyDistribution,
  cancellationRate,
  noShowRate,
}: AnalyticsClientProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500">Análise detalhada do seu negócio</p>
      </div>

      {/* Rate Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Taxa de Cancelamento
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {cancellationRate.rate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-500">
              {cancellationRate.cancelled} de {cancellationRate.total} agendamentos cancelados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Taxa de No-Show
            </CardTitle>
            <div className="p-2 rounded-lg bg-red-50">
              <UserX className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {noShowRate.rate.toFixed(1)}%
            </div>
            <p className="text-sm text-gray-500">
              {noShowRate.noShows} de {noShowRate.total} clientes não compareceram
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            Receita nos Últimos 6 Meses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6b7280' }} />
                <YAxis
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Receita']}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="revenue" fill="url(#colorGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Hourly Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Horários de Pico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                  <Tooltip
                    formatter={(value: number) => [value, 'Agendamentos']}
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Services Pie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scissors className="h-5 w-5 text-pink-600" />
              Distribuição de Serviços
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topServices.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[250px] text-center">
                <BarChart3 className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-gray-500">Sem dados suficientes</p>
              </div>
            ) : (
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topServices as any}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }: any) =>
                        `${name} (${((percent || 0) * 100).toFixed(0)}%)`
                      }
                    >
                      {topServices.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Employee Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-violet-600" />
            Performance da Equipe
          </CardTitle>
        </CardHeader>
        <CardContent>
          {employeePerformance.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">Sem dados de performance este mês</p>
            </div>
          ) : (
            <div className="space-y-4">
              {employeePerformance.map((employee, index) => {
                const maxAppointments = Math.max(...employeePerformance.map((e) => e.appointments))
                const percentage = (employee.appointments / maxAppointments) * 100

                return (
                  <div key={employee.name} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{ borderColor: COLORS[index % COLORS.length] }}
                        >
                          {index + 1}
                        </Badge>
                        <span className="font-medium">{employee.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold">{employee.appointments}</span>
                        <span className="text-gray-500 text-sm ml-1">atendimentos</span>
                        <span className="text-emerald-600 font-medium ml-3">
                          {formatCurrency(employee.revenue)}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

