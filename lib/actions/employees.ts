'use server'

import { createClient } from '@/lib/supabase/server'
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

  const supabase = await createClient() as any
  
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

  revalidatePath('/dashboard/funcionarios')
  return { data: employee }
}

export async function updateEmployee(id: string, data: EmployeeUpdate) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  const supabase = await createClient() as any
  
  const { data: employee, error } = await supabase
    .from('employees')
    .update(data)
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)
    .select()
    .single()

  if (error) {
    console.error('Error updating employee:', error)
    return { error: 'Erro ao atualizar funcionário' }
  }

  revalidatePath('/dashboard/funcionarios')
  return { data: employee }
}

export async function deleteEmployee(id: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  const supabase = await createClient() as any
  
  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)

  if (error) {
    console.error('Error deleting employee:', error)
    return { error: 'Erro ao excluir funcionário' }
  }

  revalidatePath('/dashboard/funcionarios')
  return { success: true }
}

export async function toggleEmployeeStatus(id: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  const supabase = await createClient() as any
  
  // Get current status
  const { data: employee } = await supabase
    .from('employees')
    .select('is_active')
    .eq('id', id)
    .single()

  if (!employee) return { error: 'Funcionário não encontrado' }

  // Toggle status
  const { error } = await supabase
    .from('employees')
    .update({ is_active: !employee.is_active })
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)

  if (error) {
    console.error('Error toggling employee status:', error)
    return { error: 'Erro ao alterar status do funcionário' }
  }

  revalidatePath('/dashboard/funcionarios')
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
  const supabase = await createClient() as any
  
  // Delete existing associations
  await supabase
    .from('employee_services')
    .delete()
    .eq('employee_id', employeeId)

  // Insert new associations
  if (serviceIds.length > 0) {
    const { error } = await supabase
      .from('employee_services')
      .insert(
        serviceIds.map(serviceId => ({
          employee_id: employeeId,
          service_id: serviceId,
        }))
      )

    if (error) {
      console.error('Error updating employee services:', error)
      return { error: 'Erro ao atualizar serviços do funcionário' }
    }
  }

  revalidatePath('/dashboard/funcionarios')
  return { success: true }
}

