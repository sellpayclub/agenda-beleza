'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Loader2, TestTube, Send, RefreshCw, CheckCircle, XCircle, Info } from 'lucide-react'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

export function TestesClient() {
  const [loading, setLoading] = useState<string | null>(null)
  const [results, setResults] = useState<any>(null)
  
  // Test reminders
  const [testRemindersLoading, setTestRemindersLoading] = useState(false)
  const [remindersResult, setRemindersResult] = useState<any>(null)

  // Test send now
  const [sendNowForm, setSendNowForm] = useState({
    minutesFromNow: 2,
  })
  const [sendNowLoading, setSendNowLoading] = useState(false)
  const [sendNowResult, setSendNowResult] = useState<any>(null)

  // Test webhook
  const [webhookForm, setWebhookForm] = useState({
    appointmentId: '',
  })
  const [webhookLoading, setWebhookLoading] = useState(false)
  const [webhookResult, setWebhookResult] = useState<any>(null)

  const handleTestReminders = async () => {
    setTestRemindersLoading(true)
    setRemindersResult(null)
    try {
      const response = await fetch('/api/test/reminders')
      const data = await response.json()
      setRemindersResult(data)
      if (data.success) {
        toast.success('Teste de lembretes executado com sucesso!')
      } else {
        toast.error(data.error || 'Erro ao testar lembretes')
      }
    } catch (error: any) {
      toast.error('Erro ao testar lembretes: ' + error.message)
      setRemindersResult({ error: error.message })
    } finally {
      setTestRemindersLoading(false)
    }
  }

  const handleTestSendNow = async () => {
    setSendNowLoading(true)
    setSendNowResult(null)
    try {
      const response = await fetch('/api/test/send-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          minutesFromNow: sendNowForm.minutesFromNow,
        }),
      })
      const data = await response.json()
      setSendNowResult(data)
      if (data.success) {
        toast.success('Mensagem de teste enviada com sucesso!')
      } else {
        toast.error(data.error || 'Erro ao enviar mensagem de teste')
      }
    } catch (error: any) {
      toast.error('Erro ao enviar teste: ' + error.message)
      setSendNowResult({ error: error.message })
    } finally {
      setSendNowLoading(false)
    }
  }

  const handleTestWebhook = async () => {
    if (!webhookForm.appointmentId) {
      toast.error('Informe o ID do agendamento')
      return
    }
    setWebhookLoading(true)
    setWebhookResult(null)
    try {
      const response = await fetch(`/api/test/webhook?appointmentId=${webhookForm.appointmentId}`)
      const data = await response.json()
      setWebhookResult(data)
      if (data.success) {
        toast.success('Webhook testado com sucesso!')
      } else {
        toast.error(data.error || 'Erro ao testar webhook')
      }
    } catch (error: any) {
      toast.error('Erro ao testar webhook: ' + error.message)
      setWebhookResult({ error: error.message })
    } finally {
      setWebhookLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl">
          <TestTube className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Testes e Debug</h1>
          <p className="text-gray-500">Ferramentas para testar e debugar funcionalidades do sistema</p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Atenção</AlertTitle>
        <AlertDescription>
          Estas ferramentas são para testes e debug. Use com cuidado em produção.
        </AlertDescription>
      </Alert>

      {/* Test Reminders */}
      <Card>
        <CardHeader>
          <CardTitle>Testar Sistema de Lembretes</CardTitle>
          <CardDescription>
            Verifica próximos agendamentos e quando os lembretes serão enviados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleTestReminders} disabled={testRemindersLoading}>
            {testRemindersLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Executar Teste
              </>
            )}
          </Button>

          {remindersResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold">Resultado:</h4>
                {remindersResult.success ? (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Sucesso
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700">
                    <XCircle className="w-3 h-3 mr-1" />
                    Erro
                  </Badge>
                )}
              </div>
              <Textarea
                value={JSON.stringify(remindersResult, null, 2)}
                readOnly
                className="font-mono text-xs min-h-[200px]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Send Now */}
      <Card>
        <CardHeader>
          <CardTitle>Enviar Mensagem de Teste Agora</CardTitle>
          <CardDescription>
            Cria um agendamento de teste e envia mensagem WhatsApp imediatamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="minutes">Minutos até o agendamento</Label>
            <Input
              id="minutes"
              type="number"
              value={sendNowForm.minutesFromNow}
              onChange={(e) => setSendNowForm({ minutesFromNow: parseInt(e.target.value) || 2 })}
              min="1"
              max="60"
            />
          </div>
          <Button onClick={handleTestSendNow} disabled={sendNowLoading}>
            {sendNowLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Enviar Mensagem de Teste
              </>
            )}
          </Button>

          {sendNowResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold">Resultado:</h4>
                {sendNowResult.success ? (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Enviado
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700">
                    <XCircle className="w-3 h-3 mr-1" />
                    Erro
                  </Badge>
                )}
              </div>
              <Textarea
                value={JSON.stringify(sendNowResult, null, 2)}
                readOnly
                className="font-mono text-xs min-h-[200px]"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Webhook */}
      <Card>
        <CardHeader>
          <CardTitle>Testar Webhook Externo</CardTitle>
          <CardDescription>
            Envia dados de um agendamento específico para o webhook externo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appointmentId">ID do Agendamento</Label>
            <Input
              id="appointmentId"
              value={webhookForm.appointmentId}
              onChange={(e) => setWebhookForm({ appointmentId: e.target.value })}
              placeholder="UUID do agendamento"
            />
          </div>
          <Button onClick={handleTestWebhook} disabled={webhookLoading}>
            {webhookLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Testar Webhook
              </>
            )}
          </Button>

          {webhookResult && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold">Resultado:</h4>
                {webhookResult.success ? (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Sucesso
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700">
                    <XCircle className="w-3 h-3 mr-1" />
                    Erro
                  </Badge>
                )}
              </div>
              <Textarea
                value={JSON.stringify(webhookResult, null, 2)}
                readOnly
                className="font-mono text-xs min-h-[200px]"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
