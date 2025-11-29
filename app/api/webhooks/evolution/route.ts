import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Evolution API webhook payload
    console.log('Evolution webhook received:', JSON.stringify(body, null, 2))

    // Handle different event types
    const eventType = body.event || body.type

    switch (eventType) {
      case 'messages.upsert':
        // Handle incoming messages
        const message = body.data?.message || body.message
        if (message) {
          // Could implement auto-reply or confirmation logic here
          console.log('Received message:', message)
        }
        break

      case 'connection.update':
        // Handle connection status updates
        console.log('Connection update:', body.data || body)
        break

      case 'qrcode.updated':
        // Handle QR code updates for initial connection
        console.log('QR Code updated')
        break

      default:
        console.log('Unknown event type:', eventType)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Evolution webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Handle GET for webhook verification
export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'Evolution API webhook is active' })
}

