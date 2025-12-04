'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './auth'
import type { ClientInsert, ClientUpdate } from '@/types'

export async function getClients() {
  const currentUser = await getCurrentUser()
  if (!currentUser) return []
  
  const tenantId = (currentUser as any).tenant_id

  const supabase = await createClient() as any
  
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('name')

  if (error) {
    console.error('Error fetching clients:', error)
    return []
  }

  return data
}

export async function getClient(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching client:', error)
    return null
  }

  return data
}

export async function getClientByPhone(tenantId: string, phone: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('phone', phone)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching client by phone:', error)
  }

  return data
}

export async function createNewClient(data: ClientInsert) {
  const supabase = createAdminClient() as any
  
  const { data: client, error } = await supabase
    .from('clients')
    .insert(data)
    .select()
    .single()

  if (error) {
    console.error('Error creating client:', error)
    return { error: 'Erro ao criar cliente' }
  }

  revalidatePath('/dashboard/clientes')
  return { data: client }
}

export async function findOrCreateClient(tenantId: string, data: { name: string; phone: string; email?: string }) {
  // Try to find existing client by phone
  const existingClient: any = await getClientByPhone(tenantId, data.phone)
  
  if (existingClient) {
    // Update name and email if provided
    const supabase = createAdminClient() as any
    await supabase
      .from('clients')
      .update({
        name: data.name,
        email: data.email || existingClient.email,
      })
      .eq('id', existingClient.id)
    
    return existingClient
  }

  // Create new client
  const result = await createNewClient({
    tenant_id: tenantId,
    name: data.name,
    phone: data.phone,
    email: data.email || null,
  })

  if ('error' in result) {
    throw new Error(result.error)
  }

  return result.data
}

export async function updateClient(id: string, data: ClientUpdate) {
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
    return { error: 'Nome do cliente não pode estar vazio' }
  }

  if (data.phone !== undefined && (!data.phone || data.phone.trim() === '')) {
    return { error: 'Telefone do cliente não pode estar vazio' }
  }

  // Verify client exists and belongs to tenant
  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)
    .single()

  if (!existing) {
    console.error('Client not found for update:', id)
    return { error: 'Cliente não encontrado' }
  }

  // Add updated_at
  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  }

  console.log(`Updating client: ${id}`)

  const { data: client, error } = await supabase
    .from('clients')
    .update(updateData)
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)
    .select()
    .single()

  if (error) {
    console.error('Error updating client:', error)
    return { error: 'Erro ao atualizar cliente' }
  }

  if (!client) {
    console.error('Client update returned no data:', id)
    return { error: 'Registro não encontrado ou não foi atualizado' }
  }

  console.log(`Client updated successfully: ${id}`)

  // Aggressive cache invalidation
  revalidatePath('/dashboard/clientes')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendamentos')

  return { data: client }
}

export async function deleteClient(id: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  // Use admin client to bypass RLS and ensure delete works
  const supabase = createAdminClient() as any
  
  // Verify client exists and belongs to tenant
  const { data: existing } = await supabase
    .from('clients')
    .select('id')
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)
    .single()

  if (!existing) {
    console.error('Client not found for deletion:', id)
    return { error: 'Cliente não encontrado' }
  }

  console.log(`Deleting client: ${id}`)

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)

  if (error) {
    console.error('Error deleting client:', error)
    return { error: 'Erro ao excluir cliente' }
  }

  console.log(`Client deleted successfully: ${id}`)

  // Aggressive cache invalidation
  revalidatePath('/dashboard/clientes')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/agendamentos')

  return { success: true }
}

export async function getClientWithAppointments(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('clients')
    .select(`
      *,
      appointments (
        *,
        service:services (*),
        employee:employees (*)
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching client with appointments:', error)
    return null
  }

  return data
}

export async function searchClients(query: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return []
  const user = currentUser as any

  const supabase = await createClient() as any
  
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('tenant_id', user.tenant_id)
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%,email.ilike.%${query}%`)
    .order('name')
    .limit(10)

  if (error) {
    console.error('Error searching clients:', error)
    return []
  }

  return data
}

