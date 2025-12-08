import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Endpoint de teste para verificar o sistema de lembretes
 * GET /api/test/reminders
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient() as any
    const now = new Date()

    // Buscar próximos agendamentos confirmados
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        status,
        client:clients(id, name, phone),
        employee:employees(id, name),
        service:services(id, name),
        tenant:tenants(id, name, whatsapp_instance)
      `)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', now.toISOString())
      .order('start_time', { ascending: true })
      .limit(5)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Calcular próximos lembretes
    const appointmentsWithReminders = (appointments || []).map(apt => {
      const appointmentTime = new Date(apt.start_time)
      const timeDiff = appointmentTime.getTime() - now.getTime()
      const hoursDiff = timeDiff / (1000 * 60 * 60)

      return {
        id: apt.id,
        cliente: apt.client?.name || 'N/A',
        telefone: apt.client?.phone || 'N/A',
        servico: apt.service?.name || 'N/A',
        horario: appointmentTime.toLocaleString('pt-BR'),
        status: apt.status,
        horas_ate_agendamento: hoursDiff.toFixed(2),
        tem_whatsapp_instance: !!apt.tenant?.whatsapp_instance,
        proximo_lembrete_24h: hoursDiff <= 24.1 && hoursDiff >= 23.9 ? 'AGORA' : 
                              hoursDiff > 24.1 ? `${(hoursDiff - 24).toFixed(2)}h` : 'Já passou',
        proximo_lembrete_1h: hoursDiff <= 1.1 && hoursDiff >= 0.9 ? 'AGORA' :
                             hoursDiff > 1.1 ? `${(hoursDiff - 1).toFixed(2)}h` : 'Já passou',
      }
    })

    // Verificar notificações já enviadas
    const appointmentIds = (appointments || []).map(a => a.id)
    const { data: notifications } = await supabase
      .from('notifications')
      .select('appointment_id, message, sent_at')
      .in('appointment_id', appointmentIds)

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      proximos_agendamentos: appointmentsWithReminders,
      notificacoes_enviadas: notifications || [],
      total_agendamentos: appointments?.length || 0,
      configuracoes: {
        cron_interval: '5 minutos',
        lembrete_24h: 'Entre 23h55min e 24h5min antes',
        lembrete_1h: 'Entre 55min e 1h5min antes',
      }
    })
  } catch (error: any) {
    console.error('Test error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao testar' },
      { status: 500 }
    )
  }
}
