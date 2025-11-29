// Evolution API Integration
// Docs: https://doc.evolution-api.com

const EVOLUTION_URL = process.env.EVOLUTION_API_URL || 'https://evolutionapi.clonefyia.com'
const EVOLUTION_KEY = process.env.EVOLUTION_API_KEY || ''

interface EvolutionResponse {
  success: boolean
  data?: any
  error?: string
}

// Criar instância
export async function createInstance(instanceName: string): Promise<EvolutionResponse> {
  try {
    const response = await fetch(`${EVOLUTION_URL}/instance/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_KEY,
      },
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS',
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, error: data.message || 'Erro ao criar instância' }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error creating instance:', error)
    return { success: false, error: error.message || 'Erro ao criar instância' }
  }
}

// Buscar QR Code
export async function getQRCode(instanceName: string): Promise<EvolutionResponse> {
  try {
    const response = await fetch(`${EVOLUTION_URL}/instance/connect/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': EVOLUTION_KEY,
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, error: data.message || 'Erro ao buscar QR Code' }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error getting QR code:', error)
    return { success: false, error: error.message || 'Erro ao buscar QR Code' }
  }
}

// Verificar status da conexão
export async function getConnectionState(instanceName: string): Promise<EvolutionResponse> {
  try {
    const response = await fetch(`${EVOLUTION_URL}/instance/connectionState/${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': EVOLUTION_KEY,
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, error: data.message || 'Erro ao verificar conexão' }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error getting connection state:', error)
    return { success: false, error: error.message || 'Erro ao verificar conexão' }
  }
}

// Buscar informações da instância
export async function fetchInstance(instanceName: string): Promise<EvolutionResponse> {
  try {
    const response = await fetch(`${EVOLUTION_URL}/instance/fetchInstances?instanceName=${instanceName}`, {
      method: 'GET',
      headers: {
        'apikey': EVOLUTION_KEY,
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, error: data.message || 'Erro ao buscar instância' }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error fetching instance:', error)
    return { success: false, error: error.message || 'Erro ao buscar instância' }
  }
}

// Desconectar instância
export async function logoutInstance(instanceName: string): Promise<EvolutionResponse> {
  try {
    const response = await fetch(`${EVOLUTION_URL}/instance/logout/${instanceName}`, {
      method: 'DELETE',
      headers: {
        'apikey': EVOLUTION_KEY,
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, error: data.message || 'Erro ao desconectar' }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error logging out instance:', error)
    return { success: false, error: error.message || 'Erro ao desconectar' }
  }
}

// Deletar instância
export async function deleteInstance(instanceName: string): Promise<EvolutionResponse> {
  try {
    const response = await fetch(`${EVOLUTION_URL}/instance/delete/${instanceName}`, {
      method: 'DELETE',
      headers: {
        'apikey': EVOLUTION_KEY,
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, error: data.message || 'Erro ao deletar instância' }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error deleting instance:', error)
    return { success: false, error: error.message || 'Erro ao deletar instância' }
  }
}

// Reiniciar instância
export async function restartInstance(instanceName: string): Promise<EvolutionResponse> {
  try {
    const response = await fetch(`${EVOLUTION_URL}/instance/restart/${instanceName}`, {
      method: 'PUT',
      headers: {
        'apikey': EVOLUTION_KEY,
      },
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, error: data.message || 'Erro ao reiniciar' }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error restarting instance:', error)
    return { success: false, error: error.message || 'Erro ao reiniciar' }
  }
}

// Enviar mensagem de texto
export async function sendTextMessage(
  instanceName: string,
  phone: string,
  message: string
): Promise<EvolutionResponse> {
  try {
    // Formatar telefone
    let formattedPhone = phone.replace(/\D/g, '')
    if (!formattedPhone.startsWith('55')) {
      formattedPhone = '55' + formattedPhone
    }

    const response = await fetch(`${EVOLUTION_URL}/message/sendText/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_KEY,
      },
      body: JSON.stringify({
        number: formattedPhone,
        text: message,
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, error: data.message || 'Erro ao enviar mensagem' }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error sending message:', error)
    return { success: false, error: error.message || 'Erro ao enviar mensagem' }
  }
}

// Configurar webhook
export async function setWebhook(
  instanceName: string,
  webhookUrl: string
): Promise<EvolutionResponse> {
  try {
    const response = await fetch(`${EVOLUTION_URL}/webhook/set/${instanceName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': EVOLUTION_KEY,
      },
      body: JSON.stringify({
        enabled: true,
        url: webhookUrl,
        webhookByEvents: false,
        webhookBase64: false,
        events: [
          'CONNECTION_UPDATE',
          'MESSAGES_UPDATE',
          'MESSAGES_UPSERT',
        ],
      }),
    })

    const data = await response.json()
    
    if (!response.ok) {
      return { success: false, error: data.message || 'Erro ao configurar webhook' }
    }

    return { success: true, data }
  } catch (error: any) {
    console.error('Error setting webhook:', error)
    return { success: false, error: error.message || 'Erro ao configurar webhook' }
  }
}

