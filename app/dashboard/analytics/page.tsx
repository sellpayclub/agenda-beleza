import {
  getDashboardStats,
  getMonthlyRevenueChart,
  getTopServices,
  getEmployeePerformance,
  getHourlyDistribution,
  getCancellationRate,
  getNoShowRate,
} from '@/lib/actions/analytics'
import { AnalyticsClient } from './analytics-client'

export default async function AnalyticsPage() {
  const [
    stats,
    revenueData,
    topServices,
    employeePerformance,
    hourlyDistribution,
    cancellationRate,
    noShowRate,
  ] = await Promise.all([
    getDashboardStats(),
    getMonthlyRevenueChart(),
    getTopServices(),
    getEmployeePerformance(),
    getHourlyDistribution(),
    getCancellationRate(),
    getNoShowRate(),
  ])

  return (
    <AnalyticsClient
      stats={stats}
      revenueData={revenueData}
      topServices={topServices}
      employeePerformance={employeePerformance}
      hourlyDistribution={hourlyDistribution}
      cancellationRate={cancellationRate}
      noShowRate={noShowRate}
    />
  )
}

