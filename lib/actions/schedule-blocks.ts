'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './auth'
import type { ScheduleBlockInsert, ScheduleBlockUpdate } from '@/types'

export async function getScheduleBlocks(employeeId?: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return []
  
  const tenantId = (currentUser as any).tenant_id
  const supabase = await createClient() as any
  
  let query = supabase
    .from('schedule_blocks')
    .select(`
      *,
      employee:employees (id, name)
    `)
    .order('start_time', { ascending: true })

  // Filter by employee's tenant
  if (employeeId) {
    query = query.eq('employee_id', employeeId)
  } else {
    // Get all blocks for employees of this tenant
    const { data: employees } = await supabase
      .from('employees')
      .select('id')
      .eq('tenant_id', tenantId)
    
    if (employees && employees.length > 0) {
      const employeeIds = employees.map((e: any) => e.id)
      query = query.in('employee_id', employeeIds)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching schedule blocks:', error)
    return []
  }

  return data || []
}

export async function createScheduleBlock(data: {
  employeeId: string
  startTime: Date
  endTime: Date
  reason?: string
  recurring?: boolean
  recurrenceRule?: string
}) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  
  const supabase = await createClient() as any
  
  const { data: block, error } = await supabase
    .from('schedule_blocks')
    .insert({
      employee_id: data.employeeId,
      start_time: data.startTime.toISOString(),
      end_time: data.endTime.toISOString(),
      reason: data.reason || null,
      recurring: data.recurring || false,
      recurrence_rule: data.recurrenceRule || null,
    })
    .select(`
      *,
      employee:employees (id, name)
    `)
    .single()

  if (error) {
    console.error('Error creating schedule block:', error)
    return { error: 'Erro ao criar bloqueio' }
  }

  revalidatePath('/dashboard/bloqueios')
  revalidatePath('/dashboard/agendamentos')
  
  return { data: block }
}

export async function updateScheduleBlock(id: string, data: {
  startTime?: Date
  endTime?: Date
  reason?: string
  recurring?: boolean
  recurrenceRule?: string
}) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  
  const supabase = await createClient() as any
  
  const updateData: any = {}
  if (data.startTime) updateData.start_time = data.startTime.toISOString()
  if (data.endTime) updateData.end_time = data.endTime.toISOString()
  if (data.reason !== undefined) updateData.reason = data.reason
  if (data.recurring !== undefined) updateData.recurring = data.recurring
  if (data.recurrenceRule !== undefined) updateData.recurrence_rule = data.recurrenceRule

  const { data: block, error } = await supabase
    .from('schedule_blocks')
    .update(updateData)
    .eq('id', id)
    .select(`
      *,
      employee:employees (id, name)
    `)
    .single()

  if (error) {
    console.error('Error updating schedule block:', error)
    return { error: 'Erro ao atualizar bloqueio' }
  }

  revalidatePath('/dashboard/bloqueios')
  revalidatePath('/dashboard/agendamentos')
  
  return { data: block }
}

export async function deleteScheduleBlock(id: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  
  const supabase = await createClient() as any
  
  const { error } = await supabase
    .from('schedule_blocks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting schedule block:', error)
    return { error: 'Erro ao excluir bloqueio' }
  }

  revalidatePath('/dashboard/bloqueios')
  revalidatePath('/dashboard/agendamentos')
  
  return { success: true }
}

// Create recurring lunch block for an employee
export async function createLunchBlock(employeeId: string, startTime: string, endTime: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  
  const supabase = await createClient() as any
  
  // Create blocks for the next 365 days
  const blocks: any[] = []
  const today = new Date()
  
  for (let i = 0; i < 365; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    
    // Skip weekends
    const dayOfWeek = date.getDay()
    if (dayOfWeek === 0) continue // Sunday
    
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)
    
    const blockStart = new Date(date)
    blockStart.setHours(startHour, startMin, 0, 0)
    
    const blockEnd = new Date(date)
    blockEnd.setHours(endHour, endMin, 0, 0)
    
    blocks.push({
      employee_id: employeeId,
      start_time: blockStart.toISOString(),
      end_time: blockEnd.toISOString(),
      reason: 'Horário de almoço',
      recurring: true,
      recurrence_rule: 'daily_lunch',
    })
  }

  // Insert in batches of 100
  for (let i = 0; i < blocks.length; i += 100) {
    const batch = blocks.slice(i, i + 100)
    const { error } = await supabase
      .from('schedule_blocks')
      .insert(batch)
    
    if (error) {
      console.error('Error creating lunch blocks:', error)
      return { error: 'Erro ao criar bloqueios de almoço' }
    }
  }

  revalidatePath('/dashboard/bloqueios')
  
  return { success: true, count: blocks.length }
}

// Delete all lunch blocks for an employee
export async function deleteLunchBlocks(employeeId: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  
  const supabase = await createClient() as any
  
  const { error } = await supabase
    .from('schedule_blocks')
    .delete()
    .eq('employee_id', employeeId)
    .eq('recurrence_rule', 'daily_lunch')

  if (error) {
    console.error('Error deleting lunch blocks:', error)
    return { error: 'Erro ao excluir bloqueios de almoço' }
  }

  revalidatePath('/dashboard/bloqueios')
  
  return { success: true }
}

