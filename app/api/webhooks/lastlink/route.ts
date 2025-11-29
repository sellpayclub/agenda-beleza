import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'
import { addMonths, addDays } from 'date-fns'

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

export async function POST(request: Request) {
  try {
    const payload: LastlinkWebhookPayload = await request.json()
    
    console.log('=== LASTLINK WEBHOOK RECEIVED ===')
    console.log('Event:', payload.Event)
    console.log('IsTest:', payload.IsTest)
    console.log('Data:', JSON.stringify(payload.Data, null, 2))

    const supabase = createAdminClient() as any

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

    // Processar evento
    let updateData: any = {}
    let message = ''

    switch (payload.Event) {
      case EVENTS.PURCHASE_CONFIRMED:
      case EVENTS.ACCESS_STARTED:
        // Ativar assinatura
        updateData = {
          subscription_status: 'active',
          subscription_expires_at: addMonths(new Date(), 1).toISOString(),
          subscription_plan: 'monthly',
          updated_at: new Date().toISOString(),
        }
        message = 'Subscription activated'
        break

      case EVENTS.RECURRENT_PAYMENT:
        // Renovar assinatura
        const currentExpires = tenant.subscription_expires_at 
          ? new Date(tenant.subscription_expires_at) 
          : new Date()
        updateData = {
          subscription_status: 'active',
          subscription_expires_at: addMonths(currentExpires, 1).toISOString(),
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

    // Atualizar tenant
    const { error: updateError } = await supabase
      .from('tenants')
      .update(updateData)
      .eq('id', tenant.id)

    if (updateError) {
      console.error('Error updating tenant:', updateError)
      return NextResponse.json({ 
        success: false, 
        error: 'Error updating subscription' 
      }, { status: 500 })
    }

    console.log(`Tenant ${tenant.id} updated:`, message)

    // Logar evento processado
    await supabase
      .from('webhook_logs')
      .insert({
        source: 'lastlink',
        event: payload.Event,
        payload: payload,
        buyer_email: buyerEmail,
        tenant_id: tenant.id,
        processed: true,
      })
      .catch(() => {}) // Ignorar se tabela não existe

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

