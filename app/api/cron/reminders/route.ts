import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendReminderWhatsApp } from '@/lib/services/notifications'
import { subHours, addMinutes, differenceInMinutes } from 'date-fns'

// This endpoint should be called by a cron job every 5 minutes for precise timing
// For Vercel, you can use Vercel Cron or an external service like cron-job.org
// URL: /api/cron/reminders
// Method: GET
// Header: Authorization: Bearer YOUR_CRON_SECRET
// Schedule: */5 * * * * (every 5 minutes)

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient() as any
    const now = new Date()

    // Calculate exact times for reminders
    // 24 hours before appointment: appointments that are 23h 55min to 24h 5min from now
    const reminder24hStart = addMinutes(subHours(now, 24), -5)
    const reminder24hEnd = addMinutes(subHours(now, 24), 5)

    // 1 hour before appointment: appointments that are 55min to 1h 5min from now
    const reminder1hStart = addMinutes(subHours(now, 1), -5)
    const reminder1hEnd = addMinutes(subHours(now, 1), 5)

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

    const appointments24h = result24h.data || []

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

    const appointments1h = result1h.data || []

    let sent24h = 0
    let sent1h = 0

    // Send 24h reminders
    for (const apt of appointments24h) {
      // Verify all required data exists
      if (!apt.client || !apt.client.phone || !apt.employee || !apt.service || !apt.tenant || !apt.tenant.whatsapp_instance) {
        console.warn(`⚠️ Skipping appointment ${apt.id}: missing required data`)
        continue
      }

      // Check if 24h reminder already sent for this appointment
      const existingResult = await supabase
        .from('notifications')
        .select('id')
        .eq('appointment_id', apt.id)
        .eq('type', 'whatsapp')
        .ilike('message', '%Lembrete 24h%')
        .maybeSingle()

      if (existingResult.data) {
        console.log(`⏭️ Reminder 24h already sent for appointment ${apt.id}`)
        continue
      }

      const details = {
        appointment: apt,
        client: apt.client,
        employee: apt.employee,
        service: apt.service,
        tenant: apt.tenant,
      }

      // Send WhatsApp reminder
      console.log(`📤 Sending 24h reminder for appointment ${apt.id}`)
      const success = await sendReminderWhatsApp(details, 'amanhã')
      if (success) {
        // Log notification
        await supabase.from('notifications').insert({
          appointment_id: apt.id,
          type: 'whatsapp',
          status: 'sent',
          message: 'Lembrete 24h antes',
          sent_at: new Date().toISOString(),
        })
        sent24h++
        console.log(`✅ 24h reminder sent successfully for appointment ${apt.id}`)
      } else {
        console.error(`❌ Failed to send 24h reminder for appointment ${apt.id}`)
      }
    }

    // Send 1h reminders
    for (const apt of appointments1h) {
      // Verify all required data exists
      if (!apt.client || !apt.client.phone || !apt.employee || !apt.service || !apt.tenant || !apt.tenant.whatsapp_instance) {
        console.warn(`⚠️ Skipping appointment ${apt.id}: missing required data`)
        continue
      }

      // Check if 1h reminder already sent for this appointment
      const existingResult = await supabase
        .from('notifications')
        .select('id')
        .eq('appointment_id', apt.id)
        .eq('type', 'whatsapp')
        .ilike('message', '%Lembrete 1h%')
        .maybeSingle()

      if (existingResult.data) {
        console.log(`⏭️ Reminder 1h already sent for appointment ${apt.id}`)
        continue
      }

      const details = {
        appointment: apt,
        client: apt.client,
        employee: apt.employee,
        service: apt.service,
        tenant: apt.tenant,
      }

      // Send WhatsApp reminder
      console.log(`📤 Sending 1h reminder for appointment ${apt.id}`)
      const success = await sendReminderWhatsApp(details, 'em 1 hora')
      if (success) {
        await supabase.from('notifications').insert({
          appointment_id: apt.id,
          type: 'whatsapp',
          status: 'sent',
          message: 'Lembrete 1h antes',
          sent_at: new Date().toISOString(),
        })
        sent1h++
        console.log(`✅ 1h reminder sent successfully for appointment ${apt.id}`)
      } else {
        console.error(`❌ Failed to send 1h reminder for appointment ${apt.id}`)
      }
    }

    return NextResponse.json({
      success: true,
      reminders: {
        '24h': sent24h,
        '1h': sent1h,
      },
    })
  } catch (error) {
    console.error('Cron reminder error:', error)
    return NextResponse.json(
      { error: 'Failed to process reminders' },
      { status: 500 }
    )
  }
}
