import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/actions/auth'
import {
  createInstance,
  getQRCode,
  getConnectionState,
  fetchInstance,
  logoutInstance,
  deleteInstance,
  restartInstance,
  setWebhook,
  sendTextMessage,
} from '@/lib/services/evolution-api'

// GET - Buscar status da instância
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const tenantId = (user as any).tenant_id
    const instanceName = `tenant_${tenantId.replace(/-/g, '_')}`

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'status'

    switch (action) {
      case 'status':
        const stateResult = await getConnectionState(instanceName)
        console.log('Connection state result:', JSON.stringify(stateResult, null, 2))
        
        if (!stateResult.success) {
          // Se não conseguir buscar status, tentar buscar instância
          const instanceResult = await fetchInstance(instanceName)
          console.log('Instance fetch result:', JSON.stringify(instanceResult, null, 2))
          
          if (!instanceResult.success) {
            return NextResponse.json({ 
              connected: false, 
              exists: false,
              state: 'not_created'
            })
          }
          
          // Verificar diferentes formatos de resposta da Evolution API
          const instances = instanceResult.data
          const instance = Array.isArray(instances) ? instances[0] : instances
          const instanceState = instance?.instance?.state || instance?.state || 'disconnected'
          const isConnected = instanceState === 'open' || instanceState === 'connected'
          
          return NextResponse.json({ 
            connected: isConnected, 
            exists: true,
            state: instanceState,
            instance: instance
          })
        }
        
        // Verificar diferentes formatos de resposta
        const state = stateResult.data?.instance?.state || stateResult.data?.state || 'unknown'
        const connected = state === 'open' || state === 'connected'
        
        return NextResponse.json({
          connected,
          exists: true,
          state,
          instance: stateResult.data?.instance || stateResult.data,
        })

      case 'qrcode':
        const qrResult = await getQRCode(instanceName)
        if (!qrResult.success) {
          return NextResponse.json({ error: qrResult.error }, { status: 400 })
        }
        return NextResponse.json({
          qrcode: qrResult.data?.base64 || qrResult.data?.qrcode?.base64,
          pairingCode: qrResult.data?.pairingCode,
        })

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('WhatsApp API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST - Ações da instância
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const tenantId = (user as any).tenant_id
    const instanceName = `tenant_${tenantId.replace(/-/g, '_')}`

    const body = await request.json()
    const { action, phone, message } = body

    switch (action) {
      case 'create':
        const createResult = await createInstance(instanceName)
        if (!createResult.success) {
          // Se já existe, retornar sucesso
          if (createResult.error?.includes('already') || createResult.error?.includes('exists')) {
            return NextResponse.json({ success: true, message: 'Instância já existe' })
          }
          return NextResponse.json({ error: createResult.error }, { status: 400 })
        }
        
        // Configurar webhook
        const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/evolution`
        await setWebhook(instanceName, webhookUrl)
        
        // Salvar nome da instância no tenant
        const supabase = await createClient() as any
        await supabase
          .from('tenants')
          .update({ whatsapp_instance: instanceName })
          .eq('id', tenantId)

        return NextResponse.json({ 
          success: true, 
          instance: createResult.data,
          qrcode: createResult.data?.qrcode?.base64,
        })

      case 'connect':
        const qrResult = await getQRCode(instanceName)
        if (!qrResult.success) {
          return NextResponse.json({ error: qrResult.error }, { status: 400 })
        }
        return NextResponse.json({
          success: true,
          qrcode: qrResult.data?.base64 || qrResult.data?.qrcode?.base64,
          pairingCode: qrResult.data?.pairingCode,
        })

      case 'disconnect':
        const logoutResult = await logoutInstance(instanceName)
        return NextResponse.json({ 
          success: logoutResult.success, 
          error: logoutResult.error 
        })

      case 'restart':
        const restartResult = await restartInstance(instanceName)
        return NextResponse.json({ 
          success: restartResult.success, 
          error: restartResult.error 
        })

      case 'delete':
        const deleteResult = await deleteInstance(instanceName)
        if (deleteResult.success) {
          // Limpar referência no tenant
          const supabaseDelete = await createClient() as any
          await supabaseDelete
            .from('tenants')
            .update({ whatsapp_instance: null })
            .eq('id', tenantId)
        }
        return NextResponse.json({ 
          success: deleteResult.success, 
          error: deleteResult.error 
        })

      case 'test':
        if (!phone || !message) {
          return NextResponse.json({ error: 'Telefone e mensagem são obrigatórios' }, { status: 400 })
        }
        const testResult = await sendTextMessage(instanceName, phone, message)
        return NextResponse.json({ 
          success: testResult.success, 
          error: testResult.error 
        })

      default:
        return NextResponse.json({ error: 'Ação inválida' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('WhatsApp API error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

