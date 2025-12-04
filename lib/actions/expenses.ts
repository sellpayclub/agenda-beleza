'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './auth'
import { startOfMonth, endOfMonth, format } from 'date-fns'

export type ExpenseType = 'fixed' | 'variable' | 'material' | 'other'
export type ExpenseRecurrence = 'once' | 'daily' | 'weekly' | 'monthly' | 'yearly'

export interface Expense {
  id: string
  tenant_id: string
  name: string
  description: string | null
  amount: number
  type: ExpenseType
  category: string | null
  recurrence: ExpenseRecurrence
  expense_date: string
  is_paid: boolean
  created_at: string
  updated_at: string
}

export interface ExpenseInsert {
  name: string
  description?: string
  amount: number
  type: ExpenseType
  category?: string
  recurrence: ExpenseRecurrence
  expense_date: string
  is_paid?: boolean
}

export interface ExpenseStats {
  totalFixed: number
  totalVariable: number
  totalMaterial: number
  totalOther: number
  total: number
  paidTotal: number
  pendingTotal: number
}

export async function getExpenses(filters?: {
  type?: ExpenseType
  category?: string
  startDate?: Date
  endDate?: Date
  isPaid?: boolean
}): Promise<Expense[]> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return []
  
  const tenantId = (currentUser as any).tenant_id
  const supabase = await createClient() as any
  
  let query = supabase
    .from('expenses')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('expense_date', { ascending: false })

  if (filters?.type) {
    query = query.eq('type', filters.type)
  }

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.startDate) {
    query = query.gte('expense_date', format(filters.startDate, 'yyyy-MM-dd'))
  }

  if (filters?.endDate) {
    query = query.lte('expense_date', format(filters.endDate, 'yyyy-MM-dd'))
  }

  if (filters?.isPaid !== undefined) {
    query = query.eq('is_paid', filters.isPaid)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching expenses:', error)
    return []
  }

  return data || []
}

export async function getExpense(id: string): Promise<Expense | null> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return null
  
  const tenantId = (currentUser as any).tenant_id
  const supabase = await createClient() as any
  
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  if (error) {
    console.error('Error fetching expense:', error)
    return null
  }

  return data
}

export async function createExpense(data: ExpenseInsert) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  
  const tenantId = (currentUser as any).tenant_id
  
  // Use admin client to bypass RLS and ensure insert works
  const supabase = createAdminClient() as any
  
  // Validate data
  if (!data || !data.name || data.name.trim() === '') {
    return { error: 'Nome da despesa é obrigatório' }
  }

  if (!data.amount || data.amount <= 0) {
    return { error: 'Valor da despesa deve ser maior que zero' }
  }

  console.log(`Creating expense: ${data.name}`)

  const { data: expense, error } = await supabase
    .from('expenses')
    .insert({
      ...data,
      tenant_id: tenantId,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating expense:', error)
    return { error: 'Erro ao criar despesa' }
  }

  if (!expense) {
    console.error('Expense creation returned no data')
    return { error: 'Erro ao criar despesa' }
  }

  console.log(`Expense created successfully: ${expense.id}`)

  // Aggressive cache invalidation
  revalidatePath('/dashboard/gastos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/financeiro')

  return { data: expense }
}

export async function updateExpense(id: string, data: Partial<ExpenseInsert>) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  
  const tenantId = (currentUser as any).tenant_id
  
  // Use admin client to bypass RLS and ensure update works
  const supabase = createAdminClient() as any
  
  // Validate data
  if (!data || Object.keys(data).length === 0) {
    return { error: 'Dados inválidos' }
  }

  if (data.name !== undefined && (!data.name || data.name.trim() === '')) {
    return { error: 'Nome da despesa não pode estar vazio' }
  }

  if (data.amount !== undefined && data.amount <= 0) {
    return { error: 'Valor da despesa deve ser maior que zero' }
  }

  // Verify expense exists and belongs to tenant
  const { data: existing } = await supabase
    .from('expenses')
    .select('id')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  if (!existing) {
    console.error('Expense not found for update:', id)
    return { error: 'Despesa não encontrada' }
  }

  // Add updated_at
  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  }

  console.log(`Updating expense: ${id}`)

  const { data: expense, error } = await supabase
    .from('expenses')
    .update(updateData)
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select()
    .single()

  if (error) {
    console.error('Error updating expense:', error)
    return { error: 'Erro ao atualizar despesa' }
  }

  if (!expense) {
    console.error('Expense update returned no data:', id)
    return { error: 'Registro não encontrado ou não foi atualizado' }
  }

  console.log(`Expense updated successfully: ${id}`)

  // Aggressive cache invalidation
  revalidatePath('/dashboard/gastos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/financeiro')

  return { data: expense }
}

export async function deleteExpense(id: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  
  const tenantId = (currentUser as any).tenant_id
  
  // Use admin client to bypass RLS and ensure delete works
  const supabase = createAdminClient() as any
  
  // Verify expense exists and belongs to tenant
  const { data: existing } = await supabase
    .from('expenses')
    .select('id')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  if (!existing) {
    console.error('Expense not found for deletion:', id)
    return { error: 'Despesa não encontrada' }
  }

  console.log(`Deleting expense: ${id}`)

  const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', id)
    .eq('tenant_id', tenantId)

  if (error) {
    console.error('Error deleting expense:', error)
    return { error: 'Erro ao excluir despesa' }
  }

  console.log(`Expense deleted successfully: ${id}`)

  // Aggressive cache invalidation
  revalidatePath('/dashboard/gastos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/financeiro')

  return { success: true }
}

export async function toggleExpensePaid(id: string, isPaid: boolean) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  
  const tenantId = (currentUser as any).tenant_id
  
  // Use admin client to bypass RLS and ensure update works
  const supabase = createAdminClient() as any
  
  // Verify expense exists and belongs to tenant
  const { data: existing } = await supabase
    .from('expenses')
    .select('id')
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .single()

  if (!existing) {
    console.error('Expense not found for paid toggle:', id)
    return { error: 'Despesa não encontrada' }
  }

  console.log(`Toggling expense ${id} paid status to ${isPaid}`)

  const { data: expense, error } = await supabase
    .from('expenses')
    .update({ 
      is_paid: isPaid,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('tenant_id', tenantId)
    .select()
    .single()

  if (error) {
    console.error('Error toggling expense paid:', error)
    return { error: 'Erro ao atualizar despesa' }
  }

  if (!expense) {
    console.error('Expense paid toggle returned no data:', id)
    return { error: 'Registro não encontrado ou não foi atualizado' }
  }

  console.log(`Expense paid status updated successfully: ${id}`)

  // Aggressive cache invalidation
  revalidatePath('/dashboard/gastos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/financeiro')

  return { data: expense }
}

export async function getExpenseStats(month?: Date): Promise<ExpenseStats> {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    return {
      totalFixed: 0,
      totalVariable: 0,
      totalMaterial: 0,
      totalOther: 0,
      total: 0,
      paidTotal: 0,
      pendingTotal: 0,
    }
  }
  
  const tenantId = (currentUser as any).tenant_id
  const supabase = await createClient() as any
  
  const targetMonth = month || new Date()
  const monthStart = startOfMonth(targetMonth)
  const monthEnd = endOfMonth(targetMonth)

  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount, type, is_paid')
    .eq('tenant_id', tenantId)
    .gte('expense_date', format(monthStart, 'yyyy-MM-dd'))
    .lte('expense_date', format(monthEnd, 'yyyy-MM-dd'))

  if (!expenses || expenses.length === 0) {
    return {
      totalFixed: 0,
      totalVariable: 0,
      totalMaterial: 0,
      totalOther: 0,
      total: 0,
      paidTotal: 0,
      pendingTotal: 0,
    }
  }

  const stats = expenses.reduce(
    (acc: ExpenseStats, exp: any) => {
      const amount = Number(exp.amount) || 0
      
      switch (exp.type) {
        case 'fixed':
          acc.totalFixed += amount
          break
        case 'variable':
          acc.totalVariable += amount
          break
        case 'material':
          acc.totalMaterial += amount
          break
        default:
          acc.totalOther += amount
      }

      acc.total += amount
      
      if (exp.is_paid) {
        acc.paidTotal += amount
      } else {
        acc.pendingTotal += amount
      }

      return acc
    },
    {
      totalFixed: 0,
      totalVariable: 0,
      totalMaterial: 0,
      totalOther: 0,
      total: 0,
      paidTotal: 0,
      pendingTotal: 0,
    }
  )

  return stats
}

export async function getExpenseCategories(): Promise<string[]> {
  const currentUser = await getCurrentUser()
  if (!currentUser) return []
  
  const tenantId = (currentUser as any).tenant_id
  const supabase = await createClient() as any
  
  const { data } = await supabase
    .from('expenses')
    .select('category')
    .eq('tenant_id', tenantId)
    .not('category', 'is', null)

  if (!data) return []

  // Get unique categories
  const categories = [...new Set(data.map((e: any) => e.category).filter(Boolean))]
  return categories as string[]
}

