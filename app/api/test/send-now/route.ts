import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendConfirmationWhatsApp, sendReminderWhatsApp } from '@/lib/services/notifications'
import { addMinutes } from 'date-fns'

/**
 * Endpoint de teste para enviar mensagem AGORA
 * POST /api/test/send-now
 * Body: { tenantSlug: "personaldann", minutesFromNow: 2 }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { tenantSlug = 'personaldann', minutesFromNow = 2 } = body

    const supabase = createAdminClient() as any

    // Buscar tenant pelo slug
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('*')
      .ilike('slug', `%${tenantSlug}%`)
      .maybeSingle()

    if (tenantError || !tenant) {
      return NextResponse.json(
        { error: `Tenant "${tenantSlug}" não encontrado` },
        { status: 404 }
      )
    }

    if (!tenant.whatsapp_instance) {
      return NextResponse.json(
        { error: 'Tenant não tem WhatsApp instance configurado' },
        { status: 400 }
      )
    }

    // Criar dados de teste
    const appointmentTime = addMinutes(new Date(), minutesFromNow)
    
    // Buscar ou criar cliente de teste usando telefone do tenant ou 15981910807
    const testPhone = tenant.phone || '15981910807'
    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('tenant_id', tenant.id)
      .ilike('phone', `%${testPhone.replace(/\D/g, '').slice(-8)}%`) // Buscar pelos últimos dígitos
      .maybeSingle()

    let clientId
    let clientData
    if (client) {
      clientId = client.id
      clientData = client
    } else {
      // Criar cliente de teste
      const { data: newClient, error: clientError } = await supabase
        .from('clients')
        .insert({
          tenant_id: tenant.id,
          name: 'Daniel (Teste)',
          phone: testPhone,
          email: null,
        })
        .select()
        .single()
      
      if (clientError) {
        return NextResponse.json(
          { error: 'Erro ao criar cliente: ' + clientError.message },
          { status: 500 }
        )
      }
      
      clientId = newClient?.id
      clientData = newClient
    }

    // Buscar primeiro serviço e funcionário
    const [serviceResult, employeeResult] = await Promise.all([
      supabase
        .from('services')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true)
        .limit(1)
        .single(),
      supabase
        .from('employees')
        .select('*')
        .eq('tenant_id', tenant.id)
        .eq('is_active', true)
        .limit(1)
        .single(),
    ])

    const service = serviceResult.data
    const employee = employeeResult.data

    if (!service || !employee) {
      return NextResponse.json(
        { error: 'É necessário ter pelo menos 1 serviço e 1 funcionário ativo' },
        { status: 400 }
      )
    }

    // Criar agendamento de teste
    const endTime = addMinutes(appointmentTime, service.duration_minutes || 30)
    
    const { data: appointment, error: aptError } = await supabase
      .from('appointments')
      .insert({
        tenant_id: tenant.id,
        client_id: clientId,
        employee_id: employee.id,
        service_id: service.id,
        start_time: appointmentTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'confirmed',
      })
      .select(`
        *,
        client:clients(*),
        employee:employees(*),
        service:services(*),
        tenant:tenants(*)
      `)
      .single()

    if (aptError || !appointment) {
      return NextResponse.json(
        { error: 'Erro ao criar agendamento: ' + aptError?.message },
        { status: 500 }
      )
    }

    // Enviar mensagem de teste AGORA (forçar envio imediato)
    const details = {
      appointment,
      client: appointment.client,
      employee: appointment.employee,
      service: appointment.service,
      tenant: appointment.tenant,
    }

    console.log(`🧪 TESTE: Enviando mensagem de teste para ${appointment.client.phone}`)
    
    // Enviar como lembrete (já que é próximo)
    const success = await sendReminderWhatsApp(details, `em ${minutesFromNow} minutos`)
    
    // Também enviar confirmação
    const confirmationSuccess = await sendConfirmationWhatsApp(details)

    // Registrar notificação
    if (success || confirmationSuccess) {
      await supabase.from('notifications').insert({
        appointment_id: appointment.id,
        type: 'whatsapp',
        status: 'sent',
        message: `Teste - Envio em ${minutesFromNow} minutos`,
        sent_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Mensagem de teste enviada!',
      data: {
        appointment_id: appointment.id,
        cliente: appointment.client.name,
        telefone: appointment.client.phone,
        horario_agendamento: appointmentTime.toISOString(),
        minutos_ate_agendamento: minutesFromNow,
        mensagem_lembrete_enviada: success,
        mensagem_confirmacao_enviada: confirmationSuccess,
      },
    })
  } catch (error: any) {
    console.error('Test error:', error)
    return NextResponse.json(
      { error: error.message || 'Erro ao enviar teste' },
      { status: 500 }
    )
  }
}

/**
 * GET - Teste rápido
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const tenantSlug = searchParams.get('tenant') || 'personaldann'
  const minutes = parseInt(searchParams.get('minutes') || '2')

  return POST(
    new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ tenantSlug, minutesFromNow: minutes }),
    })
  )
}


