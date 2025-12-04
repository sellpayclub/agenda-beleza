'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

  // Use admin client to bypass RLS and ensure insert works
  const supabase = createAdminClient() as any
  
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

  // Aggressive cache invalidation
  revalidatePath('/dashboard/servicos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendamentos')

  return { data: service }
}

export async function updateService(id: string, data: ServiceUpdate) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  // Use admin client to bypass RLS and ensure update works
  const supabase = createAdminClient() as any
  
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

  // Aggressive cache invalidation
  revalidatePath('/dashboard/servicos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendamentos')

  return { data: service }
}

export async function deleteService(id: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  // Use admin client to bypass RLS and ensure delete works
  const supabase = createAdminClient() as any
  
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)

  if (error) {
    console.error('Error deleting service:', error)
    return { error: 'Erro ao excluir serviço' }
  }

  // Aggressive cache invalidation
  revalidatePath('/dashboard/servicos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendamentos')

  return { success: true }
}

export async function toggleServiceStatus(id: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  // Use admin client to bypass RLS and ensure update works
  const supabase = createAdminClient() as any
  
  // Get current status
  const { data: service } = await supabase
    .from('services')
    .select('is_active')
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)
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

  // Aggressive cache invalidation
  revalidatePath('/dashboard/servicos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendamentos')

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
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  // Use admin client to bypass RLS and ensure insert works
  const supabase = createAdminClient() as any
  
  // Validate input
  if (!serviceId || !employeeId) {
    return { error: 'ID do serviço e do funcionário são obrigatórios' }
  }

  // Verify service and employee belong to tenant
  const [serviceCheck, employeeCheck] = await Promise.all([
    supabase
      .from('services')
      .select('id')
      .eq('id', serviceId)
      .eq('tenant_id', user.tenant_id)
      .single(),
    supabase
      .from('employees')
      .select('id')
      .eq('id', employeeId)
      .eq('tenant_id', user.tenant_id)
      .single()
  ])

  if (!serviceCheck.data) {
    console.error('Service not found:', serviceId)
    return { error: 'Serviço não encontrado' }
  }

  if (!employeeCheck.data) {
    console.error('Employee not found:', employeeId)
    return { error: 'Funcionário não encontrado' }
  }

  // Check if association already exists
  const { data: existing } = await supabase
    .from('employee_services')
    .select('id')
    .eq('service_id', serviceId)
    .eq('employee_id', employeeId)
    .single()

  if (existing) {
    return { success: true } // Already associated
  }

  console.log(`Assigning employee ${employeeId} to service ${serviceId}`)

  const { data, error } = await supabase
    .from('employee_services')
    .insert({
      service_id: serviceId,
      employee_id: employeeId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error assigning employee to service:', error)
    return { error: 'Erro ao associar funcionário ao serviço' }
  }

  if (!data) {
    console.error('Employee-service assignment returned no data')
    return { error: 'Erro ao associar funcionário ao serviço' }
  }

  console.log(`Employee assigned to service successfully`)

  // Aggressive cache invalidation
  revalidatePath('/dashboard/servicos')
  revalidatePath('/dashboard/funcionarios')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendamentos')

  return { success: true }
}

export async function removeEmployeeFromService(serviceId: string, employeeId: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  // Use admin client to bypass RLS and ensure delete works
  const supabase = createAdminClient() as any
  
  // Validate input
  if (!serviceId || !employeeId) {
    return { error: 'ID do serviço e do funcionário são obrigatórios' }
  }

  // Verify service and employee belong to tenant
  const [serviceCheck, employeeCheck] = await Promise.all([
    supabase
      .from('services')
      .select('id')
      .eq('id', serviceId)
      .eq('tenant_id', user.tenant_id)
      .single(),
    supabase
      .from('employees')
      .select('id')
      .eq('id', employeeId)
      .eq('tenant_id', user.tenant_id)
      .single()
  ])

  if (!serviceCheck.data) {
    console.error('Service not found:', serviceId)
    return { error: 'Serviço não encontrado' }
  }

  if (!employeeCheck.data) {
    console.error('Employee not found:', employeeId)
    return { error: 'Funcionário não encontrado' }
  }

  // Verify association exists
  const { data: existing } = await supabase
    .from('employee_services')
    .select('id')
    .eq('service_id', serviceId)
    .eq('employee_id', employeeId)
    .single()

  if (!existing) {
    return { success: true } // Already removed
  }

  console.log(`Removing employee ${employeeId} from service ${serviceId}`)

  const { error } = await supabase
    .from('employee_services')
    .delete()
    .eq('service_id', serviceId)
    .eq('employee_id', employeeId)

  if (error) {
    console.error('Error removing employee from service:', error)
    return { error: 'Erro ao remover funcionário do serviço' }
  }

  console.log(`Employee removed from service successfully`)

  // Aggressive cache invalidation
  revalidatePath('/dashboard/servicos')
  revalidatePath('/dashboard/funcionarios')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendamentos')

  return { success: true }
}

