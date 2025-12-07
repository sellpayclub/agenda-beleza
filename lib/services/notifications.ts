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
  // Validate phone number
  if (!phone || phone.trim() === '') {
    console.error('❌ Cannot send WhatsApp: Phone number is empty')
    return false
  }

  // Validate message
  if (!message || message.trim() === '') {
    console.error('❌ Cannot send WhatsApp: Message is empty')
    return false
  }

  const evolutionUrl = process.env.EVOLUTION_API_URL
  const evolutionKey = process.env.EVOLUTION_API_KEY
  const instance = instanceName || process.env.EVOLUTION_INSTANCE_NAME

  if (!evolutionUrl || !evolutionKey || !instance) {
    console.error('❌ Evolution API not configured:', {
      hasUrl: !!evolutionUrl,
      hasKey: !!evolutionKey,
      hasInstance: !!instance,
      providedInstance: instanceName,
    })
    return false
  }

  try {
    // Format phone number (remove non-digits, add country code if needed)
    let formattedPhone = phone.replace(/\D/g, '')
    
    // Validate formatted phone
    if (formattedPhone.length < 10) {
      console.error(`❌ Invalid phone number format: ${phone} (formatted: ${formattedPhone})`)
      return false
    }

    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone
    }

    // Validate final phone format (should be 55 + 10-11 digits)
    if (formattedPhone.length < 12 || formattedPhone.length > 13) {
      console.error(`❌ Invalid phone number length: ${formattedPhone} (original: ${phone})`)
      return false
    }

    const url = `${evolutionUrl}/message/sendText/${instance}`
    console.log(`📤 Sending WhatsApp to ${formattedPhone} via instance ${instance}`)

    const response = await fetch(url, {
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
      const errorText = await response.text()
      console.error(`❌ Failed to send WhatsApp message (${response.status}):`, errorText)
      return false
    }

    const responseData = await response.json().catch(() => ({}))
    console.log(`✅ WhatsApp message sent successfully to ${formattedPhone}`)
    return true
  } catch (error: any) {
    console.error('❌ Error sending WhatsApp message:', {
      error: error.message,
      stack: error.stack,
      phone: phone.replace(/\D/g, '').substring(0, 4) + '****', // Log parcial por segurança
    })
    return false
  }
}

import { getManageLink as getManageLinkUtil, getBookingLink } from '@/lib/utils/domain'

// Get booking management link
function getManageLink(tenant: Tenant, appointmentId: string): string {
  return getManageLinkUtil(tenant, appointmentId)
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

function getPendingAppointmentWhatsAppMessage(details: AppointmentDetails): string {
  const { appointment, client, employee, service, tenant } = details
  const appointmentDate = format(new Date(appointment.start_time), "EEEE, dd 'de' MMMM", { locale: ptBR })
  const appointmentTime = format(new Date(appointment.start_time), 'HH:mm')
  const manageLink = getManageLink(tenant, appointment.id)

  return `📅 *Agendamento Criado*

Olá ${client.name}!

Seu agendamento foi criado e está *aguardando confirmação*:

📋 *Serviço:* ${service.name}
👤 *Profissional:* ${employee.name}
📅 *Data:* ${appointmentDate}
⏰ *Horário:* ${appointmentTime}
💰 *Valor:* ${formatCurrency(service.price)}

${tenant.address ? `📍 *Endereço:* ${tenant.address}` : ''}

⏳ Você receberá uma confirmação em breve!

🔗 *Quer editar, reagendar ou cancelar?*
${manageLink}

Qualquer dúvida, entre em contato!

_${tenant.name}_`
}

function getReminderWhatsAppMessage(details: AppointmentDetails, hoursBeforeText: string): string {
  const { appointment, client, employee, service, tenant } = details
  const appointmentDate = format(new Date(appointment.start_time), "EEEE, dd 'de' MMMM", { locale: ptBR })
  const appointmentTime = format(new Date(appointment.start_time), 'HH:mm')
  const manageLink = getManageLink(tenant, appointment.id)

  return `⏰ *Lembrete de Agendamento*

Olá ${client.name}! 👋

Passando para lembrar do seu agendamento *${hoursBeforeText}*:

📋 *Serviço:* ${service.name}
👤 *Profissional:* ${employee.name}
📅 *Data:* ${appointmentDate}
⏰ *Horário:* ${appointmentTime}
💰 *Valor:* ${formatCurrency(service.price)}

${tenant.address ? `📍 *Endereço:* ${tenant.address}\n` : ''}
🔗 *Precisa reagendar ou cancelar?*
${manageLink}

Estamos esperando você! 😊

_${tenant.name}_`
}

function getCancellationWhatsAppMessage(details: AppointmentDetails): string {
  const { appointment, client, service, tenant } = details
  const appointmentDate = format(new Date(appointment.start_time), "dd/MM/yyyy", { locale: ptBR })
  const appointmentTime = format(new Date(appointment.start_time), 'HH:mm')
  const bookingLink = getBookingLink(tenant)

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
  const message = getConfirmationWhatsAppMessage(details)
  const instanceName = (tenant as any).whatsapp_instance
  return sendWhatsAppMessage(client.phone, message, instanceName)
}

export async function sendPendingAppointmentWhatsApp(details: AppointmentDetails): Promise<boolean> {
  const { client, tenant } = details
  const message = getPendingAppointmentWhatsAppMessage(details)
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
