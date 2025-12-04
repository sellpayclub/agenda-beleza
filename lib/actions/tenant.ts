'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './auth'
import type { TenantUpdate, TenantSettingsUpdate } from '@/types'

export async function getTenant(slug: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('tenants')
    .select('*, tenant_settings(*)')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching tenant:', error)
    return null
  }

  return data
}

export async function getTenantById(id: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('tenants')
    .select('*, tenant_settings(*)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching tenant:', error)
    return null
  }

  return data
}

export async function updateTenantProfile(data: TenantUpdate) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  // Use admin client to bypass RLS and ensure update works
  const supabase = createAdminClient() as any
  
  // Check if slug is being changed and if it's available
  if (data.slug) {
    const { data: existing } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', data.slug)
      .neq('id', user.tenant_id)
      .single()

    if (existing) {
      return { error: 'Este slug já está em uso' }
    }
  }

  // Add updated_at timestamp
  const updateData = {
    ...data,
    updated_at: new Date().toISOString(),
  }

  const { data: tenant, error } = await supabase
    .from('tenants')
    .update(updateData)
    .eq('id', user.tenant_id)
    .select()
    .single()

  if (error) {
    console.error('Error updating tenant:', error)
    return { error: 'Erro ao atualizar perfil' }
  }

  // Aggressive cache invalidation
  revalidatePath('/dashboard/configuracoes')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/admin')

  return { data: tenant }
}

export async function updateTenantSettings(data: TenantSettingsUpdate) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  // Use admin client to bypass RLS and ensure update works
  const supabase = createAdminClient() as any
  
  const { data: settings, error } = await supabase
    .from('tenant_settings')
    .update(data)
    .eq('tenant_id', user.tenant_id)
    .select()
    .single()

  if (error) {
    console.error('Error updating tenant settings:', error)
    return { error: 'Erro ao atualizar configurações' }
  }

  // Aggressive cache invalidation
  revalidatePath('/dashboard/configuracoes')
  revalidatePath('/dashboard')

  return { data: settings }
}

export async function uploadTenantLogo(formData: FormData) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  const supabase = await createClient() as any
  const file = formData.get('logo') as File

  if (!file) {
    return { error: 'Nenhum arquivo enviado' }
  }

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { error: 'Tipo de arquivo não permitido. Use JPEG, PNG, GIF ou WebP' }
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { error: 'Arquivo muito grande. Tamanho máximo: 5MB' }
  }

  console.log(`Uploading logo for tenant: ${user.tenant_id}`)

  // Upload to Supabase Storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${user.tenant_id}/logo.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(fileName, file, {
      upsert: true,
    })

  if (uploadError) {
    console.error('Error uploading logo:', uploadError)
    return { error: 'Erro ao fazer upload do logo' }
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('logos')
    .getPublicUrl(fileName)

  // Use admin client to update tenant
  const adminSupabase = createAdminClient() as any

  console.log(`Updating tenant logo URL: ${user.tenant_id}`)

  const { data: tenant, error: updateError } = await adminSupabase
    .from('tenants')
    .update({ 
      logo_url: publicUrl,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.tenant_id)
    .select()
    .single()

  if (updateError) {
    console.error('Error updating logo URL:', updateError)
    return { error: 'Erro ao atualizar logo' }
  }

  if (!tenant) {
    console.error('Tenant logo update returned no data')
    return { error: 'Erro ao atualizar logo' }
  }

  console.log(`Tenant logo updated successfully: ${user.tenant_id}`)

  // Aggressive cache invalidation
  revalidatePath('/dashboard/configuracoes')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/admin')

  return { url: publicUrl }
}

export async function getTenantPublicData(slug: string) {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('tenants')
    .select(`
      id,
      name,
      slug,
      logo_url,
      primary_color,
      secondary_color,
      phone,
      email,
      address,
      description,
      instagram,
      facebook,
      tenant_settings (
        min_advance_hours,
        max_advance_days,
        slot_interval_minutes,
        cancellation_policy
      )
    `)
    .eq('slug', slug)
    .in('subscription_status', ['active', 'trial'])
    .single()

  if (error) {
    console.error('Error fetching tenant public data:', error)
    return null
  }

  return data
}

