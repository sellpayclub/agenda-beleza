'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './auth'
import type { EmployeeInsert, EmployeeUpdate } from '@/types'

export async function getEmployees() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return []
  
  const tenantId = (currentUser as any).tenant_id

  const supabase = await createClient() as any
  
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name')

  if (error) {
    console.error('Error fetching employees:', error)
    return []
  }

  return data
}

export async function getActiveEmployees(tenantId?: string) {
  const supabase = await createClient()
  
  let query = supabase
    .from('employees')
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
    console.error('Error fetching active employees:', error)
    return []
  }

  return data
}

export async function getEmployee(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching employee:', error)
    return null
  }

  return data
}

export async function createEmployee(data: Omit<EmployeeInsert, 'tenant_id'>) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  // Use admin client to bypass RLS and ensure insert works
  const supabase = createAdminClient() as any
  
  // Validate data
  if (!data || !data.name || data.name.trim() === '') {
    return { error: 'Nome do funcionário é obrigatório' }
  }

  console.log(`Creating employee: ${data.name}`)

  const { data: employee, error } = await supabase
    .from('employees')
    .insert({
      ...data,
      tenant_id: user.tenant_id,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating employee:', error)
    return { error: 'Erro ao criar funcionário' }
  }

  if (!employee) {
    console.error('Employee creation returned no data')
    return { error: 'Erro ao criar funcionário' }
  }

  console.log(`Employee created successfully: ${employee.id}`)

  // Aggressive cache invalidation
  revalidatePath('/dashboard/funcionarios')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendamentos')

  return { data: employee }
}

export async function updateEmployee(id: string, data: EmployeeUpdate) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  // Use admin client to bypass RLS and ensure update works
  const supabase = createAdminClient() as any
  
  // Validate data
  if (!data || Object.keys(data).length === 0) {
    return { error: 'Dados inválidos' }
  }

  if (data.name !== undefined && (!data.name || data.name.trim() === '')) {
    return { error: 'Nome do funcionário não pode estar vazio' }
  }

  // Verify employee exists and belongs to tenant
  const { data: existing } = await supabase
    .from('employees')
    .select('id')
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)
    .single()

  if (!existing) {
    console.error('Employee not found for update:', id)
    return { error: 'Funcionário não encontrado' }
  }

  // Add updated_at
  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  }

  console.log(`Updating employee: ${id}`)

  const { data: employee, error } = await supabase
    .from('employees')
    .update(updateData)
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)
    .select()
    .single()

  if (error) {
    console.error('Error updating employee:', error)
    return { error: 'Erro ao atualizar funcionário' }
  }

  if (!employee) {
    console.error('Employee update returned no data:', id)
    return { error: 'Registro não encontrado ou não foi atualizado' }
  }

  console.log(`Employee updated successfully: ${id}`)

  // Aggressive cache invalidation
  revalidatePath('/dashboard/funcionarios')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendamentos')

  return { data: employee }
}

export async function deleteEmployee(id: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  // Use admin client to bypass RLS and ensure delete works
  const supabase = createAdminClient() as any
  
  // Verify employee exists and belongs to tenant
  const { data: existing } = await supabase
    .from('employees')
    .select('id')
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)
    .single()

  if (!existing) {
    console.error('Employee not found for deletion:', id)
    return { error: 'Funcionário não encontrado' }
  }

  console.log(`Deleting employee: ${id}`)

  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)

  if (error) {
    console.error('Error deleting employee:', error)
    return { error: 'Erro ao excluir funcionário' }
  }

  console.log(`Employee deleted successfully: ${id}`)

  // Aggressive cache invalidation
  revalidatePath('/dashboard/funcionarios')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendamentos')

  return { success: true }
}

export async function toggleEmployeeStatus(id: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  // Use admin client to bypass RLS and ensure update works
  const supabase = createAdminClient() as any
  
  // Get current status
  const { data: employee } = await supabase
    .from('employees')
    .select('is_active')
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)
    .single()

  if (!employee) {
    console.error('Employee not found for status toggle:', id)
    return { error: 'Funcionário não encontrado' }
  }

  const newStatus = !employee.is_active
  console.log(`Toggling employee ${id} status to ${newStatus}`)

  // Toggle status
  const { data: updated, error } = await supabase
    .from('employees')
    .update({ 
      is_active: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)
    .select()
    .single()

  if (error) {
    console.error('Error toggling employee status:', error)
    return { error: 'Erro ao alterar status do funcionário' }
  }

  if (!updated) {
    console.error('Employee status toggle returned no data:', id)
    return { error: 'Registro não encontrado ou não foi atualizado' }
  }

  console.log(`Employee status toggled successfully: ${id}`)

  // Aggressive cache invalidation
  revalidatePath('/dashboard/funcionarios')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendamentos')

  return { success: true }
}

export async function getEmployeesWithServices() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return []
  const user = currentUser as any

  const supabase = await createClient() as any
  
  const { data, error } = await supabase
    .from('employees')
    .select(`
      *,
      employee_services (
        service_id,
        services (*)
      )
    `)
    .eq('tenant_id', user.tenant_id)
    .order('name')

  if (error) {
    console.error('Error fetching employees with services:', error)
    return []
  }

  return data
}

export async function getEmployeesByService(serviceId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('employee_services')
    .select(`
      employees (*)
    `)
    .eq('service_id', serviceId)

  if (error) {
    console.error('Error fetching employees by service:', error)
    return []
  }

  return (data || []).map((item: any) => item.employees).filter(Boolean)
}

export async function updateEmployeeServices(employeeId: string, serviceIds: string[]) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  // Use admin client to bypass RLS and ensure update works
  const supabase = createAdminClient() as any
  
  // Validate input
  if (!employeeId) {
    return { error: 'ID do funcionário é obrigatório' }
  }

  // Verify employee exists and belongs to tenant
  const { data: employee } = await supabase
    .from('employees')
    .select('id')
    .eq('id', employeeId)
    .eq('tenant_id', user.tenant_id)
    .single()

  if (!employee) {
    console.error('Employee not found for service update:', employeeId)
    return { error: 'Funcionário não encontrado' }
  }

  console.log(`Updating services for employee: ${employeeId}`)

  // Delete existing associations
  const { error: deleteError } = await supabase
    .from('employee_services')
    .delete()
    .eq('employee_id', employeeId)

  if (deleteError) {
    console.error('Error deleting employee services:', deleteError)
    return { error: 'Erro ao remover serviços do funcionário' }
  }

  // Insert new associations
  if (serviceIds.length > 0) {
    const { error: insertError } = await supabase
      .from('employee_services')
      .insert(
        serviceIds.map(serviceId => ({
          employee_id: employeeId,
          service_id: serviceId,
        }))
      )

    if (insertError) {
      console.error('Error inserting employee services:', insertError)
      return { error: 'Erro ao associar serviços ao funcionário' }
    }
  }

  console.log(`Employee services updated successfully: ${employeeId}`)

  // Aggressive cache invalidation
  revalidatePath('/dashboard/funcionarios')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/servicos')
  revalidatePath('/dashboard/agendamentos')

  return { success: true }
}

