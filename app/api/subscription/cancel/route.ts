import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { tenantId } = await request.json()

    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient() as any

    const { error } = await supabase
      .from('tenants')
      .update({ 
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString(),
      } as any)
      .eq('id', tenantId)

    if (error) {
      console.error('Error cancelling subscription:', error)
      return NextResponse.json(
        { error: 'Erro ao cancelar assinatura' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in cancel subscription:', error)
    return NextResponse.json(
      { error: 'Erro interno' },
      { status: 500 }
    )
  }
}

