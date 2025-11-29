'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from './auth'
import { revalidatePath } from 'next/cache'

// Email do super admin
const SUPER_ADMIN_EMAIL = 'personaldann@gmail.com'

// Verificar se o usuário atual é super admin
export async function isSuperAdmin(): Promise<boolean> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return false
  
  return (currentUser as any).email === SUPER_ADMIN_EMAIL
}

// Obter estatísticas gerais (só para super admin)
export async function getAdminStats() {
  const isAdmin = await isSuperAdmin()
  if (!isAdmin) return null

  const supabase = createAdminClient() as any

  // Contar tenants por status
  const { data: tenants } = await supabase
    .from('tenants')
    .select('subscription_status')

  const stats = {
    total: tenants?.length || 0,
    active: tenants?.filter((t: any) => t.subscription_status === 'active').length || 0,
    trial: tenants?.filter((t: any) => t.subscription_status === 'trial').length || 0,
    cancelled: tenants?.filter((t: any) => t.subscription_status === 'cancelled').length || 0,
    expired: tenants?.filter((t: any) => t.subscription_status === 'expired').length || 0,
  }

  // Contar total de agendamentos
  const { count: appointmentsCount } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })

  // Contar total de clientes
  const { count: clientsCount } = await supabase
    .from('clients')
    .select('*', { count: 'exact', head: true })

  return {
    ...stats,
    totalAppointments: appointmentsCount || 0,
    totalClients: clientsCount || 0,
  }
}

// Listar todos os tenants (só para super admin)
export async function getAllTenants() {
  const isAdmin = await isSuperAdmin()
  if (!isAdmin) return []

  const supabase = createAdminClient() as any

  const { data, error } = await supabase
    .from('tenants')
    .select(`
      *,
      users:users(count),
      employees:employees(count),
      services:services(count),
      clients:clients(count),
      appointments:appointments(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching tenants:', error)
    return []
  }

  return data || []
}

// Obter detalhes de um tenant específico (só para super admin)
export async function getTenantDetails(tenantId: string) {
  const isAdmin = await isSuperAdmin()
  if (!isAdmin) return null

  const supabase = createAdminClient() as any

  const { data: tenant, error } = await supabase
    .from('tenants')
    .select(`
      *,
      tenant_settings(*)
    `)
    .eq('id', tenantId)
    .single()

  if (error) {
    console.error('Error fetching tenant details:', error)
    return null
  }

  // Contar entidades
  const [users, employees, services, clients, appointments] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('employees').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('services').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
    supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('tenant_id', tenantId),
  ])

  return {
    ...tenant,
    counts: {
      users: users.count || 0,
      employees: employees.count || 0,
      services: services.count || 0,
      clients: clients.count || 0,
      appointments: appointments.count || 0,
    },
  }
}

// Atualizar status da assinatura (só para super admin)
export async function updateTenantSubscription(
  tenantId: string,
  status: 'trial' | 'active' | 'cancelled' | 'expired',
  expiresAt?: string
) {
  const isAdmin = await isSuperAdmin()
  if (!isAdmin) return { error: 'Não autorizado' }

  const supabase = createAdminClient() as any

  const updateData: any = {
    subscription_status: status,
    updated_at: new Date().toISOString(),
  }

  if (expiresAt) {
    updateData.subscription_expires_at = expiresAt
  }

  const { error } = await supabase
    .from('tenants')
    .update(updateData)
    .eq('id', tenantId)

  if (error) {
    console.error('Error updating tenant subscription:', error)
    return { error: 'Erro ao atualizar assinatura' }
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}

// Atualizar dados do tenant (só para super admin)
export async function updateTenantData(
  tenantId: string,
  data: {
    name?: string
    slug?: string
    email?: string
    phone?: string
  }
) {
  const isAdmin = await isSuperAdmin()
  if (!isAdmin) return { error: 'Não autorizado' }

  const supabase = createAdminClient() as any

  const { error } = await supabase
    .from('tenants')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tenantId)

  if (error) {
    console.error('Error updating tenant data:', error)
    return { error: 'Erro ao atualizar dados' }
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}

// Excluir tenant (só para super admin)
export async function deleteTenant(tenantId: string) {
  const isAdmin = await isSuperAdmin()
  if (!isAdmin) return { error: 'Não autorizado' }

  const supabase = createAdminClient() as any

  // Buscar usuários do tenant para excluir do auth
  const { data: users } = await supabase
    .from('users')
    .select('id')
    .eq('tenant_id', tenantId)

  // Excluir tenant (cascade vai excluir tudo relacionado)
  const { error } = await supabase
    .from('tenants')
    .delete()
    .eq('id', tenantId)

  if (error) {
    console.error('Error deleting tenant:', error)
    return { error: 'Erro ao excluir tenant' }
  }

  // Excluir usuários do auth (opcional, pode dar erro se não existirem)
  if (users && users.length > 0) {
    for (const user of users) {
      await supabase.auth.admin.deleteUser(user.id).catch(() => {})
    }
  }

  revalidatePath('/dashboard/admin')
  return { success: true }
}

// Buscar tenants (com filtro e busca)
export async function searchTenants(query?: string, status?: string) {
  const isAdmin = await isSuperAdmin()
  if (!isAdmin) return []

  const supabase = createAdminClient() as any

  let queryBuilder = supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false })

  if (query) {
    queryBuilder = queryBuilder.or(`name.ilike.%${query}%,email.ilike.%${query}%,slug.ilike.%${query}%`)
  }

  if (status && status !== 'all') {
    queryBuilder = queryBuilder.eq('subscription_status', status)
  }

  const { data, error } = await queryBuilder.limit(100)

  if (error) {
    console.error('Error searching tenants:', error)
    return []
  }

  return data || []
}

