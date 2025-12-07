import { z } from 'zod'

// Auth validations
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  businessName: z.string().min(2, 'Nome do negócio deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'As senhas não conferem',
  path: ['confirmPassword'],
})

// Service validations
export const serviceSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  price: z.number().min(0, 'Preço deve ser maior ou igual a 0'),
  duration_minutes: z.number().min(15, 'Duração mínima de 15 minutos'),
  category: z.string().optional(),
  is_active: z.boolean().default(true),
})

// Employee validations
export const employeeSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  bio: z.string().optional(),
  is_active: z.boolean().default(true),
  working_hours: z.record(z.string(), z.object({
    enabled: z.boolean(),
    start: z.string(),
    end: z.string(),
    breakStart: z.string().optional(),
    breakEnd: z.string().optional(),
  })).optional(),
})

// Client validations
export const clientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().min(10, 'Telefone inválido'),
  notes: z.string().optional(),
})

// Appointment validations
export const appointmentSchema = z.object({
  service_id: z.string().uuid('Serviço inválido'),
  employee_id: z.string().uuid('Funcionário inválido'),
  start_time: z.string(),
  notes: z.string().optional(),
})

// Booking form validations (public)
export const bookingClientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().min(10, 'Telefone inválido'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  notes: z.string().optional(),
})

// Tenant settings validations
export const tenantSettingsSchema = z.object({
  min_advance_hours: z.number().min(0).max(168),
  max_advance_days: z.number().min(1).max(365),
  slot_interval_minutes: z.number().min(15).max(120),
  buffer_between_appointments: z.number().min(0).max(60),
  auto_confirm: z.boolean(),
  cancellation_policy: z.string().optional(),
})

// Tenant profile validations
export const tenantProfileSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  slug: z.string().min(3, 'Slug deve ter pelo menos 3 caracteres').regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  description: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor inválida'),
})

// Schedule block validations
export const scheduleBlockSchema = z.object({
  employee_id: z.string().uuid('Funcionário inválido'),
  start_time: z.string(),
  end_time: z.string(),
  reason: z.string().optional(),
  recurring: z.boolean().default(false),
  recurrence_rule: z.string().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ServiceInput = z.infer<typeof serviceSchema>
export type EmployeeInput = z.infer<typeof employeeSchema>
export type ClientInput = z.infer<typeof clientSchema>
export type AppointmentInput = z.infer<typeof appointmentSchema>
export type BookingClientInput = z.infer<typeof bookingClientSchema>
export type TenantSettingsInput = z.infer<typeof tenantSettingsSchema>
export type TenantProfileInput = z.infer<typeof tenantProfileSchema>
export type ScheduleBlockInput = z.infer<typeof scheduleBlockSchema>

