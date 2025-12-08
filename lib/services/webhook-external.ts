// External webhook integration for appointment notifications

const WEBHOOK_URL = 'https://webhook.dcsaudeautomacao.com/webhook/agendamentorecebido'

export interface AppointmentWebhookData {
  appointment: any
  client: any
  employee: any
  service: any
  tenant: any
}

/**
 * Sends appointment data to external webhook
 * @param data Complete appointment data including client, employee, service, and tenant
 * @returns Promise<boolean> - true if successful, false otherwise
 */
export async function sendAppointmentToWebhook(data: AppointmentWebhookData): Promise<boolean> {
  const { appointment, client, employee, service, tenant } = data

  try {
    // Build payload with all relevant data
    const payload = {
      // Cliente data
      cliente: {
        id: client?.id || null,
        nome: client?.name || null,
        telefone: client?.phone || null,
        email: client?.email || null,
        observacoes: client?.notes || null,
      },
      // Agendamento data
      agendamento: {
        id: appointment?.id || null,
        data_inicio: appointment?.start_time || null,
        data_fim: appointment?.end_time || null,
        status: appointment?.status || null,
        status_pagamento: appointment?.payment_status || null,
        observacoes: appointment?.notes || null,
        criado_em: appointment?.created_at || null,
      },
      // Serviço data
      servico: {
        id: service?.id || null,
        nome: service?.name || null,
        preco: service?.price || null,
        duracao_minutos: service?.duration_minutes || null,
      },
      // Funcionário/Profissional data
      funcionario: {
        id: employee?.id || null,
        nome: employee?.name || null,
        email: employee?.email || null,
      },
      // Tenant/Estabelecimento data
      estabelecimento: {
        id: tenant?.id || null,
        nome: tenant?.name || null,
        slug: tenant?.slug || null,
        telefone: tenant?.phone || null,
        email: tenant?.email || null,
        endereco: tenant?.address || null,
        whatsapp_instance: tenant?.whatsapp_instance || null,
      },
      // Metadata
      timestamp: new Date().toISOString(),
    }

    console.log(`📤 [WEBHOOK] ===== PREPARANDO ENVIO =====`)
    console.log(`📤 [WEBHOOK] Appointment ID: ${appointment?.id}`)
    console.log(`📤 [WEBHOOK] URL: ${WEBHOOK_URL}`)
    console.log(`📤 [WEBHOOK] Payload completo:`)
    console.log(JSON.stringify(payload, null, 2))
    console.log(`📤 [WEBHOOK] Fazendo requisição POST...`)

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(payload),
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 seconds timeout
    })

    console.log(`📥 [WEBHOOK] Resposta recebida:`)
    console.log(`📥 [WEBHOOK] Status: ${response.status} ${response.statusText}`)
    console.log(`📥 [WEBHOOK] Headers:`, Object.fromEntries(response.headers.entries()))

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ [WEBHOOK] ===== FALHA NA REQUISIÇÃO =====`)
      console.error(`❌ [WEBHOOK] Status: ${response.status} ${response.statusText}`)
      console.error(`❌ [WEBHOOK] Response body: ${errorText}`)
      return false
    }

    const responseData = await response.text()
    console.log(`✅ [WEBHOOK] ===== SUCESSO =====`)
    console.log(`✅ [WEBHOOK] Appointment ${appointment?.id} enviado com sucesso!`)
    console.log(`✅ [WEBHOOK] Response body: ${responseData}`)
    return true
  } catch (error: any) {
    console.error(`\n❌ [WEBHOOK] ===== ERRO EXCEPCIONAL =====`)
    console.error(`❌ [WEBHOOK] Appointment ID: ${appointment?.id}`)
    console.error(`❌ [WEBHOOK] Tipo de erro: ${error?.name || 'Unknown'}`)
    console.error(`❌ [WEBHOOK] Mensagem: ${error?.message || 'No message'}`)
    console.error(`❌ [WEBHOOK] Stack:`, error?.stack)
    if (error.cause) {
      console.error(`❌ [WEBHOOK] Causa:`, error.cause)
    }
    return false
  }
}
