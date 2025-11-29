'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './auth'
import { startOfMonth, endOfMonth, startOfDay, endOfDay, subMonths, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { DashboardStats, MonthlyRevenue, TopService, EmployeePerformance, HourlyDistribution } from '@/types'

// Cache para evitar múltiplas chamadas de getCurrentUser
let cachedUser: any = null
let cacheTime = 0
const CACHE_DURATION = 5000 // 5 segundos

async function getCachedUser() {
  const now = Date.now()
  if (cachedUser && (now - cacheTime) < CACHE_DURATION) {
    return cachedUser
  }
  cachedUser = await getCurrentUser()
  cacheTime = now
  return cachedUser
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const currentUser = await getCachedUser()
  if (!currentUser) {
    return {
      todayAppointments: 0,
      activeServices: 0,
      activeEmployees: 0,
      monthlyRevenue: 0,
      pendingAppointments: 0,
      completedToday: 0,
    }
  }
  
  const tenantId = (currentUser as any).tenant_id
  const supabase = await createClient() as any
  const today = new Date()
  const monthStart = startOfMonth(today)
  const monthEnd = endOfMonth(today)
  const todayStart = startOfDay(today).toISOString()
  const todayEnd = endOfDay(today).toISOString()

  // Executar todas as queries em paralelo
  const [
    todayResult,
    servicesResult,
    employeesResult,
    revenueResult,
    pendingResult,
    completedTodayResult,
  ] = await Promise.all([
    // Today's appointments
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('start_time', todayStart)
      .lte('start_time', todayEnd)
      .in('status', ['pending', 'confirmed', 'completed']),

    // Active services
    supabase
      .from('services')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_active', true),

    // Active employees
    supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('is_active', true),

    // Monthly revenue
    supabase
      .from('appointments')
      .select('service:services(price)')
      .eq('tenant_id', tenantId)
      .eq('status', 'completed')
      .gte('start_time', monthStart.toISOString())
      .lte('start_time', monthEnd.toISOString()),

    // Pending appointments
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'pending'),

    // Completed today
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'completed')
      .gte('start_time', todayStart)
      .lte('start_time', todayEnd),
  ])

  const monthlyRevenue = revenueResult.data?.reduce((sum: number, apt: any) => {
    return sum + (apt.service?.price || 0)
  }, 0) || 0

  return {
    todayAppointments: todayResult.count || 0,
    activeServices: servicesResult.count || 0,
    activeEmployees: employeesResult.count || 0,
    monthlyRevenue,
    pendingAppointments: pendingResult.count || 0,
    completedToday: completedTodayResult.count || 0,
  }
}

export async function getMonthlyRevenueChart(): Promise<MonthlyRevenue[]> {
  const currentUser = await getCachedUser()
  if (!currentUser) return []
  
  const tenantId = (currentUser as any).tenant_id
  const supabase = await createClient() as any
  
  // Buscar dados dos últimos 6 meses em uma única query
  const sixMonthsAgo = startOfMonth(subMonths(new Date(), 5))
  const now = endOfMonth(new Date())

  const { data } = await supabase
    .from('appointments')
    .select('start_time, service:services(price)')
    .eq('tenant_id', tenantId)
    .eq('status', 'completed')
    .gte('start_time', sixMonthsAgo.toISOString())
    .lte('start_time', now.toISOString())

  if (!data) return []

  // Agrupar por mês
  const monthMap = new Map<string, number>()
  
  // Inicializar os 6 meses
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const key = format(date, 'yyyy-MM')
    monthMap.set(key, 0)
  }

  // Somar receita por mês
  data.forEach((apt: any) => {
    const key = format(new Date(apt.start_time), 'yyyy-MM')
    if (monthMap.has(key)) {
      monthMap.set(key, (monthMap.get(key) || 0) + (apt.service?.price || 0))
    }
  })

  // Converter para array
  const result: MonthlyRevenue[] = []
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i)
    const key = format(date, 'yyyy-MM')
    result.push({
      month: format(date, 'MMM', { locale: ptBR }),
      revenue: monthMap.get(key) || 0,
    })
  }

  return result
}

export async function getTopServices(): Promise<TopService[]> {
  const currentUser = await getCachedUser()
  if (!currentUser) return []
  
  const tenantId = (currentUser as any).tenant_id
  const supabase = await createClient() as any
  const monthStart = startOfMonth(new Date())
  const monthEnd = endOfMonth(new Date())

  const { data } = await supabase
    .from('appointments')
    .select('service_id, service:services(name, price)')
    .eq('tenant_id', tenantId)
    .eq('status', 'completed')
    .gte('start_time', monthStart.toISOString())
    .lte('start_time', monthEnd.toISOString())

  if (!data) return []

  // Group by service
  const serviceMap = new Map<string, { name: string; count: number; revenue: number }>()

  data.forEach((apt: any) => {
    const service = apt.service as any
    if (!service) return

    const existing = serviceMap.get(apt.service_id)
    if (existing) {
      existing.count++
      existing.revenue += service.price || 0
    } else {
      serviceMap.set(apt.service_id, {
        name: service.name,
        count: 1,
        revenue: service.price || 0,
      })
    }
  })

  return Array.from(serviceMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
}

export async function getEmployeePerformance(): Promise<EmployeePerformance[]> {
  const currentUser = await getCachedUser()
  if (!currentUser) return []
  
  const tenantId = (currentUser as any).tenant_id
  const supabase = await createClient() as any
  const monthStart = startOfMonth(new Date())
  const monthEnd = endOfMonth(new Date())

  const { data } = await supabase
    .from('appointments')
    .select('employee_id, employee:employees(name), service:services(price)')
    .eq('tenant_id', tenantId)
    .eq('status', 'completed')
    .gte('start_time', monthStart.toISOString())
    .lte('start_time', monthEnd.toISOString())

  if (!data) return []

  // Group by employee
  const employeeMap = new Map<string, { name: string; appointments: number; revenue: number }>()

  data.forEach((apt: any) => {
    const employee = apt.employee as any
    const service = apt.service as any
    if (!employee) return

    const existing = employeeMap.get(apt.employee_id)
    if (existing) {
      existing.appointments++
      existing.revenue += service?.price || 0
    } else {
      employeeMap.set(apt.employee_id, {
        name: employee.name,
        appointments: 1,
        revenue: service?.price || 0,
      })
    }
  })

  return Array.from(employeeMap.values())
    .map(emp => ({ ...emp, rating: 5 }))
    .sort((a, b) => b.appointments - a.appointments)
}

export async function getHourlyDistribution(): Promise<HourlyDistribution[]> {
  const currentUser = await getCachedUser()
  if (!currentUser) return []
  
  const tenantId = (currentUser as any).tenant_id
  const supabase = await createClient() as any
  const monthStart = startOfMonth(new Date())
  const monthEnd = endOfMonth(new Date())

  const { data } = await supabase
    .from('appointments')
    .select('start_time')
    .eq('tenant_id', tenantId)
    .in('status', ['confirmed', 'completed'])
    .gte('start_time', monthStart.toISOString())
    .lte('start_time', monthEnd.toISOString())

  if (!data) return []

  // Group by hour
  const hourMap = new Map<number, number>()

  data.forEach((apt: any) => {
    const hour = new Date(apt.start_time).getHours()
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1)
  })

  // Generate all hours 8-20
  const result: HourlyDistribution[] = []
  for (let h = 8; h <= 20; h++) {
    result.push({
      hour: `${h}:00`,
      count: hourMap.get(h) || 0,
    })
  }

  return result
}

export async function getCancellationRate(): Promise<{ rate: number; total: number; cancelled: number }> {
  const currentUser = await getCachedUser()
  if (!currentUser) return { rate: 0, total: 0, cancelled: 0 }
  
  const tenantId = (currentUser as any).tenant_id
  const supabase = await createClient() as any
  const monthStart = startOfMonth(new Date())
  const monthEnd = endOfMonth(new Date())

  // Executar queries em paralelo
  const [totalResult, cancelledResult] = await Promise.all([
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .gte('start_time', monthStart.toISOString())
      .lte('start_time', monthEnd.toISOString()),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'cancelled')
      .gte('start_time', monthStart.toISOString())
      .lte('start_time', monthEnd.toISOString()),
  ])

  const total = totalResult.count || 0
  const cancelled = cancelledResult.count || 0
  const rate = total > 0 ? (cancelled / total) * 100 : 0

  return { rate, total, cancelled }
}

export async function getNoShowRate(): Promise<{ rate: number; total: number; noShows: number }> {
  const currentUser = await getCachedUser()
  if (!currentUser) return { rate: 0, total: 0, noShows: 0 }
  
  const tenantId = (currentUser as any).tenant_id
  const supabase = await createClient() as any
  const monthStart = startOfMonth(new Date())
  const monthEnd = endOfMonth(new Date())

  // Executar queries em paralelo
  const [totalResult, noShowResult] = await Promise.all([
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .in('status', ['completed', 'no_show'])
      .gte('start_time', monthStart.toISOString())
      .lte('start_time', monthEnd.toISOString()),
    supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'no_show')
      .gte('start_time', monthStart.toISOString())
      .lte('start_time', monthEnd.toISOString()),
  ])

  const total = totalResult.count || 0
  const noShows = noShowResult.count || 0
  const rate = total > 0 ? (noShows / total) * 100 : 0

  return { rate, total, noShows }
}
