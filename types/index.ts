export * from './database'

// Slot type for availability
export interface TimeSlot {
  time: string
  available: boolean
}

// Booking flow types
export interface BookingState {
  step: 'service' | 'employee' | 'datetime' | 'confirm'
  serviceId: string | null
  employeeId: string | null
  date: Date | null
  time: string | null
  clientName: string
  clientPhone: string
  clientEmail: string
  notes: string
}

// Dashboard stats
export interface DashboardStats {
  todayAppointments: number
  activeServices: number
  activeEmployees: number
  monthlyRevenue: number
  pendingAppointments: number
  completedToday: number
}

// Analytics types
export interface MonthlyRevenue {
  month: string
  revenue: number
}

export interface TopService {
  name: string
  count: number
  revenue: number
}

export interface EmployeePerformance {
  name: string
  appointments: number
  revenue: number
  rating: number
}

export interface HourlyDistribution {
  hour: string
  count: number
}

// Form types
export interface ServiceFormData {
  name: string
  description: string
  price: number
  duration_minutes: number
  category: string
  is_active: boolean
}

export interface EmployeeFormData {
  name: string
  email: string
  phone: string
  bio: string
  is_active: boolean
  working_hours: {
    [key: string]: {
      enabled: boolean
      start: string
      end: string
      breakStart?: string
      breakEnd?: string
    }
  }
}

export interface ClientFormData {
  name: string
  email: string
  phone: string
  notes: string
}

export interface TenantFormData {
  name: string
  slug: string
  phone: string
  email: string
  address: string
  description: string
  instagram: string
  facebook: string
  primary_color: string
  secondary_color: string
}

