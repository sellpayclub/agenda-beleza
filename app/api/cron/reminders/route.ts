import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendReminderWhatsApp } from '@/lib/services/notifications'
import { addHours } from 'date-fns'

// This endpoint should be called by a cron job every hour
// For Vercel, you can use Vercel Cron or an external service like cron-job.org
// URL: /api/cron/reminders
// Method: GET
// Header: Authorization: Bearer YOUR_CRON_SECRET

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

    // Get appointments for reminders
    // 24 hours reminder: appointments between 23-25 hours from now
    const reminder24hStart = addHours(now, 23)
    const reminder24hEnd = addHours(now, 25)

    // 1 hour reminder: appointments between 0.5-1.5 hours from now
    const reminder1hStart = addHours(now, 0.5)
    const reminder1hEnd = addHours(now, 1.5)

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
      // Check if reminder already sent
      const existingResult = await supabase
        .from('notifications')
        .select('id')
        .eq('appointment_id', apt.id)
        .eq('type', 'whatsapp')
        .ilike('message', '%24%')
        .maybeSingle()

      if (existingResult.data) continue

      // Check tenant notification preferences
      const { data: tenantSettings } = await supabase
        .from('tenant_settings')
        .select('notification_preferences')
        .eq('tenant_id', apt.tenant_id)
        .single()

      const preferences = tenantSettings?.notification_preferences as any
      const whatsappReminder24h = preferences?.whatsappReminder24h !== false // Default to true if not set

      if (!whatsappReminder24h) continue

      const details = {
        appointment: apt,
        client: apt.client,
        employee: apt.employee,
        service: apt.service,
        tenant: apt.tenant,
      }

      // Send WhatsApp reminder
      const success = await sendReminderWhatsApp(details, 'amanhã')
      if (success) {
        // Log notification
        await supabase.from('notifications').insert({
          appointment_id: apt.id,
          type: 'whatsapp',
          status: 'sent',
          message: 'Lembrete 24h',
          sent_at: new Date().toISOString(),
        })
        sent24h++
      }
    }

    // Send 1h reminders
    for (const apt of appointments1h) {
      // Check if reminder already sent
      const existingResult = await supabase
        .from('notifications')
        .select('id')
        .eq('appointment_id', apt.id)
        .eq('type', 'whatsapp')
        .ilike('message', '%1h%')
        .maybeSingle()

      if (existingResult.data) continue

      // Check tenant notification preferences
      const { data: tenantSettings } = await supabase
        .from('tenant_settings')
        .select('notification_preferences')
        .eq('tenant_id', apt.tenant_id)
        .single()

      const preferences = tenantSettings?.notification_preferences as any
      const whatsappReminder1h = preferences?.whatsappReminder1h !== false // Default to true if not set

      if (!whatsappReminder1h) continue

      const details = {
        appointment: apt,
        client: apt.client,
        employee: apt.employee,
        service: apt.service,
        tenant: apt.tenant,
      }

      // Send WhatsApp reminder
      const success = await sendReminderWhatsApp(details, 'em 1 hora')
      if (success) {
        await supabase.from('notifications').insert({
          appointment_id: apt.id,
          type: 'whatsapp',
          status: 'sent',
          message: 'Lembrete 1h',
          sent_at: new Date().toISOString(),
        })
        sent1h++
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
