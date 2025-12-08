import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendAppointmentToWebhook } from '@/lib/services/webhook-external'

/**
 * Endpoint de teste para enviar dados de um agendamento ao webhook
 * GET /api/test/webhook?appointmentId=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const appointmentId = searchParams.get('appointmentId')

    if (!appointmentId) {
      return NextResponse.json(
        { error: 'appointmentId é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient() as any

    // Buscar agendamento com todos os dados
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        client:clients(*),
        employee:employees(*),
        service:services(*),
        tenant:tenants(*)
      `)
      .eq('id', appointmentId)
      .single()

    if (error || !appointment) {
      return NextResponse.json(
        { error: 'Agendamento não encontrado' },
        { status: 404 }
      )
    }

    if (!appointment.client || !appointment.employee || !appointment.service || !appointment.tenant) {
      return NextResponse.json(
        { error: 'Dados incompletos do agendamento' },
        { status: 400 }
      )
    }

    // Enviar ao webhook
    console.log(`🧪 TESTE: Enviando agendamento ${appointmentId} ao webhook`)
    const success = await sendAppointmentToWebhook({
      appointment,
      client: appointment.client,
      employee: appointment.employee,
      service: appointment.service,
      tenant: appointment.tenant,
    })

    return NextResponse.json({
      success,
      message: success 
        ? 'Dados enviados com sucesso ao webhook' 
        : 'Falha ao enviar dados ao webhook',
      appointment: {
        id: appointment.id,
        cliente: appointment.client.name,
        servico: appointment.service.name,
        funcionario: appointment.employee.name,
        data: appointment.start_time,
      },
    })
  } catch (error: any) {
    console.error('Test webhook error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao testar webhook' },
      { status: 500 }
    )
  }
}
