import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendCancellationWhatsApp } from '@/lib/services/notifications'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { reason, tenantId } = body

    const supabase = createAdminClient() as any

    // Get appointment with all relations
    const { data: appointment, error: fetchError } = await supabase
      .from('appointments')
      .select(`
        *,
        client:clients (*),
        employee:employees (*),
        service:services (*),
        tenant:tenants (*)
      `)
      .eq('id', id)
      .eq('tenant_id', tenantId)
      .single()

    if (fetchError || !appointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    // Check if already cancelled
    if (appointment.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Agendamento já foi cancelado' },
        { status: 400 }
      )
    }

    // Check if appointment is in the past
    if (new Date(appointment.start_time) < new Date()) {
      return NextResponse.json(
        { error: 'Não é possível cancelar agendamentos passados' },
        { status: 400 }
      )
    }

    // Update appointment status
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancellation_reason: reason || 'Cancelado pelo cliente',
      })
      .eq('id', id)

    if (updateError) {
      console.error('Error cancelling appointment:', updateError)
      return NextResponse.json(
        { error: 'Erro ao cancelar agendamento' },
        { status: 500 }
      )
    }

    // Send cancellation notification
    const notificationDetails = {
      appointment: { ...appointment, cancellation_reason: reason || 'Cancelado pelo cliente' },
      client: appointment.client,
      employee: appointment.employee,
      service: appointment.service,
      tenant: appointment.tenant,
    }

    sendCancellationWhatsApp(notificationDetails).catch(err => {
      console.error('Error sending cancellation notification:', err)
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cancel appointment error:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

