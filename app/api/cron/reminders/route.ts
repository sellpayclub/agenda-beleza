import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendReminderWhatsApp } from '@/lib/services/notifications'
import { addHours, isAfter } from 'date-fns'

// This endpoint should be called by a cron job every hour
// For Vercel, you can use Vercel Cron or an external service like cron-job.org
// URL: /api/cron/reminders
// Method: GET
// Header: Authorization: Bearer YOUR_CRON_SECRET
// Query param: ?test=true (to test without sending notifications)

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const { searchParams } = new URL(request.url)
  const isTestMode = searchParams.get('test') === 'true'

  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error('❌ Unauthorized cron request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient() as any
    const now = new Date()

    console.log('🚀 Starting reminder processing...', {
      timestamp: now.toISOString(),
      testMode: isTestMode,
    })

    // Improved logic: More precise time windows
    // 24 hours reminder: appointments between 23.5-24.5 hours from now (1 hour window)
    const reminder24hStart = addHours(now, 23.5)
    const reminder24hEnd = addHours(now, 24.5)

    // 1 hour reminder: appointments between 0.75-1.25 hours from now (30 min window)
    const reminder1hStart = addHours(now, 0.75)
    const reminder1hEnd = addHours(now, 1.25)

    console.log('📅 Time windows:', {
      '24h': {
        start: reminder24hStart.toISOString(),
        end: reminder24hEnd.toISOString(),
      },
      '1h': {
        start: reminder1hStart.toISOString(),
        end: reminder1hEnd.toISOString(),
      },
    })

    // Fetch appointments needing 24h reminder
    const result24h = await supabase
      .from('appointments')
      .select(`
        *,
        client:clients(*),
        employee:employees(*),
        service:services(*),
        tenant:tenants(*)
      `)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', reminder24hStart.toISOString())
      .lte('start_time', reminder24hEnd.toISOString())
      .order('start_time', { ascending: true })

    if (result24h.error) {
      console.error('❌ Error fetching 24h appointments:', result24h.error)
      throw result24h.error
    }

    const appointments24h = result24h.data || []
    console.log(`📋 Found ${appointments24h.length} appointments for 24h reminder`)

    // Fetch appointments needing 1h reminder
    const result1h = await supabase
      .from('appointments')
      .select(`
        *,
        client:clients(*),
        employee:employees(*),
        service:services(*),
        tenant:tenants(*)
      `)
      .in('status', ['pending', 'confirmed'])
      .gte('start_time', reminder1hStart.toISOString())
      .lte('start_time', reminder1hEnd.toISOString())
      .order('start_time', { ascending: true })

    if (result1h.error) {
      console.error('❌ Error fetching 1h appointments:', result1h.error)
      throw result1h.error
    }

    const appointments1h = result1h.data || []
    console.log(`📋 Found ${appointments1h.length} appointments for 1h reminder`)

    let sent24h = 0
    let failed24h = 0
    let skipped24h = 0
    let sent1h = 0
    let failed1h = 0
    let skipped1h = 0

    // Helper function to validate appointment data
    function validateAppointment(apt: any, type: '24h' | '1h'): { valid: boolean; reason?: string } {
      // Check if appointment is in the future
      const appointmentTime = new Date(apt.start_time)
      if (!isAfter(appointmentTime, now)) {
        return { valid: false, reason: 'Appointment is in the past' }
      }

      // Validate client
      if (!apt.client) {
        return { valid: false, reason: 'Missing client data' }
      }

      if (!apt.client.phone || apt.client.phone.trim() === '') {
        return { valid: false, reason: 'Client has no phone number' }
      }

      // Validate employee
      if (!apt.employee) {
        return { valid: false, reason: 'Missing employee data' }
      }

      // Validate service
      if (!apt.service) {
        return { valid: false, reason: 'Missing service data' }
      }

      // Validate tenant
      if (!apt.tenant) {
        return { valid: false, reason: 'Missing tenant data' }
      }

      // Validate WhatsApp instance
      if (!apt.tenant.whatsapp_instance) {
        return { valid: false, reason: 'Tenant has no WhatsApp instance configured' }
      }

      return { valid: true }
    }

    // Helper function to check if reminder already sent
    async function checkReminderSent(appointmentId: string, type: '24h' | '1h'): Promise<boolean> {
      try {
        const { data } = await supabase
          .from('notifications')
          .select('id')
          .eq('appointment_id', appointmentId)
          .eq('type', 'whatsapp')
          .eq('status', 'sent')
          .ilike('message', `%${type}%`)
          .maybeSingle()

        return !!data
      } catch (error) {
        console.error(`Error checking reminder sent for ${appointmentId}:`, error)
        return false
      }
    }

    // Helper function to send reminder
    async function sendReminder(
      apt: any,
      type: '24h' | '1h',
      hoursText: string
    ): Promise<{ success: boolean; error?: string }> {
      const appointmentId = apt.id
      const clientPhone = apt.client.phone

      try {
        console.log(`📤 Sending ${type} reminder for appointment ${appointmentId} to ${clientPhone}`)

        if (isTestMode) {
          console.log(`🧪 TEST MODE: Would send ${type} reminder to ${clientPhone}`)
          return { success: true }
        }

        const details = {
          appointment: apt,
          client: apt.client,
          employee: apt.employee,
          service: apt.service,
          tenant: apt.tenant,
        }

        const success = await sendReminderWhatsApp(details, hoursText)

        if (success) {
          // Log successful notification
          await supabase.from('notifications').insert({
            appointment_id: appointmentId,
            type: 'whatsapp',
            status: 'sent',
            message: `Lembrete ${type}`,
            sent_at: new Date().toISOString(),
          })

          console.log(`✅ ${type} reminder sent successfully for appointment ${appointmentId}`)
          return { success: true }
        } else {
          throw new Error('sendReminderWhatsApp returned false')
        }
      } catch (error: any) {
        const errorMessage = error.message || 'Unknown error'
        console.error(`❌ Error sending ${type} reminder for appointment ${appointmentId}:`, errorMessage)

        // Log failed notification
        try {
          await supabase.from('notifications').insert({
            appointment_id: appointmentId,
            type: 'whatsapp',
            status: 'failed',
            message: `Lembrete ${type} - Error: ${errorMessage}`,
            sent_at: null,
          })
        } catch (logError) {
          console.error('Failed to log notification error:', logError)
        }

        return { success: false, error: errorMessage }
      }
    }

    // Process 24h reminders
    console.log('\n📨 Processing 24h reminders...')
    for (const apt of appointments24h) {
      // Validate appointment
      const validation = validateAppointment(apt, '24h')
      if (!validation.valid) {
        console.warn(`⚠️ Skipping appointment ${apt.id}: ${validation.reason}`)
        skipped24h++
        continue
      }

      // Check if reminder already sent
      const alreadySent = await checkReminderSent(apt.id, '24h')
      if (alreadySent) {
        console.log(`⏭️ Reminder 24h already sent for appointment ${apt.id}`)
        skipped24h++
        continue
      }

      // Check tenant notification preferences
      const { data: tenantSettings } = await supabase
        .from('tenant_settings')
        .select('notification_preferences')
        .eq('tenant_id', apt.tenant_id)
        .single()

      const preferences = tenantSettings?.notification_preferences as any
      const whatsappReminder24h = preferences?.whatsappReminder24h !== false // Default to true if not set

      if (!whatsappReminder24h) {
        console.log(`⏭️ WhatsApp reminder 24h disabled for tenant ${apt.tenant_id}`)
        skipped24h++
        continue
      }

      // Send reminder
      const result = await sendReminder(apt, '24h', 'amanhã')
      if (result.success) {
        sent24h++
      } else {
        failed24h++
      }
    }

    // Process 1h reminders
    console.log('\n📨 Processing 1h reminders...')
    for (const apt of appointments1h) {
      // Validate appointment
      const validation = validateAppointment(apt, '1h')
      if (!validation.valid) {
        console.warn(`⚠️ Skipping appointment ${apt.id}: ${validation.reason}`)
        skipped1h++
        continue
      }

      // Check if reminder already sent
      const alreadySent = await checkReminderSent(apt.id, '1h')
      if (alreadySent) {
        console.log(`⏭️ Reminder 1h already sent for appointment ${apt.id}`)
        skipped1h++
        continue
      }

      // Check tenant notification preferences
      const { data: tenantSettings } = await supabase
        .from('tenant_settings')
        .select('notification_preferences')
        .eq('tenant_id', apt.tenant_id)
        .single()

      const preferences = tenantSettings?.notification_preferences as any
      const whatsappReminder1h = preferences?.whatsappReminder1h !== false // Default to true if not set

      if (!whatsappReminder1h) {
        console.log(`⏭️ WhatsApp reminder 1h disabled for tenant ${apt.tenant_id}`)
        skipped1h++
        continue
      }

      // Send reminder
      const result = await sendReminder(apt, '1h', 'em 1 hora')
      if (result.success) {
        sent1h++
      } else {
        failed1h++
      }
    }

    const duration = Date.now() - startTime
    const summary = {
      success: true,
      testMode: isTestMode,
      duration: `${duration}ms`,
      reminders: {
        '24h': {
          found: appointments24h.length,
          sent: sent24h,
          failed: failed24h,
          skipped: skipped24h,
        },
        '1h': {
          found: appointments1h.length,
          sent: sent1h,
          failed: failed1h,
          skipped: skipped1h,
        },
      },
    }

    console.log('\n✅ Reminder processing completed:', summary)

    return NextResponse.json(summary)
  } catch (error: any) {
    const duration = Date.now() - startTime
    console.error('❌ Cron reminder error:', error)
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      duration: `${duration}ms`,
    })

    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process reminders',
        duration: `${duration}ms`,
      },
      { status: 500 }
    )
  }
}
