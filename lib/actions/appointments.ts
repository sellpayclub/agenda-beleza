'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from './auth'
import { findOrCreateClient } from './clients'
import { addMinutes, startOfDay, endOfDay, startOfMonth, endOfMonth, format } from 'date-fns'
import type { AppointmentInsert, AppointmentUpdate, AppointmentStatus, PaymentStatus } from '@/types'
import { sendConfirmationWhatsApp, sendPendingAppointmentWhatsApp, sendCancellationWhatsApp, sendAdminNewAppointmentNotification } from '@/lib/services/notifications'
import { sendAppointmentToWebhook } from '@/lib/services/webhook-external'

export async function getAppointments(filters?: {
  date?: Date
  status?: AppointmentStatus
  employeeId?: string
}) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return []
  
  const tenantId = (currentUser as any).tenant_id

  const supabase = await createClient() as any
  
  let query = supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      end_time,
      status,
      payment_status,
      notes,
      client:clients (id, name, phone, email),
      employee:employees (id, name, email),
      service:services (id, name, price, duration_minutes)
    `)
    .eq('tenant_id', tenantId)
    .order('start_time', { ascending: true })

  if (filters?.date) {
    query = query
      .gte('start_time', startOfDay(filters.date).toISOString())
      .lte('start_time', endOfDay(filters.date).toISOString())
  }

  if (filters?.status) {
    query = query.eq('status', filters.status)
  }

  if (filters?.employeeId) {
    query = query.eq('employee_id', filters.employeeId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching appointments:', error)
    return []
  }

  return data
}

export async function getTodayAppointments() {
  return getAppointments({ date: new Date() })
}

export async function getAppointment(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id,
      start_time,
      end_time,
      status,
      payment_status,
      notes,
      client:clients (id, name, phone, email),
      employee:employees (id, name, email),
      service:services (id, name, price, duration_minutes)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching appointment:', error)
    return null
  }

  return data
}

export async function createAppointment(data: {
  tenantId: string
  clientData: { name: string; phone: string; email?: string }
  employeeId: string
  serviceId: string
  startTime: Date
  notes?: string
}) {
  const supabase = createAdminClient() as any
  
  // Find or create client
  const client: any = await findOrCreateClient(data.tenantId, data.clientData)
  
  // Get service duration
  const { data: service } = await supabase
    .from('services')
    .select('duration_minutes, price')
    .eq('id', data.serviceId)
    .single()

  if (!service) {
    return { error: 'Serviço não encontrado' }
  }

  const endTime = addMinutes(data.startTime, service.duration_minutes)

  // Check for conflicts
  const { data: conflicts } = await supabase
    .from('appointments')
    .select('id')
    .eq('employee_id', data.employeeId)
    .in('status', ['pending', 'confirmed'])
    .or(`and(start_time.lt.${endTime.toISOString()},end_time.gt.${data.startTime.toISOString()})`)

  if (conflicts && conflicts.length > 0) {
    return { error: 'Horário não disponível' }
  }

  // Get tenant settings
  const { data: settings } = await supabase
    .from('tenant_settings')
    .select('auto_confirm')
    .eq('tenant_id', data.tenantId)
    .single()

  const status = settings?.auto_confirm ? 'confirmed' : 'pending'

  // Create appointment
  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      tenant_id: data.tenantId,
      client_id: client.id,
      employee_id: data.employeeId,
      service_id: data.serviceId,
      start_time: data.startTime.toISOString(),
      end_time: endTime.toISOString(),
      status,
      notes: data.notes,
    })
    .select(`
      *,
      client:clients (*),
      employee:employees (*),
      service:services (*)
    `)
    .single()

  if (error) {
    console.error('Error creating appointment:', error)
    return { error: 'Erro ao criar agendamento' }
  }

  // Get tenant data and settings for notifications
  const [tenantResult, tenantSettingsResult] = await Promise.all([
    supabase
      .from('tenants')
      .select('*')
      .eq('id', data.tenantId)
      .single(),
    supabase
      .from('tenant_settings')
      .select('notification_preferences')
      .eq('tenant_id', data.tenantId)
      .single()
  ])

  const tenant = tenantResult.data
  const tenantSettings = tenantSettingsResult.data

  // Send appointment data to external webhook (for ALL appointments)
  // This MUST run for every appointment created
  if (appointment && appointment.client && appointment.employee && appointment.service && tenant) {
    console.log(`\n🚀 [WEBHOOK] ===== INICIANDO ENVIO PARA WEBHOOK =====`)
    console.log(`📤 [WEBHOOK] Appointment ID: ${appointment.id}`)
    console.log(`📤 [WEBHOOK] Cliente: ${appointment.client?.name} (${appointment.client?.phone})`)
    console.log(`📤 [WEBHOOK] Serviço: ${appointment.service?.name}`)
    console.log(`📤 [WEBHOOK] Funcionário: ${appointment.employee?.name}`)
    console.log(`📤 [WEBHOOK] Tenant: ${tenant?.name}`)
    console.log(`📤 [WEBHOOK] URL: https://webhook.dcsaudeautomacao.com/webhook/agendamentorecebido`)
    console.log(`📤 [WEBHOOK] Status: ${appointment.status}`)
    console.log(`📤 [WEBHOOK] Data: ${appointment.start_time}`)
    
    // Send to webhook (fire and forget - doesn't block response)
    // But we log everything for debugging
    sendAppointmentToWebhook({
      appointment,
      client: appointment.client,
      employee: appointment.employee,
      service: appointment.service,
      tenant,
    })
      .then((success) => {
        if (success) {
          console.log(`✅ [WEBHOOK] ===== ENVIO CONCLUÍDO COM SUCESSO =====`)
          console.log(`✅ [WEBHOOK] Appointment ${appointment.id} enviado com sucesso ao webhook`)
        } else {
          console.error(`❌ [WEBHOOK] ===== FALHA NO ENVIO =====`)
          console.error(`❌ [WEBHOOK] Falha ao enviar appointment ${appointment.id} ao webhook`)
        }
      })
      .catch((err) => {
        console.error(`❌ [WEBHOOK] ===== ERRO NO ENVIO =====`)
        console.error(`❌ [WEBHOOK] Erro ao enviar appointment ${appointment.id} ao webhook:`)
        console.error(`❌ [WEBHOOK] Mensagem: ${err.message}`)
        console.error(`❌ [WEBHOOK] Stack:`, err.stack)
      })
  } else {
    console.error(`\n❌ [WEBHOOK] ===== DADOS INCOMPLETOS - NÃO PODE ENVIAR =====`)
    console.error(`❌ [WEBHOOK] Appointment ID: ${appointment?.id}`)
    console.error(`❌ [WEBHOOK] Dados disponíveis:`, {
      hasAppointment: !!appointment,
      hasClient: !!appointment?.client,
      hasEmployee: !!appointment?.employee,
      hasService: !!appointment?.service,
      hasTenant: !!tenant,
      clientName: appointment?.client?.name,
      employeeName: appointment?.employee?.name,
      serviceName: appointment?.service?.name,
      tenantName: tenant?.name,
    })
  }

  // Send WhatsApp notification to client (always when enabled)
  if (tenant && appointment.client && appointment.employee && appointment.service) {
    // Validate required data for notifications
    if (!appointment.client.phone || appointment.client.phone.trim() === '') {
      console.warn(`⚠️ Cannot send notification: Client ${appointment.client.id} has no phone number`)
    } else if (!tenant.whatsapp_instance) {
      console.warn(`⚠️ Cannot send notification: Tenant ${tenant.id} has no WhatsApp instance configured`)
    } else {
      const notificationDetails = {
        appointment,
        client: appointment.client,
        employee: appointment.employee,
        service: appointment.service,
        tenant,
      }

      // Check notification preferences
      const preferences = tenantSettings?.notification_preferences as any
      const whatsappConfirmation = preferences?.whatsappConfirmation !== false // Default to true if not set

      if (whatsappConfirmation) {
        // Send appropriate message based on status
        if (status === 'confirmed') {
          // Send confirmation message
          console.log(`📤 Sending confirmation WhatsApp to ${appointment.client.phone} for appointment ${appointment.id}`)
          sendConfirmationWhatsApp(notificationDetails)
            .then((success) => {
              if (success) {
                console.log(`✅ Confirmation WhatsApp sent successfully for appointment ${appointment.id}`)
              } else {
                console.error(`❌ Failed to send confirmation WhatsApp for appointment ${appointment.id}`)
              }
            })
            .catch(err => {
              console.error(`❌ Error sending WhatsApp confirmation for appointment ${appointment.id}:`, err)
            })
        } else {
          // Send pending appointment message
          console.log(`📤 Sending pending appointment WhatsApp to ${appointment.client.phone} for appointment ${appointment.id}`)
          sendPendingAppointmentWhatsApp(notificationDetails)
            .then((success) => {
              if (success) {
                console.log(`✅ Pending appointment WhatsApp sent successfully for appointment ${appointment.id}`)
              } else {
                console.error(`❌ Failed to send pending appointment WhatsApp for appointment ${appointment.id}`)
              }
            })
            .catch(err => {
              console.error(`❌ Error sending WhatsApp pending notification for appointment ${appointment.id}:`, err)
            })
        }
      } else {
        console.log(`⏭️ WhatsApp confirmation disabled for tenant ${tenant.id}`)
      }

      // Send notification to admin (tenant phone)
      if (tenant.phone) {
        console.log(`📤 Sending admin notification to ${tenant.phone} for new appointment ${appointment.id}`)
        sendAdminNewAppointmentNotification(tenant.phone, notificationDetails)
          .then((success) => {
            if (success) {
              console.log(`✅ Admin notification sent successfully for appointment ${appointment.id}`)
            } else {
              console.error(`❌ Failed to send admin notification for appointment ${appointment.id}`)
            }
          })
          .catch(err => {
            console.error(`❌ Error sending admin notification for appointment ${appointment.id}:`, err)
          })
      }

    }
  } else {
    console.warn(`⚠️ Cannot send notification: Missing required data for appointment ${appointment.id}`, {
      hasTenant: !!tenant,
      hasClient: !!appointment.client,
      hasEmployee: !!appointment.employee,
      hasService: !!appointment.service,
    })
  }

  // Revalidate all affected paths
  revalidatePath('/dashboard/agendamentos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/financeiro')
  revalidatePath('/dashboard/analytics')
  
  return { data: appointment }
}

export async function updateAppointmentStatus(id: string, status: AppointmentStatus, cancellationReason?: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  // Use admin client to bypass RLS and ensure update works
  const supabase = createAdminClient() as any
  
  // Validate input
  if (!id || !status) {
    return { error: 'Dados inválidos' }
  }

  // Get full appointment data before update for notification
  const { data: fullAppointment } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients (*),
      employee:employees (*),
      service:services (*),
      tenant:tenants (*)
    `)
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)
    .single()

  if (!fullAppointment) {
    console.error('Appointment not found:', id)
    return { error: 'Agendamento não encontrado' }
  }

  const updateData: AppointmentUpdate = { 
    status,
    updated_at: new Date().toISOString()
  }
  if (cancellationReason) {
    updateData.cancellation_reason = cancellationReason
  }

  console.log(`Updating appointment ${id} status to ${status}`)

  const { data: appointment, error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)
    .select()
    .single()

  if (error) {
    console.error('Error updating appointment status:', error)
    return { error: 'Erro ao atualizar status' }
  }

  if (!appointment) {
    console.error('Appointment update returned no data:', id)
    return { error: 'Registro não encontrado ou não foi atualizado' }
  }

  console.log(`Appointment ${id} status updated successfully to ${status}`)

  // Prepare notification details
  const notificationDetails = {
    appointment: { ...fullAppointment, ...updateData },
    client: fullAppointment.client,
    employee: fullAppointment.employee,
    service: fullAppointment.service,
    tenant: fullAppointment.tenant,
  }

  // Send confirmation WhatsApp if status changed to confirmed
  if (status === 'confirmed' && fullAppointment.status !== 'confirmed') {
    console.log(`📤 Status changed to confirmed for appointment ${id}, sending confirmation notification`)
    
    // Validate required data
    if (!fullAppointment.client || !fullAppointment.client.phone || fullAppointment.client.phone.trim() === '') {
      console.warn(`⚠️ Cannot send confirmation: Client ${fullAppointment.client_id} has no phone number`)
    } else if (!fullAppointment.tenant || !fullAppointment.tenant.whatsapp_instance) {
      console.warn(`⚠️ Cannot send confirmation: Tenant ${user.tenant_id} has no WhatsApp instance configured`)
    } else if (!fullAppointment.employee || !fullAppointment.service) {
      console.warn(`⚠️ Cannot send confirmation: Missing employee or service data for appointment ${id}`)
    } else {
      // Check tenant notification preferences
      const { data: tenantSettings } = await supabase
        .from('tenant_settings')
        .select('notification_preferences')
        .eq('tenant_id', user.tenant_id)
        .single()

      const preferences = tenantSettings?.notification_preferences as any
      const whatsappConfirmation = preferences?.whatsappConfirmation !== false // Default to true if not set

      if (whatsappConfirmation) {
        sendConfirmationWhatsApp(notificationDetails)
          .then((success) => {
            if (success) {
              console.log(`✅ Confirmation WhatsApp sent successfully for appointment ${id}`)
            } else {
              console.error(`❌ Failed to send confirmation WhatsApp for appointment ${id}`)
            }
          })
          .catch(err => {
            console.error(`❌ Error sending confirmation WhatsApp for appointment ${id}:`, err)
          })
      } else {
        console.log(`⏭️ WhatsApp confirmation disabled for tenant ${user.tenant_id}`)
      }
    }
  }

  // Send cancellation WhatsApp if status is cancelled
  if (status === 'cancelled' && fullAppointment.status !== 'cancelled') {
    console.log(`📤 Status changed to cancelled for appointment ${id}, sending cancellation notification`)
    
    // Validate required data
    if (!fullAppointment.client || !fullAppointment.client.phone || fullAppointment.client.phone.trim() === '') {
      console.warn(`⚠️ Cannot send cancellation: Client ${fullAppointment.client_id} has no phone number`)
    } else if (!fullAppointment.tenant || !fullAppointment.tenant.whatsapp_instance) {
      console.warn(`⚠️ Cannot send cancellation: Tenant ${user.tenant_id} has no WhatsApp instance configured`)
    } else if (!fullAppointment.service) {
      console.warn(`⚠️ Cannot send cancellation: Missing service data for appointment ${id}`)
    } else {
      sendCancellationWhatsApp(notificationDetails)
        .then((success) => {
          if (success) {
            console.log(`✅ Cancellation WhatsApp sent successfully for appointment ${id}`)
          } else {
            console.error(`❌ Failed to send cancellation WhatsApp for appointment ${id}`)
          }
        })
        .catch(err => {
          console.error(`❌ Error sending cancellation WhatsApp for appointment ${id}:`, err)
        })
    }
  }

  // Aggressive cache invalidation
  revalidatePath('/dashboard/agendamentos')
  revalidatePath('/dashboard')
  
  // If status changed to completed, also revalidate financeiro and analytics
  if (status === 'completed') {
    revalidatePath('/dashboard/financeiro')
    revalidatePath('/dashboard/analytics')
  }
  
  return { data: appointment }
}

export async function updatePaymentStatus(id: string, paymentStatus: PaymentStatus, paymentMethod?: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  // Use admin client to bypass RLS and ensure update works
  const supabase = createAdminClient() as any
  
  // Validate input
  if (!id || !paymentStatus) {
    return { error: 'Dados inválidos' }
  }

  // Verify appointment exists and belongs to tenant
  const { data: existing } = await supabase
    .from('appointments')
    .select('id')
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)
    .single()

  if (!existing) {
    console.error('Appointment not found for payment update:', id)
    return { error: 'Agendamento não encontrado' }
  }

  const updateData: AppointmentUpdate = { 
    payment_status: paymentStatus,
    updated_at: new Date().toISOString()
  }
  if (paymentMethod) {
    updateData.payment_method = paymentMethod
  }

  console.log(`Updating appointment ${id} payment status to ${paymentStatus}`)

  const { data: appointment, error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)
    .select()
    .single()

  if (error) {
    console.error('Error updating payment status:', error)
    return { error: 'Erro ao atualizar status de pagamento' }
  }

  if (!appointment) {
    console.error('Payment status update returned no data:', id)
    return { error: 'Registro não encontrado ou não foi atualizado' }
  }

  console.log(`Appointment ${id} payment status updated successfully to ${paymentStatus}`)

  // Aggressive cache invalidation
  revalidatePath('/dashboard/agendamentos')
  revalidatePath('/dashboard/financeiro')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/analytics')
  
  return { data: appointment }
}

export async function rescheduleAppointment(id: string, newStartTime: Date) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  const supabase = await createClient() as any
  
  // Get current appointment
  const { data: currentAppointment } = await supabase
    .from('appointments')
    .select('*, service:services(duration_minutes)')
    .eq('id', id)
    .single()

  if (!currentAppointment) {
    return { error: 'Agendamento não encontrado' }
  }

  const duration = currentAppointment.service?.duration_minutes || 30
  const newEndTime = addMinutes(newStartTime, duration)

  // Check for conflicts
  const { data: conflicts } = await supabase
    .from('appointments')
    .select('id')
    .eq('employee_id', currentAppointment.employee_id)
    .neq('id', id)
    .in('status', ['pending', 'confirmed'])
    .or(`and(start_time.lt.${newEndTime.toISOString()},end_time.gt.${newStartTime.toISOString()})`)

  if (conflicts && conflicts.length > 0) {
    return { error: 'Novo horário não disponível' }
  }

  const { data: appointment, error } = await supabase
    .from('appointments')
    .update({
      start_time: newStartTime.toISOString(),
      end_time: newEndTime.toISOString(),
    })
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)
    .select()
    .single()

  if (error) {
    console.error('Error rescheduling appointment:', error)
    return { error: 'Erro ao reagendar' }
  }

  revalidatePath('/dashboard/agendamentos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/analytics')
  
  return { data: appointment }
}

export async function deleteAppointment(id: string) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return { error: 'Não autorizado' }
  const user = currentUser as any

  const supabase = await createClient() as any
  
  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)
    .eq('tenant_id', user.tenant_id)

  if (error) {
    console.error('Error deleting appointment:', error)
    return { error: 'Erro ao excluir agendamento' }
  }

  revalidatePath('/dashboard/agendamentos')
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/financeiro')
  revalidatePath('/dashboard/analytics')
  
  return { success: true }
}

export async function getMonthlyAppointments(year: number, month: number) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return []
  const user = currentUser as any

  const supabase = await createClient() as any
  
  const startDate = startOfMonth(new Date(year, month - 1))
  const endDate = endOfMonth(new Date(year, month - 1))

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients (*),
      employee:employees (*),
      service:services (*)
    `)
    .eq('tenant_id', user.tenant_id)
    .gte('start_time', startDate.toISOString())
    .lte('start_time', endDate.toISOString())
    .order('start_time', { ascending: false })

  if (error) {
    console.error('Error fetching monthly appointments:', error)
    return []
  }

  return data || []
}

export async function getUpcomingAppointments(limit = 5) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return []
  const user = currentUser as any

  const supabase = await createClient() as any
  
  const now = new Date()

  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients (*),
      employee:employees (*),
      service:services (*)
    `)
    .eq('tenant_id', user.tenant_id)
    .gte('start_time', now.toISOString())
    .in('status', ['pending', 'confirmed'])
    .order('start_time')
    .limit(limit)

  if (error) {
    console.error('Error fetching upcoming appointments:', error)
    return []
  }

  return data
}

