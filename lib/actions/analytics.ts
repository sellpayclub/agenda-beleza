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

// Helper function to safely extract service price from appointment data
// Handles service as object, array, or null
// Converts PostgreSQL DECIMAL (string) to number
function getServicePriceFromAppointment(appointment: any): number {
  if (!appointment) return 0
  
  // Handle service as object or array (Supabase can return either)
  const service = Array.isArray(appointment.service) 
    ? appointment.service[0] 
    : appointment.service
  
  if (!service) return 0
  
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

    // Monthly revenue - use payment_status='paid' instead of status='completed'
    supabase
      .from('appointments')
      .select('service:services(price)')
      .eq('tenant_id', tenantId)
      .eq('payment_status', 'paid')
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
    return sum + getServicePriceFromAppointment(apt)
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
    .eq('payment_status', 'paid')
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
      monthMap.set(key, (monthMap.get(key) || 0) + getServicePriceFromAppointment(apt))
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
    const service = Array.isArray(apt.service) ? apt.service[0] : apt.service
    if (!service) return

    const price = getServicePriceFromAppointment(apt)
    const existing = serviceMap.get(apt.service_id)
    if (existing) {
      existing.count++
      existing.revenue += price
    } else {
      serviceMap.set(apt.service_id, {
        name: service.name,
        count: 1,
        revenue: price,
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
    const employee = Array.isArray(apt.employee) ? apt.employee[0] : apt.employee
    if (!employee) return

    const price = getServicePriceFromAppointment(apt)
    const existing = employeeMap.get(apt.employee_id)
    if (existing) {
      existing.appointments++
      existing.revenue += price
    } else {
      employeeMap.set(apt.employee_id, {
        name: employee.name,
        appointments: 1,
        revenue: price,
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
