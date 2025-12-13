import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency, formatPhone } from '@/lib/utils/format'
import type { Appointment, Client, Employee, Service, Tenant } from '@/types'
import { createAdminClient } from '@/lib/supabase/admin'

interface AppointmentDetails {
  appointment: Appointment
  client: Client
  employee: Employee
  service: Service
  tenant: Tenant
}

// Evolution API integration
async function sendWhatsAppMessage(phone: string, message: string, instanceName?: string): Promise<boolean> {
  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionKey = process.env.EVOLUTION_API_KEY
  const instance = instanceName || process.env.EVOLUTION_INSTANCE_NAME

  if (!evolutionUrl || !evolutionKey || !instance) {
    console.log('Evolution API not configured or instance not provided')
    return false
  }

  try {
    // Format phone number (remove non-digits, add country code if needed)
    let formattedPhone = phone.replace(/\D/g, '')
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone
    }

    const response = await fetch(`${evolutionUrl}/message/sendText/${instance}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': evolutionKey,
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: message,
      }),
    })

    if (!response.ok) {
      console.error('Failed to send WhatsApp message:', await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return false
  }
}

// Get booking management link
function getManageLink(tenant: Tenant, appointmentId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  return `${baseUrl}/b/${tenant.slug}/manage/${appointmentId}`
}

// Process message template - replace variables with actual values
function processMessageTemplate(
  template: string,
  details: AppointmentDetails,
  hoursBeforeText?: string
): string {
  const { appointment, client, employee, service, tenant } = details
  const appointmentDate = format(new Date(appointment.start_time), "EEEE, dd 'de' MMMM", { locale: ptBR })
  const appointmentTime = format(new Date(appointment.start_time), 'HH:mm')
  const appointmentDateShort = format(new Date(appointment.start_time), "dd/MM/yyyy", { locale: ptBR })
  const manageLink = getManageLink(tenant, appointment.id)

  // Replace variables
  let message = template
    .replace(/{cliente_nome}/g, client.name || '')
    .replace(/{cliente_telefone}/g, client.phone || '')
    .replace(/{servico_nome}/g, service.name || '')
    .replace(/{servico_preco}/g, formatCurrency(service.price || 0))
    .replace(/{funcionario_nome}/g, employee.name || '')
    .replace(/{data}/g, appointmentDate)
    .replace(/{hora}/g, appointmentTime)
    .replace(/{data_formatada}/g, appointmentDateShort)
    .replace(/{link_reagendar}/g, manageLink)
    .replace(/{nome_estabelecimento}/g, tenant.name || '')
    .replace(/{tempo_antes}/g, hoursBeforeText || '')

  // Replace endereco conditionally
  if (tenant.address) {
    message = message.replace(/{endereco}/g, `📍 *Endereço:* ${tenant.address}`)
  } else {
    message = message.replace(/{endereco}/g, '')
  }

  // Clean up multiple newlines
  message = message.replace(/\n{3,}/g, '\n\n')

  return message.trim()
}

// Get default confirmation message template
function getDefaultConfirmationTemplate(): string {
  return `✅ *Agendamento Confirmado*

Olá {cliente_nome}!

Seu agendamento foi confirmado:

📋 *Serviço:* {servico_nome}
👤 *Profissional:* {funcionario_nome}
📅 *Data:* {data}
⏰ *Horário:* {hora}
💰 *Valor:* {servico_preco}

{endereco}

🔗 *Reagendar ou cancelar:*
{link_reagendar}

Qualquer dúvida, entre em contato!

_{nome_estabelecimento}_`
}

// Get default reminder template
function getDefaultReminderTemplate(): string {
  return `⏰ *Lembrete de Agendamento*

Olá {cliente_nome}!

Seu agendamento é *{tempo_antes}* às *{hora}*.

📋 *Serviço:* {servico_nome}
👤 *Profissional:* {funcionario_nome}

{endereco}

🔗 *Precisa reagendar ou cancelar?*
{link_reagendar}

Estamos esperando você! 😊

_{nome_estabelecimento}_`
}

// WhatsApp message templates
async function getConfirmationWhatsAppMessage(details: AppointmentDetails): Promise<string> {
  const { tenant } = details
  
  // Buscar template personalizado
  try {
    const supabase = createAdminClient() as any
    const { data: settings } = await supabase
      .from('tenant_settings')
      .select('message_templates')
      .eq('tenant_id', tenant.id)
      .single()

    const templates = (settings?.message_templates as any) || {}
    const customTemplate = templates.confirmation

    if (customTemplate && customTemplate.trim()) {
      return processMessageTemplate(customTemplate, details)
    }
  } catch (error) {
    console.error('Error fetching custom template:', error)
    // Fallback to default
  }

  // Use default template
  const defaultTemplate = getDefaultConfirmationTemplate()
  return processMessageTemplate(defaultTemplate, details)
}

async function getReminderWhatsAppMessage(details: AppointmentDetails, hoursBeforeText: string): Promise<string> {
  const { tenant } = details
  
  // Determinar qual template usar (24h ou 1h)
  const templateKey = hoursBeforeText.includes('24') || hoursBeforeText.includes('amanhã') 
    ? 'reminder_24h' 
    : 'reminder_1h'
  
  // Buscar template personalizado
  try {
    const supabase = createAdminClient() as any
    const { data: settings } = await supabase
      .from('tenant_settings')
      .select('message_templates')
      .eq('tenant_id', tenant.id)
      .single()

    const templates = (settings?.message_templates as any) || {}
    const customTemplate = templates[templateKey]

    if (customTemplate && customTemplate.trim()) {
      // processMessageTemplate já substitui {tempo_antes} na linha 87
      return processMessageTemplate(customTemplate, details, hoursBeforeText)
    }
  } catch (error) {
    console.error('Error fetching custom template:', error)
    // Fallback to default
  }

  // Use default template
  // processMessageTemplate já substitui {tempo_antes} na linha 87
  const defaultTemplate = getDefaultReminderTemplate()
  return processMessageTemplate(defaultTemplate, details, hoursBeforeText)
}

function getCancellationWhatsAppMessage(details: AppointmentDetails): string {
  const { appointment, client, service, tenant } = details
  const appointmentDate = format(new Date(appointment.start_time), "dd/MM/yyyy", { locale: ptBR })
  const appointmentTime = format(new Date(appointment.start_time), 'HH:mm')
  const bookingLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/b/${tenant.slug}`

  return `❌ *Agendamento Cancelado*

Olá ${client.name},

Seu agendamento foi cancelado:

📋 *Serviço:* ${service.name}
📅 *Data:* ${appointmentDate}
⏰ *Horário:* ${appointmentTime}

${appointment.cancellation_reason ? `*Motivo:* ${appointment.cancellation_reason}` : ''}

🔗 *Reagendar:*
${bookingLink}

_${tenant.name}_`
}

// Main notification functions
export async function sendConfirmationWhatsApp(details: AppointmentDetails): Promise<boolean> {
  const { client, tenant } = details
  const message = await getConfirmationWhatsAppMessage(details)
  const instanceName = (tenant as any).whatsapp_instance
  return sendWhatsAppMessage(client.phone, message, instanceName)
}

export async function sendReminderWhatsApp(details: AppointmentDetails, hoursBeforeText: string): Promise<boolean> {
  const { client, tenant } = details
  const message = await getReminderWhatsAppMessage(details, hoursBeforeText)
  const instanceName = (tenant as any).whatsapp_instance
  return sendWhatsAppMessage(client.phone, message, instanceName)
}

export async function sendCancellationWhatsApp(details: AppointmentDetails): Promise<boolean> {
  const { client, tenant } = details
  const message = getCancellationWhatsAppMessage(details)
  const instanceName = (tenant as any).whatsapp_instance
  return sendWhatsAppMessage(client.phone, message, instanceName)
}

// Admin notification
export async function sendAdminNewAppointmentNotification(
  adminPhone: string,
  details: AppointmentDetails
): Promise<boolean> {
  const { appointment, client, employee, service, tenant } = details
  const appointmentDate = format(new Date(appointment.start_time), "dd/MM/yyyy", { locale: ptBR })
  const appointmentTime = format(new Date(appointment.start_time), 'HH:mm')

  const message = `🔔 *Novo Agendamento*

📋 *Serviço:* ${service.name}
👤 *Cliente:* ${client.name}
📱 *Telefone:* ${formatPhone(client.phone)}
👨‍💼 *Profissional:* ${employee.name}
📅 *Data:* ${appointmentDate}
⏰ *Horário:* ${appointmentTime}
💰 *Valor:* ${formatCurrency(service.price)}

_${tenant.name}_`

  const instanceName = (tenant as any).whatsapp_instance
  return sendWhatsAppMessage(adminPhone, message, instanceName)
}
