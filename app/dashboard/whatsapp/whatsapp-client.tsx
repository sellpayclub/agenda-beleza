'use client'

import { useEffect, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { 
  MessageSquare, 
  QrCode, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Trash2, 
  Send,
  Smartphone,
  CheckCircle2,
  XCircle,
  Loader2,
  Settings,
  Bell
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

type ConnectionState = 'not_created' | 'disconnected' | 'connecting' | 'open' | 'close' | 'unknown'

interface WhatsAppStatus {
  connected: boolean
  exists: boolean
  state: ConnectionState
  instance?: any
}

export function WhatsAppClient() {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [testMessage, setTestMessage] = useState('Olá! Esta é uma mensagem de teste do sistema de agendamentos. 📅✅')

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/whatsapp?action=status')
      const data = await response.json()
      console.log('WhatsApp status:', data) // Debug
      setStatus(data)
      return data
    } catch (error) {
      console.error('Error fetching status:', error)
      setStatus({ connected: false, exists: false, state: 'not_created' })
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
  }, [fetchStatus])

  // Polling mais frequente quando QR Code está aberto
  useEffect(() => {
    if (!showQRModal) return
    
    const interval = setInterval(async () => {
      const newStatus = await fetchStatus()
      if (newStatus?.connected) {
        setShowQRModal(false)
        toast.success('WhatsApp conectado com sucesso!')
      }
    }, 3000) // Verificar a cada 3 segundos
    
    return () => clearInterval(interval)
  }, [showQRModal, fetchStatus])


  const handleAction = async (action: string, data?: any) => {
    setActionLoading(action)
    try {
      const response = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Erro na operação')
      }

      switch (action) {
        case 'create':
          toast.success('Instância criada com sucesso!')
          if (result.qrcode) {
            setQrCode(result.qrcode)
            setShowQRModal(true)
          } else {
            await fetchQRCode()
          }
          break
        case 'connect':
          if (result.qrcode) {
            setQrCode(result.qrcode)
            setShowQRModal(true)
          }
          break
        case 'disconnect':
          toast.success('WhatsApp desconectado')
          break
        case 'restart':
          toast.success('Instância reiniciada')
          break
        case 'delete':
          toast.success('Instância removida')
          break
        case 'test':
          toast.success('Mensagem de teste enviada!')
          break
      }
      
      await fetchStatus()
    } catch (error: any) {
      toast.error(error.message || 'Erro ao executar ação')
    } finally {
      setActionLoading(null)
    }
  }

  const fetchQRCode = async () => {
    try {
      const response = await fetch('/api/whatsapp?action=qrcode')
      const data = await response.json()
      if (data.qrcode) {
        setQrCode(data.qrcode)
        setShowQRModal(true)
      } else {
        toast.error('QR Code não disponível')
      }
    } catch (error) {
      toast.error('Erro ao buscar QR Code')
    }
  }

  const handleSendTest = async () => {
    if (!testPhone) {
      toast.error('Informe o número de telefone')
      return
    }
    await handleAction('test', { phone: testPhone, message: testMessage })
  }

  const getStatusBadge = () => {
    if (!status) return null

    const badges: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string, icon: React.ReactNode }> = {
      'open': { variant: 'default', label: 'Conectado', icon: <CheckCircle2 className="w-3 h-3" /> },
      'connecting': { variant: 'secondary', label: 'Conectando...', icon: <Loader2 className="w-3 h-3 animate-spin" /> },
      'disconnected': { variant: 'destructive', label: 'Desconectado', icon: <XCircle className="w-3 h-3" /> },
      'close': { variant: 'destructive', label: 'Desconectado', icon: <XCircle className="w-3 h-3" /> },
      'not_created': { variant: 'outline', label: 'Não configurado', icon: <WifiOff className="w-3 h-3" /> },
      'unknown': { variant: 'secondary', label: 'Desconhecido', icon: <RefreshCw className="w-3 h-3" /> },
    }

    const badge = badges[status.state] || badges['unknown']
    
    return (
      <Badge variant={badge.variant} className="gap-1">
        {badge.icon}
        {badge.label}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Conexão WhatsApp</h1>
          <p className="text-gray-500">Configure a integração para enviar notificações automáticas</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchStatus}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Status Card */}
      <Card className="border-2 border-emerald-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-full ${status?.connected ? 'bg-emerald-100' : 'bg-gray-100'}`}>
                <MessageSquare className={`w-6 h-6 ${status?.connected ? 'text-emerald-600' : 'text-gray-400'}`} />
              </div>
              <div>
                <CardTitle className="text-xl">Status da Conexão</CardTitle>
                <CardDescription>
                  {status?.connected 
                    ? 'Seu WhatsApp está conectado e pronto para enviar notificações'
                    : 'Conecte seu WhatsApp para enviar notificações automáticas'
                  }
                </CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {/* Estado: Não configurado */}
            {status?.state === 'not_created' && (
              <Button
                onClick={() => handleAction('create')}
                disabled={actionLoading === 'create'}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {actionLoading === 'create' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Smartphone className="w-4 h-4 mr-2" />
                )}
                Configurar WhatsApp
              </Button>
            )}

            {/* Estado: Desconectado */}
            {status?.exists && !status?.connected && (
              <>
                <Button
                  onClick={() => handleAction('connect')}
                  disabled={actionLoading === 'connect'}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {actionLoading === 'connect' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <QrCode className="w-4 h-4 mr-2" />
                  )}
                  Conectar via QR Code
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAction('restart')}
                  disabled={actionLoading === 'restart'}
                >
                  {actionLoading === 'restart' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  Reiniciar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction('delete')}
                  disabled={actionLoading === 'delete'}
                >
                  {actionLoading === 'delete' ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  Remover Configuração
                </Button>
              </>
            )}

            {/* Estado: Conectado */}
            {status?.connected && (
              <Button
                variant="destructive"
                onClick={() => handleAction('disconnect')}
                disabled={actionLoading === 'disconnect'}
              >
                {actionLoading === 'disconnect' ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <WifiOff className="w-4 h-4 mr-2" />
                )}
                Desconectar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Teste de Mensagem */}
      {status?.connected && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Enviar Mensagem de Teste
            </CardTitle>
            <CardDescription>
              Envie uma mensagem de teste para verificar se a conexão está funcionando
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Número de Telefone</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={testPhone}
                  onChange={(e) => setTestPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Mensagem</Label>
                <Textarea
                  id="message"
                  placeholder="Digite sua mensagem..."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <Button
              onClick={handleSendTest}
              disabled={actionLoading === 'test' || !testPhone}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {actionLoading === 'test' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Enviar Teste
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notificações Automáticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações Automáticas
          </CardTitle>
          <CardDescription>
            Quando o WhatsApp estiver conectado, estas notificações serão enviadas automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-medium">Confirmação</span>
              </div>
              <p className="text-sm text-gray-500">
                Enviada imediatamente quando o cliente faz um agendamento
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Lembrete 24h</span>
              </div>
              <p className="text-sm text-gray-500">
                Enviada 24 horas antes do horário agendado
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Bell className="w-5 h-5 text-orange-600" />
                <span className="font-medium">Lembrete 1h</span>
              </div>
              <p className="text-sm text-gray-500">
                Enviada 1 hora antes do horário agendado
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium">Cancelamento</span>
              </div>
              <p className="text-sm text-gray-500">
                Enviada quando um agendamento é cancelado
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Settings className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Aviso ao Admin</span>
              </div>
              <p className="text-sm text-gray-500">
                Você recebe aviso quando um novo agendamento é feito
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Alert>
        <MessageSquare className="h-4 w-4" />
        <AlertTitle>Como funciona?</AlertTitle>
        <AlertDescription className="mt-2 space-y-2">
          <p>1. Clique em "Configurar WhatsApp" para criar a conexão</p>
          <p>2. Escaneie o QR Code com seu WhatsApp (igual ao WhatsApp Web)</p>
          <p>3. Mantenha o celular conectado à internet para enviar mensagens</p>
          <p className="text-sm text-amber-600">
            ⚠️ Use um número de WhatsApp dedicado ao seu negócio para evitar problemas
          </p>
        </AlertDescription>
      </Alert>

      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Escanear QR Code
            </DialogTitle>
            <DialogDescription>
              Abra o WhatsApp no seu celular, vá em Configurações → Aparelhos Conectados → Conectar Aparelho e escaneie o código abaixo
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {qrCode ? (
              <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
                <img 
                  src={qrCode.startsWith('data:') ? qrCode : `data:image/png;base64,${qrCode}`}
                  alt="QR Code WhatsApp"
                  className="w-64 h-64"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center w-64 h-64 bg-gray-100 rounded-lg">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            )}
            <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Aguardando conexão...
            </div>
            <Button 
              variant="outline" 
              onClick={() => handleAction('connect')}
              className="mt-4"
              disabled={actionLoading === 'connect'}
            >
              {actionLoading === 'connect' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Atualizar QR Code
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

