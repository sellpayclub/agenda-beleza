import { getDashboardStats, getMonthlyRevenueChart, getTopServices } from '@/lib/actions/analytics'
import { getUpcomingAppointments } from '@/lib/actions/appointments'
import { StatsCards } from '@/components/dashboard/stats-cards'
import { UpcomingAppointments } from '@/components/dashboard/upcoming-appointments'
import { RevenueChart } from '@/components/dashboard/revenue-chart'
import { TopServices } from '@/components/dashboard/top-services'

export default async function DashboardPage() {
  const [stats, revenueData, topServices, upcomingAppointments] = await Promise.all([
    getDashboardStats(),
    getMonthlyRevenueChart(),
    getTopServices(),
    getUpcomingAppointments(5),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Visão geral do seu negócio</p>
      </div>

      <StatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <RevenueChart data={revenueData} />
        <TopServices data={topServices} />
      </div>

      <UpcomingAppointments appointments={upcomingAppointments as any} />
    </div>
  )
}

