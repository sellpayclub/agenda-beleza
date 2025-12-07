import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatCurrency, formatPhone } from '@/lib/utils/format'
import type { Appointment, Client, Employee, Service, Tenant } from '@/types'

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

// WhatsApp message templates
function getConfirmationWhatsAppMessage(details: AppointmentDetails): string {
  const { appointment, client, employee, service, tenant } = details
  const appointmentDate = format(new Date(appointment.start_time), "EEEE, dd 'de' MMMM", { locale: ptBR })
  const appointmentTime = format(new Date(appointment.start_time), 'HH:mm')
  const manageLink = getManageLink(tenant, appointment.id)

  return `✅ *Agendamento Confirmado*

Olá ${client.name}!

Seu agendamento foi confirmado:

📋 *Serviço:* ${service.name}
👤 *Profissional:* ${employee.name}
📅 *Data:* ${appointmentDate}
⏰ *Horário:* ${appointmentTime}
💰 *Valor:* ${formatCurrency(service.price)}

${tenant.address ? `📍 *Endereço:* ${tenant.address}` : ''}

🔗 *Reagendar ou cancelar:*
${manageLink}

Qualquer dúvida, entre em contato!

_${tenant.name}_`
}

function getReminderWhatsAppMessage(details: AppointmentDetails, hoursBeforeText: string): string {
  const { appointment, client, employee, service, tenant } = details
  const appointmentTime = format(new Date(appointment.start_time), 'HH:mm')
  const manageLink = getManageLink(tenant, appointment.id)

  return `⏰ *Lembrete de Agendamento*

Olá ${client.name}!

Seu agendamento é *${hoursBeforeText}* às *${appointmentTime}*.

📋 *Serviço:* ${service.name}
👤 *Profissional:* ${employee.name}

${tenant.address ? `📍 *Endereço:* ${tenant.address}` : ''}

🔗 *Precisa reagendar ou cancelar?*
${manageLink}

Estamos esperando você! 😊

_${tenant.name}_`
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

function getPendingAppointmentWhatsAppMessage(details: AppointmentDetails): string {
  const { appointment, client, employee, service, tenant } = details
  const appointmentDate = format(new Date(appointment.start_time), "EEEE, dd 'de' MMMM", { locale: ptBR })
  const appointmentTime = format(new Date(appointment.start_time), 'HH:mm')
  const manageLink = getManageLink(tenant, appointment.id)

  return `📅 *Agendamento Recebido*

Olá ${client.name}!

Recebemos seu pedido de agendamento:

📋 *Serviço:* ${service.name}
👤 *Profissional:* ${employee.name}
📅 *Data:* ${appointmentDate}
⏰ *Horário:* ${appointmentTime}
💰 *Valor:* ${formatCurrency(service.price)}

⏳ *Aguardando confirmação do estabelecimento*

🔗 *Acompanhar ou cancelar:*
${manageLink}

_${tenant.name}_`
}

// Main notification functions
export async function sendConfirmationWhatsApp(details: AppointmentDetails): Promise<boolean> {
  const { client, tenant } = details
  const message = getConfirmationWhatsAppMessage(details)
  const instanceName = (tenant as any).whatsapp_instance
  return sendWhatsAppMessage(client.phone, message, instanceName)
}

export async function sendReminderWhatsApp(details: AppointmentDetails, hoursBeforeText: string): Promise<boolean> {
  const { client, tenant } = details
  const message = getReminderWhatsAppMessage(details, hoursBeforeText)
  const instanceName = (tenant as any).whatsapp_instance
  return sendWhatsAppMessage(client.phone, message, instanceName)
}

export async function sendCancellationWhatsApp(details: AppointmentDetails): Promise<boolean> {
  const { client, tenant } = details
  const message = getCancellationWhatsAppMessage(details)
  const instanceName = (tenant as any).whatsapp_instance
  return sendWhatsAppMessage(client.phone, message, instanceName)
}

export async function sendPendingAppointmentWhatsApp(details: AppointmentDetails): Promise<boolean> {
  const { client, tenant } = details
  const message = getPendingAppointmentWhatsAppMessage(details)
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
