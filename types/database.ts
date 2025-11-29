export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'admin' | 'employee' | 'client'
export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
export type PaymentStatus = 'pending' | 'paid' | 'refunded'
export type NotificationType = 'email' | 'whatsapp' | 'sms'
export type NotificationStatus = 'pending' | 'sent' | 'failed'

export interface WorkingHours {
  [key: string]: {
    enabled: boolean
    start: string
    end: string
    breakStart?: string
    breakEnd?: string
  }
}

export interface TenantSettings {
  minAdvanceHours: number
  maxAdvanceDays: number
  slotIntervalMinutes: number
  bufferBetweenAppointments: number
  autoConfirm: boolean
  cancellationPolicy: string
  notificationPreferences: {
    emailConfirmation: boolean
    whatsappConfirmation: boolean
    emailReminder24h: boolean
    whatsappReminder24h: boolean
    emailReminder1h: boolean
    whatsappReminder1h: boolean
  }
}

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          primary_color: string
          secondary_color: string
          custom_domain: string | null
          phone: string | null
          email: string | null
          address: string | null
          description: string | null
          instagram: string | null
          facebook: string | null
          subscription_status: string
          whatsapp_instance: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          custom_domain?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          description?: string | null
          instagram?: string | null
          facebook?: string | null
          subscription_status?: string
          whatsapp_instance?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          logo_url?: string | null
          primary_color?: string
          secondary_color?: string
          custom_domain?: string | null
          phone?: string | null
          email?: string | null
          address?: string | null
          description?: string | null
          instagram?: string | null
          facebook?: string | null
          subscription_status?: string
          whatsapp_instance?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tenant_settings: {
        Row: {
          tenant_id: string
          min_advance_hours: number
          max_advance_days: number
          slot_interval_minutes: number
          buffer_between_appointments: number
          auto_confirm: boolean
          cancellation_policy: string | null
          notification_preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          tenant_id: string
          min_advance_hours?: number
          max_advance_days?: number
          slot_interval_minutes?: number
          buffer_between_appointments?: number
          auto_confirm?: boolean
          cancellation_policy?: string | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          tenant_id?: string
          min_advance_hours?: number
          max_advance_days?: number
          slot_interval_minutes?: number
          buffer_between_appointments?: number
          auto_confirm?: boolean
          cancellation_policy?: string | null
          notification_preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      users: {
        Row: {
          id: string
          tenant_id: string
          role: UserRole
          name: string
          email: string
          phone: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          tenant_id: string
          role?: UserRole
          name: string
          email: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          role?: UserRole
          name?: string
          email?: string
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      employees: {
        Row: {
          id: string
          tenant_id: string
          user_id: string | null
          name: string
          email: string | null
          phone: string | null
          avatar_url: string | null
          bio: string | null
          is_active: boolean
          working_hours: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id?: string | null
          name: string
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_active?: boolean
          working_hours?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string | null
          name?: string
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          bio?: string | null
          is_active?: boolean
          working_hours?: Json
          created_at?: string
          updated_at?: string
        }
      }
      services: {
        Row: {
          id: string
          tenant_id: string
          name: string
          description: string | null
          price: number
          duration_minutes: number
          is_active: boolean
          category: string | null
          image_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          description?: string | null
          price: number
          duration_minutes: number
          is_active?: boolean
          category?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          description?: string | null
          price?: number
          duration_minutes?: number
          is_active?: boolean
          category?: string | null
          image_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      employee_services: {
        Row: {
          employee_id: string
          service_id: string
          created_at: string
        }
        Insert: {
          employee_id: string
          service_id: string
          created_at?: string
        }
        Update: {
          employee_id?: string
          service_id?: string
          created_at?: string
        }
      }
      schedule_blocks: {
        Row: {
          id: string
          employee_id: string
          start_time: string
          end_time: string
          reason: string | null
          recurring: boolean
          recurrence_rule: string | null
          created_at: string
        }
        Insert: {
          id?: string
          employee_id: string
          start_time: string
          end_time: string
          reason?: string | null
          recurring?: boolean
          recurrence_rule?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          employee_id?: string
          start_time?: string
          end_time?: string
          reason?: string | null
          recurring?: boolean
          recurrence_rule?: string | null
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          tenant_id: string
          name: string
          email: string | null
          phone: string
          notes: string | null
          total_visits: number
          total_spent: number
          created_at: string
          last_visit_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          email?: string | null
          phone: string
          notes?: string | null
          total_visits?: number
          total_spent?: number
          created_at?: string
          last_visit_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          email?: string | null
          phone?: string
          notes?: string | null
          total_visits?: number
          total_spent?: number
          created_at?: string
          last_visit_at?: string | null
        }
      }
      appointments: {
        Row: {
          id: string
          tenant_id: string
          client_id: string
          employee_id: string
          service_id: string
          start_time: string
          end_time: string
          status: AppointmentStatus
          payment_status: PaymentStatus
          payment_method: string | null
          notes: string | null
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          client_id: string
          employee_id: string
          service_id: string
          start_time: string
          end_time: string
          status?: AppointmentStatus
          payment_status?: PaymentStatus
          payment_method?: string | null
          notes?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          client_id?: string
          employee_id?: string
          service_id?: string
          start_time?: string
          end_time?: string
          status?: AppointmentStatus
          payment_status?: PaymentStatus
          payment_method?: string | null
          notes?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          appointment_id: string
          type: NotificationType
          status: NotificationStatus
          message: string | null
          sent_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          appointment_id: string
          type: NotificationType
          status?: NotificationStatus
          message?: string | null
          sent_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          appointment_id?: string
          type?: NotificationType
          status?: NotificationStatus
          message?: string | null
          sent_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_role: UserRole
      appointment_status: AppointmentStatus
      payment_status: PaymentStatus
      notification_type: NotificationType
      notification_status: NotificationStatus
    }
  }
}

// Helper types
export type Tenant = Database['public']['Tables']['tenants']['Row']
export type TenantInsert = Database['public']['Tables']['tenants']['Insert']
export type TenantUpdate = Database['public']['Tables']['tenants']['Update']

export type User = Database['public']['Tables']['users']['Row']
export type UserInsert = Database['public']['Tables']['users']['Insert']
export type UserUpdate = Database['public']['Tables']['users']['Update']

export type Employee = Database['public']['Tables']['employees']['Row']
export type EmployeeInsert = Database['public']['Tables']['employees']['Insert']
export type EmployeeUpdate = Database['public']['Tables']['employees']['Update']

export type Service = Database['public']['Tables']['services']['Row']
export type ServiceInsert = Database['public']['Tables']['services']['Insert']
export type ServiceUpdate = Database['public']['Tables']['services']['Update']

export type Client = Database['public']['Tables']['clients']['Row']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']

export type Appointment = Database['public']['Tables']['appointments']['Row']
export type AppointmentInsert = Database['public']['Tables']['appointments']['Insert']
export type AppointmentUpdate = Database['public']['Tables']['appointments']['Update']

export type ScheduleBlock = Database['public']['Tables']['schedule_blocks']['Row']
export type ScheduleBlockInsert = Database['public']['Tables']['schedule_blocks']['Insert']
export type ScheduleBlockUpdate = Database['public']['Tables']['schedule_blocks']['Update']

export type Notification = Database['public']['Tables']['notifications']['Row']
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert']
export type NotificationUpdate = Database['public']['Tables']['notifications']['Update']

export type TenantSettingsRow = Database['public']['Tables']['tenant_settings']['Row']
export type TenantSettingsInsert = Database['public']['Tables']['tenant_settings']['Insert']
export type TenantSettingsUpdate = Database['public']['Tables']['tenant_settings']['Update']

// Extended types with relations
export type AppointmentWithRelations = Appointment & {
  client: Client
  employee: Employee
  service: Service
}

export type EmployeeWithServices = Employee & {
  services: Service[]
}

export type ServiceWithEmployees = Service & {
  employees: Employee[]
}

