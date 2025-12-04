import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { addMonths, addDays } from 'date-fns'
import { PLAN_START, PLAN_COMPLETO } from '@/lib/utils/plan-features'
import { revalidatePath } from 'next/cache'

// Tipos para os eventos da Lastlink
interface LastlinkWebhookPayload {
  Id: string
  IsTest: boolean
  Event: string
  CreatedAt: string
  Data: {
    Products?: Array<{
      Id: string
      Name: string
      Price?: number
    }>
    Buyer?: {
      Id: string
      Email: string
      Name: string
      PhoneNumber?: string
      Document?: string
    }
    Seller?: {
      Id: string
      Email: string
    }
    Purchase?: {
      PaymentId?: string
      Recurrency?: number
      PaymentDate?: string
      OriginalPrice?: { Value: number }
      Price?: { Value: number }
      Payment?: {
        NumberOfInstallments?: number
        PaymentMethod?: string
      }
    }
    Subscriptions?: Array<{
      Id: string
      ProductId: string
    }>
    Offer?: {
      Id: string
      Name: string
      Url: string
    }
    Member?: {
      Id: string
      Email: string
    }
    AccessType?: string
    AccessStartedAt?: string
    AccessEndedAt?: string
    SubscriptionId?: string
  }
}

// Eventos que a Lastlink pode enviar
const EVENTS = {
  PURCHASE_CONFIRMED: 'Purchase_Order_Confirmed',
  SUBSCRIPTION_CANCELED: 'Subscription_Canceled',
  SUBSCRIPTION_EXPIRED: 'Subscription_Expired',
  PAYMENT_REFUND: 'Payment_Refund',
  PAYMENT_CHARGEBACK: 'Payment_Chargeback',
  RECURRENT_PAYMENT: 'Recurrent_Payment',
  ACCESS_STARTED: 'Product_Access_Started',
  ACCESS_ENDED: 'Product_Access_Ended',
  REFUND_REQUESTED: 'Refund_Requested',
}

// Token de validação da LastLink
const LASTLINK_TOKEN = 'f3fb63d1240846d6b1a7485ec6a47e26'

/**
 * Identifica o plano baseado no nome do produto da LastLink
 */
function identifyPlan(productName: string | undefined): string | null {
  if (!productName) return null
  
  const name = productName.toLowerCase()
  
  // Verificar se contém "start" ou "plano start"
  if (name.includes('start') || name.includes('plano start')) {
    return PLAN_START
  }
  
  // Verificar se contém "completo" ou "plano completo"
  if (name.includes('completo') || name.includes('plano completo')) {
    return PLAN_COMPLETO
  }
  
  return null
}

export async function POST(request: Request) {
  try {
    // Validar token
    const authHeader = request.headers.get('authorization')
    const tokenHeader = request.headers.get('x-token') || request.headers.get('token')
    const providedToken = authHeader?.replace('Bearer ', '') || tokenHeader

    if (!providedToken || providedToken !== LASTLINK_TOKEN) {
      console.log('Invalid or missing token in webhook request')
      return NextResponse.json({ 
        success: false, 
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    const payload: LastlinkWebhookPayload = await request.json()
    
    console.log('=== LASTLINK WEBHOOK RECEIVED ===')
    console.log('Event ID:', payload.Id)
    console.log('Event:', payload.Event)
    console.log('IsTest:', payload.IsTest)
    console.log('Data:', JSON.stringify(payload.Data, null, 2))

    const supabase = createAdminClient() as any

    // Check if this event was already processed (idempotency)
    // Try to check by event_id first, fallback to checking payload hash
    if (payload.Id) {
      try {
        const { data: existingLog } = await supabase
          .from('webhook_logs')
          .select('id, processed')
          .eq('source', 'lastlink')
          .eq('event_id', payload.Id)
          .maybeSingle()

        if (existingLog && existingLog.processed) {
          console.log(`Event ${payload.Id} already processed, skipping`)
          return NextResponse.json({ 
            success: true, 
            message: 'Event already processed',
            eventId: payload.Id
          })
        }
      } catch (err: any) {
        // If event_id column doesn't exist, continue processing
        if (err.message && err.message.includes('column') && err.message.includes('event_id')) {
          console.log('event_id column not found, skipping idempotency check')
        } else {
          console.error('Error checking idempotency:', err)
        }
      }
    }

    // Obter email do comprador
    const buyerEmail = payload.Data?.Buyer?.Email || payload.Data?.Member?.Email
    
    if (!buyerEmail) {
      console.log('No buyer email found in webhook')
      return NextResponse.json({ 
        success: false, 
        error: 'No buyer email found' 
      }, { status: 400 })
    }

    // Buscar tenant pelo email
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .eq('email', buyerEmail.toLowerCase())
      .maybeSingle()

    if (tenantError) {
      console.error('Error finding tenant:', tenantError)
      return NextResponse.json({ 
        success: false, 
        error: 'Database error' 
      }, { status: 500 })
    }

    // Se não encontrou tenant, pode ser um novo usuário
    // Vamos logar mas não criar automaticamente (o usuário precisa se cadastrar)
    if (!tenant) {
      console.log('Tenant not found for email:', buyerEmail)
      
      // Salvar o evento para processamento posterior
      await supabase
        .from('webhook_logs')
        .insert({
          source: 'lastlink',
          event: payload.Event,
          payload: payload,
          buyer_email: buyerEmail,
          processed: false,
          error: 'Tenant not found',
        })
        .catch(() => {}) // Ignorar se tabela não existe
      
      return NextResponse.json({ 
        success: true, 
        message: 'Tenant not found, event logged' 
      })
    }

    // Identificar plano do produto comprado
    const productName = payload.Data?.Products?.[0]?.Name
    const identifiedPlan = identifyPlan(productName)
    
    // Se não identificou pelo nome, manter plano atual ou usar 'start' como padrão
    const newPlan = identifiedPlan || tenant.subscription_plan || PLAN_START

    // Processar evento
    let updateData: any = {}
    let message = ''

    switch (payload.Event) {
      case EVENTS.PURCHASE_CONFIRMED:
      case EVENTS.ACCESS_STARTED:
        // Ativar assinatura com plano identificado
        updateData = {
          subscription_status: 'active',
          subscription_expires_at: addMonths(new Date(), 1).toISOString(),
          subscription_plan: newPlan,
          updated_at: new Date().toISOString(),
        }
        message = `Subscription activated with plan: ${newPlan}`
        break

      case EVENTS.RECURRENT_PAYMENT:
        // Renovar assinatura (manter plano atual ou atualizar se identificado novo)
        const currentExpires = tenant.subscription_expires_at 
          ? new Date(tenant.subscription_expires_at) 
          : new Date()
        updateData = {
          subscription_status: 'active',
          subscription_expires_at: addMonths(currentExpires, 1).toISOString(),
          subscription_plan: identifiedPlan || tenant.subscription_plan || PLAN_START,
          updated_at: new Date().toISOString(),
        }
        message = 'Subscription renewed'
        break

      case EVENTS.SUBSCRIPTION_CANCELED:
      case EVENTS.PAYMENT_REFUND:
      case EVENTS.PAYMENT_CHARGEBACK:
      case EVENTS.REFUND_REQUESTED:
        // Cancelar assinatura (mas manter acesso até o fim do período)
        updateData = {
          subscription_status: 'cancelled',
          updated_at: new Date().toISOString(),
        }
        message = 'Subscription cancelled'
        break

      case EVENTS.SUBSCRIPTION_EXPIRED:
      case EVENTS.ACCESS_ENDED:
        // Expirar assinatura
        updateData = {
          subscription_status: 'expired',
          updated_at: new Date().toISOString(),
        }
        message = 'Subscription expired'
        break

      default:
        console.log('Unknown event:', payload.Event)
        return NextResponse.json({ 
          success: true, 
          message: 'Event not handled' 
        })
    }

    // Atualizar tenant com verificação de sucesso
    console.log(`Updating tenant ${tenant.id} with data:`, updateData)

    const { data: updatedTenant, error: updateError } = await supabase
      .from('tenants')
      .update(updateData)
      .eq('id', tenant.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating tenant:', updateError)
      
      // Log failed event
      await supabase
        .from('webhook_logs')
        .insert({
          source: 'lastlink',
          event_id: payload.Id,
          event: payload.Event,
          payload: payload,
          buyer_email: buyerEmail,
          tenant_id: tenant.id,
          processed: false,
          error: updateError.message || 'Error updating subscription',
        })
        .catch(() => {})
      
      return NextResponse.json({ 
        success: false, 
        error: 'Error updating subscription' 
      }, { status: 500 })
    }

    if (!updatedTenant) {
      console.error('Tenant update returned no data:', tenant.id)
      return NextResponse.json({ 
        success: false, 
        error: 'Tenant not found or update failed' 
      }, { status: 500 })
    }

    console.log(`Tenant ${tenant.id} updated successfully:`, message)

    // Aggressive cache invalidation after webhook update
    // Note: revalidateTag doesn't work in API routes, only revalidatePath
    revalidatePath('/dashboard/assinatura')
    revalidatePath('/dashboard')
    revalidatePath('/dashboard/configuracoes')
    revalidatePath('/dashboard/admin')

    console.log(`Tenant ${tenant.id} updated:`, message)

    // Logar evento processado com idempotência
    try {
      const logData: any = {
        source: 'lastlink',
        event: payload.Event,
        payload: payload,
        buyer_email: buyerEmail,
        tenant_id: tenant.id,
        processed: true,
      }

      // Add event_id if column exists
      if (payload.Id) {
        logData.event_id = payload.Id
      }

      await supabase
        .from('webhook_logs')
        .insert(logData)
        .catch((err: any) => {
          // Try upsert if insert fails (event_id might exist)
          if (payload.Id) {
            return supabase
              .from('webhook_logs')
              .upsert(logData, {
                onConflict: 'event_id,source',
                ignoreDuplicates: false
              })
              .catch(() => {})
          }
          return Promise.resolve()
        })
    } catch (err) {
      console.error('Error logging webhook event:', err)
      // Não falhar se logging falhar
    }

    return NextResponse.json({ 
      success: true, 
      message,
      tenantId: tenant.id,
    })

  } catch (error: any) {
    console.error('Lastlink webhook error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}

// GET para verificar se o endpoint está funcionando
export async function GET() {
  return NextResponse.json({ 
    status: 'ok',
    message: 'Lastlink webhook endpoint is active',
    supportedEvents: Object.values(EVENTS),
  })
}

