'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/utils/format'
import { PLAN_COMPLETO } from '@/lib/utils/plan-features'

export async function signIn(formData: FormData) {
  try {
    const supabase = await createClient() as any
    const adminClient = createAdminClient() as any
    
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
      return { error: 'Email e senha são obrigatórios' }
    }

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error('Login auth error:', error)
      return { error: error.message || 'Erro ao fazer login' }
    }

    if (!authData.user) {
      return { error: 'Erro ao fazer login. Usuário não encontrado.' }
    }

    // Verificar se o usuário existe na tabela users
    const { data: existingUser } = await adminClient
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle()

    // Se não existir, criar registro básico (caso o usuário tenha confirmado email depois)
    if (!existingUser) {
      console.log('User not found in users table, trying to create...')
      // Tentar encontrar tenant pelo email
      const { data: tenant } = await adminClient
        .from('tenants')
        .select('*')
        .eq('email', email)
        .maybeSingle()

      if (tenant) {
        // Criar usuário associado ao tenant existente
        const { error: insertError } = await adminClient
          .from('users')
          .insert({
            id: authData.user.id,
            tenant_id: tenant.id,
            role: 'admin',
            name: authData.user.user_metadata?.name || email.split('@')[0],
            email: email,
          })

        if (insertError) {
          console.error('Error creating user on login:', insertError)
          return { error: 'Erro ao criar perfil. Por favor, tente novamente ou entre em contato com o suporte.' }
        }
      } else {
        // Se não encontrar tenant, retornar erro
        console.error('No tenant found for email:', email)
        return { error: 'Usuário não encontrado. Por favor, registre-se novamente.' }
      }
    }

    // Retornar sucesso - o redirect será feito pelo cliente
    return { success: true }
  } catch (error: any) {
    console.error('SignIn error:', error)
    return { error: error?.message || 'Erro inesperado ao fazer login' }
  }
}

// Rate limiting: armazenar tentativas de registro por IP/email
const registrationAttempts = new Map<string, { count: number; lastAttempt: number }>()
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hora
const MAX_ATTEMPTS_PER_HOUR = 3 // Máximo 3 tentativas por hora por IP/email

function getRateLimitKey(identifier: string): string {
  return `signup:${identifier}`
}

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const key = getRateLimitKey(identifier)
  const now = Date.now()
  const attempt = registrationAttempts.get(key)

  if (!attempt) {
    registrationAttempts.set(key, { count: 1, lastAttempt: now })
    return { allowed: true, remaining: MAX_ATTEMPTS_PER_HOUR - 1 }
  }

  // Reset se passou a janela de tempo
  if (now - attempt.lastAttempt > RATE_LIMIT_WINDOW) {
    registrationAttempts.set(key, { count: 1, lastAttempt: now })
    return { allowed: true, remaining: MAX_ATTEMPTS_PER_HOUR - 1 }
  }

  // Incrementar contador
  attempt.count++
  attempt.lastAttempt = now
  registrationAttempts.set(key, attempt)

  if (attempt.count > MAX_ATTEMPTS_PER_HOUR) {
    return { allowed: false, remaining: 0 }
  }

  return { allowed: true, remaining: MAX_ATTEMPTS_PER_HOUR - attempt.count }
}

export async function signUp(formData: FormData) {
  try {
    // Verificar se registro público está habilitado
    const enablePublicRegistration = process.env.ENABLE_PUBLIC_REGISTRATION === 'true'
    
    if (!enablePublicRegistration) {
      console.warn('⚠️ Tentativa de registro bloqueada - registro público desabilitado')
      return { error: 'Registro de novas contas está temporariamente desabilitado. Entre em contato com o suporte.' }
    }

    const supabase = await createClient() as any
    const adminClient = createAdminClient() as any
    
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const businessName = formData.get('businessName') as string
    const phone = formData.get('phone') as string

    if (!name || !email || !password || !businessName || !phone) {
      return { error: 'Todos os campos são obrigatórios' }
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { error: 'Email inválido' }
    }

    // Rate limiting por email
    const rateLimit = checkRateLimit(email.toLowerCase())
    if (!rateLimit.allowed) {
      console.warn(`⚠️ Rate limit excedido para email: ${email}`)
      return { error: `Muitas tentativas. Aguarde 1 hora antes de tentar novamente.` }
    }

    // Verificar se email já existe
    const { data: existingTenant } = await adminClient
      .from('tenants')
      .select('id, email')
      .eq('email', email.toLowerCase())
      .maybeSingle()

    if (existingTenant) {
      console.warn(`⚠️ Tentativa de registro com email já existente: ${email}`)
      return { error: 'Este email já está cadastrado. Use outro email ou faça login.' }
    }

    console.log(`📝 Tentativa de registro: ${email} (${businessName})`)

    // Create user in Supabase Auth
    // IMPORTANTE: emailConfirmRequired deve estar habilitado no Supabase Dashboard
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: email.toLowerCase(),
      password,
      options: {
        data: {
          name,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      },
    })

    if (authError) {
      console.error('Auth error:', authError)
      return { error: authError.message || 'Erro ao criar usuário no sistema de autenticação' }
    }

    if (!authData.user) {
      return { error: 'Erro ao criar usuário. Verifique se o email já está cadastrado.' }
    }

    // Create tenant
    const slug = slugify(businessName)
    
    // Check if slug exists
    const { data: existingTenant } = await adminClient
      .from('tenants')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    const finalSlug = existingTenant ? `${slug}-${Date.now()}` : slug

    // Definir plano completo por padrão
    const defaultPlan = PLAN_COMPLETO // 'completo'
    const defaultStatus = 'active'
    
    console.log('Creating tenant with plan:', defaultPlan, 'and status:', defaultStatus)

    const { data: tenant, error: tenantError } = await adminClient
      .from('tenants')
      .insert({
        name: businessName,
        slug: finalSlug,
        phone,
        email,
        subscription_plan: defaultPlan, // Plano completo por padrão
        subscription_status: defaultStatus, // Status ativo por padrão
      })
      .select()
      .single()

    if (tenantError) {
      console.error('Tenant error:', tenantError)
      return { error: `Erro ao criar negócio: ${tenantError.message || 'Erro desconhecido'}` }
    }

    if (!tenant) {
      return { error: 'Erro ao criar negócio' }
    }

    // Create user record
    const { error: userError } = await adminClient
      .from('users')
      .insert({
        id: authData.user.id,
        tenant_id: tenant.id,
        role: 'admin',
        name,
        email,
        phone,
      })

    if (userError) {
      console.error('User error:', userError)
      // Se falhar ao criar user, tentar continuar mesmo assim (pode ser que já exista)
      console.log('Tentando continuar mesmo com erro ao criar user...')
    }

    // Create default tenant settings
    const { error: settingsError } = await adminClient
      .from('tenant_settings')
      .insert({
        tenant_id: tenant.id,
      })

    if (settingsError) {
      console.error('Settings error:', settingsError)
      // Não bloquear por erro de settings
    }

    // Create default employee (the admin as first employee)
    const { error: employeeError } = await adminClient
      .from('employees')
      .insert({
        tenant_id: tenant.id,
        user_id: authData.user.id,
        name,
        email,
        phone,
        is_active: true,
      })

    if (employeeError) {
      console.error('Employee error:', employeeError)
      // Não bloquear por erro de employee
    }

    console.log(`✅ Registro criado com sucesso: ${email} (Tenant ID: ${tenant.id})`)

    // SEMPRE exigir confirmação de email - nunca permitir login sem confirmação
    if (authData.user && !authData.session) {
      return { 
        success: true,
        message: 'Conta criada! Verifique seu email para confirmar antes de fazer login.',
        requiresConfirmation: true
      }
    }

    // Se por algum motivo não exigiu confirmação, ainda assim redirecionar para login
    // (não deve acontecer se emailConfirmRequired estiver habilitado no Supabase)
    console.warn('⚠️ Registro criado sem exigir confirmação de email - verificar configuração do Supabase')
    redirect('/login')
  } catch (error: any) {
    console.error('SignUp error:', error)
    return { error: error?.message || 'Erro inesperado ao criar conta' }
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(formData: FormData) {
  const supabase = await createClient()
  
  const email = formData.get('email') as string

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true }
}

export async function updatePassword(formData: FormData) {
  const supabase = await createClient()
  
  const password = formData.get('password') as string

  const { error } = await supabase.auth.updateUser({
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/dashboard')
}

export async function getCurrentUser() {
  try {
    const supabase = await createClient() as any
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return null
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*, tenants(*)')
      .eq('id', user.id)
      .maybeSingle()

    // Se encontrou perfil, retornar
    if (profile) {
      return profile
    }

    // Se não encontrar perfil, tentar criar usando admin client (apenas uma vez)
    const adminClient = createAdminClient() as any
    
    // Tentar encontrar tenant pelo email
    const { data: tenant } = await adminClient
      .from('tenants')
      .select('*')
      .eq('email', user.email)
      .maybeSingle()

    if (tenant) {
      // Criar usuário
      const { data: newProfile, error: insertError } = await adminClient
        .from('users')
        .insert({
          id: user.id,
          tenant_id: tenant.id,
          role: 'admin',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
          email: user.email || '',
        })
        .select('*, tenants(*)')
        .maybeSingle()

      if (!insertError && newProfile) {
        return newProfile
      }
    }

    // Se não conseguiu criar, retornar null (vai redirecionar para login)
    return null
  } catch (error) {
    console.error('getCurrentUser error:', error)
    return null
  }
}

export async function getCurrentTenant() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return null
    }
    const user = currentUser as any
    
    if (!user.tenant_id) {
      return null
    }
    
    const supabase = await createClient() as any
    
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('*, tenant_settings(*)')
      .eq('id', user.tenant_id)
      .maybeSingle()

    if (error) {
      console.error('Error fetching tenant:', error)
      return null
    }

    return tenant
  } catch (error) {
    console.error('getCurrentTenant error:', error)
    return null
  }
}

// Função otimizada que busca user e tenant em uma única chamada
export async function getCurrentUserAndTenant() {
  try {
    const supabase = await createClient() as any
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return { user: null, tenant: null }
    }

    // Buscar user com tenant em uma única query
    const { data: profile } = await supabase
      .from('users')
      .select('*, tenant:tenants(*, tenant_settings(*))')
      .eq('id', user.id)
      .maybeSingle()

    if (profile && profile.tenant) {
      return { 
        user: profile, 
        tenant: profile.tenant 
      }
    }

    // Fallback: tentar criar user se não existir
    const adminClient = createAdminClient() as any
    const { data: existingTenant } = await adminClient
      .from('tenants')
      .select('*, tenant_settings(*)')
      .eq('email', user.email)
      .maybeSingle()

    if (existingTenant) {
      const { data: newProfile } = await adminClient
        .from('users')
        .insert({
          id: user.id,
          tenant_id: existingTenant.id,
          role: 'admin',
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
          email: user.email || '',
        })
        .select('*')
        .maybeSingle()

      if (newProfile) {
        return { user: newProfile, tenant: existingTenant }
      }
    }

    return { user: null, tenant: null }
  } catch (error) {
    console.error('getCurrentUserAndTenant error:', error)
    return { user: null, tenant: null }
  }
}

