'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './auth'
import type { ServiceInsert, ServiceUpdate } from '@/types'

export async function getServices() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return []
  
  const tenantId = (currentUser as any).tenant_id

  const supabase = await createClient() as any
  
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name')

  if (error) {
    console.error('Error fetching services:', error)
    return []
  }

  return data
}

export async function getActiveServices(tenantId?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('services')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (tenantId) {
    query = query.eq('tenant_id', tenantId)
  } else {
    const user = await getCurrentUser()
    if (!user) return []
    query = query.eq('tenant_id', user.tenant_id)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching active services:', error)
    return []
  }

  return data
}

export async function getService(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching service:', error)
    return null
  }

  return data
}

export async function createService(data: Omit<ServiceInsert, 'tenant_id'>) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  const supabase = await createClient() as any
  
  const { data: service, error } = await supabase
    .from('services')
    .insert({
      ...data,
      tenant_id: user.tenant_id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating service:', error)
    return { error: 'Erro ao criar serviço' }
  }

  revalidatePath('/dashboard/servicos')
  return { data: service }
}

export async function updateService(id: string, data: ServiceUpdate) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  const supabase = await createClient() as any
  
  const { data: service, error } = await supabase
    .from('services')
    .update(data)
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)
    .select()
    .single()

  if (error) {
    console.error('Error updating service:', error)
    return { error: 'Erro ao atualizar serviço' }
  }

  revalidatePath('/dashboard/servicos')
  return { data: service }
}

export async function deleteService(id: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  const supabase = await createClient() as any
  
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)

  if (error) {
    console.error('Error deleting service:', error)
    return { error: 'Erro ao excluir serviço' }
  }

  revalidatePath('/dashboard/servicos')
  return { success: true }
}

export async function toggleServiceStatus(id: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  const supabase = await createClient() as any
  
  // Get current status
  const { data: service } = await supabase
    .from('services')
    .select('is_active')
    .eq('id', id)
    .single()

  if (!service) return { error: 'Serviço não encontrado' }

  // Toggle status
  const { error } = await supabase
    .from('services')
    .update({ is_active: !service.is_active })
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)

  if (error) {
    console.error('Error toggling service status:', error)
    return { error: 'Erro ao alterar status do serviço' }
  }

  revalidatePath('/dashboard/servicos')
  return { success: true }
}

export async function getServicesWithEmployees() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return []
  const user = currentUser as any

  const supabase = await createClient() as any
  
  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      employee_services (
        employee_id,
        employees (*)
      )
    `)
    .eq('tenant_id', user.tenant_id)
    .order('name')

  if (error) {
    console.error('Error fetching services with employees:', error)
    return []
  }

  return data
}

export async function assignEmployeeToService(serviceId: string, employeeId: string) {
  const supabase = await createClient() as any
  
  const { error } = await supabase
    .from('employee_services')
    .insert({
      service_id: serviceId,
      employee_id: employeeId,
    })

  if (error) {
    console.error('Error assigning employee to service:', error)
    return { error: 'Erro ao associar funcionário ao serviço' }
  }

  revalidatePath('/dashboard/servicos')
  return { success: true }
}

export async function removeEmployeeFromService(serviceId: string, employeeId: string) {
  const supabase = await createClient() as any
  
  const { error } = await supabase
    .from('employee_services')
    .delete()
    .eq('service_id', serviceId)
    .eq('employee_id', employeeId)

  if (error) {
    console.error('Error removing employee from service:', error)
    return { error: 'Erro ao remover funcionário do serviço' }
  }

  revalidatePath('/dashboard/servicos')
  return { success: true }
}

