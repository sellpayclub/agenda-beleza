'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { updateMessageTemplates } from '@/lib/actions/tenant'
import { toast } from 'sonner'
import { Loader2, Save, MessageSquare, Info } from 'lucide-react'
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert'

interface MensagensClientProps {
  initialTemplates: {
    confirmation: string | null
    reminder_24h: string | null
    reminder_1h: string | null
  }
}

const DEFAULT_CONFIRMATION = `✅ *Agendamento Confirmado*

Olá {cliente_nome}!

Seu agendamento foi confirmado:

📋 *Serviço:* {servico_nome}
👤 *Profissional:* {funcionario_nome}
📅 *Data:* {data}
⏰ *Horário:* {hora}
💰 *Valor:* {servico_preco}

{endereco}

🔗 *Reagendar ou cancelar:*
{link_reagendar}

Qualquer dúvida, entre em contato!

_{nome_estabelecimento}_`

const DEFAULT_REMINDER_24H = `⏰ *Lembrete de Agendamento*

Olá {cliente_nome}!

Seu agendamento é *amanhã* às *{hora}*.

📋 *Serviço:* {servico_nome}
👤 *Profissional:* {funcionario_nome}

{endereco}

🔗 *Precisa reagendar ou cancelar?*
{link_reagendar}

Estamos esperando você! 😊

_{nome_estabelecimento}_`

const DEFAULT_REMINDER_1H = `⏰ *Lembrete de Agendamento*

Olá {cliente_nome}!

Seu agendamento é *em 1 hora* às *{hora}*.

📋 *Serviço:* {servico_nome}
👤 *Profissional:* {funcionario_nome}

{endereco}

🔗 *Precisa reagendar ou cancelar?*
{link_reagendar}

Estamos esperando você! 😊

_{nome_estabelecimento}_`

const AVAILABLE_VARIABLES = [
  { var: '{cliente_nome}', desc: 'Nome do cliente' },
  { var: '{cliente_telefone}', desc: 'Telefone do cliente' },
  { var: '{servico_nome}', desc: 'Nome do serviço' },
  { var: '{servico_preco}', desc: 'Preço do serviço formatado' },
  { var: '{funcionario_nome}', desc: 'Nome do funcionário/profissional' },
  { var: '{data}', desc: 'Data formatada (ex: segunda-feira, 09 de dezembro)' },
  { var: '{hora}', desc: 'Hora formatada (ex: 11:30)' },
  { var: '{data_formatada}', desc: 'Data formato curto (ex: 09/12/2025)' },
  { var: '{link_reagendar}', desc: 'Link para reagendar/cancelar agendamento' },
  { var: '{endereco}', desc: 'Endereço do estabelecimento (se disponível)' },
  { var: '{nome_estabelecimento}', desc: 'Nome do negócio' },
]

export function MensagensClient({ initialTemplates }: MensagensClientProps) {
  const [templates, setTemplates] = useState({
    confirmation: initialTemplates.confirmation || DEFAULT_CONFIRMATION,
    reminder_24h: initialTemplates.reminder_24h || DEFAULT_REMINDER_24H,
    reminder_1h: initialTemplates.reminder_1h || DEFAULT_REMINDER_1H,
  })

  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('confirmation')

  const handleInsertVariable = (variable: string, field: 'confirmation' | 'reminder_24h' | 'reminder_1h') => {
    const textarea = document.getElementById(`textarea-${field}`) as HTMLTextAreaElement
    if (textarea) {
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const text = templates[field]
      const newText = text.substring(0, start) + variable + text.substring(end)
      setTemplates({ ...templates, [field]: newText })
      
      // Focus and set cursor after inserted variable
      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const result = await updateMessageTemplates({
        confirmation: templates.confirmation === DEFAULT_CONFIRMATION ? null : templates.confirmation,
        reminder_24h: templates.reminder_24h === DEFAULT_REMINDER_24H ? null : templates.reminder_24h,
        reminder_1h: templates.reminder_1h === DEFAULT_REMINDER_1H ? null : templates.reminder_1h,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success('Mensagens salvas com sucesso!')
      }
    } catch (error) {
      toast.error('Erro ao salvar mensagens')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = (field: 'confirmation' | 'reminder_24h' | 'reminder_1h') => {
    const defaults = {
      confirmation: DEFAULT_CONFIRMATION,
      reminder_24h: DEFAULT_REMINDER_24H,
      reminder_1h: DEFAULT_REMINDER_1H,
    }
    setTemplates({ ...templates, [field]: defaults[field] })
    toast.success('Mensagem restaurada para o padrão')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-violet-500 to-pink-500 rounded-xl">
          <MessageSquare className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Personalizar Mensagens</h1>
          <p className="text-gray-500">Customize as mensagens WhatsApp enviadas aos clientes</p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Como usar</AlertTitle>
        <AlertDescription>
          Use as variáveis disponíveis para personalizar suas mensagens. Clique em uma variável para inserir automaticamente.
          Deixe em branco ou use o padrão se não quiser personalizar.
        </AlertDescription>
      </Alert>

      {/* Variables Info */}
      <Card>
        <CardHeader>
          <CardTitle>Variáveis Disponíveis</CardTitle>
          <CardDescription>Clique em uma variável para inserir no editor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {AVAILABLE_VARIABLES.map((v) => (
              <Badge
                key={v.var}
                variant="outline"
                className="cursor-pointer hover:bg-violet-100 hover:border-violet-500 transition-colors"
                onClick={() => {
                  const field = activeTab as 'confirmation' | 'reminder_24h' | 'reminder_1h'
                  handleInsertVariable(v.var, field)
                }}
              >
                {v.var}
                <span className="ml-2 text-xs text-gray-500">({v.desc})</span>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Editor de Mensagens</CardTitle>
              <CardDescription>Personalize cada tipo de mensagem enviada</CardDescription>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Todas
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="confirmation">Confirmação</TabsTrigger>
              <TabsTrigger value="reminder_24h">Lembrete 24h</TabsTrigger>
              <TabsTrigger value="reminder_1h">Lembrete 1h</TabsTrigger>
            </TabsList>

            {/* Confirmation Tab */}
            <TabsContent value="confirmation" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="textarea-confirmation">Mensagem de Confirmação</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReset('confirmation')}
                  >
                    Restaurar Padrão
                  </Button>
                </div>
                <Textarea
                  id="textarea-confirmation"
                  value={templates.confirmation}
                  onChange={(e) => setTemplates({ ...templates, confirmation: e.target.value })}
                  className="font-mono text-sm min-h-[300px]"
                  placeholder={DEFAULT_CONFIRMATION}
                />
                <p className="text-xs text-gray-500">
                  Enviada imediatamente quando um agendamento confirmado é criado
                </p>
              </div>
            </TabsContent>

            {/* Reminder 24h Tab */}
            <TabsContent value="reminder_24h" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="textarea-reminder_24h">Lembrete 24 Horas Antes</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReset('reminder_24h')}
                  >
                    Restaurar Padrão
                  </Button>
                </div>
                <Textarea
                  id="textarea-reminder_24h"
                  value={templates.reminder_24h}
                  onChange={(e) => setTemplates({ ...templates, reminder_24h: e.target.value })}
                  className="font-mono text-sm min-h-[300px]"
                  placeholder={DEFAULT_REMINDER_24H}
                />
                <p className="text-xs text-gray-500">
                  Enviada 24 horas antes do horário do agendamento
                </p>
              </div>
            </TabsContent>

            {/* Reminder 1h Tab */}
            <TabsContent value="reminder_1h" className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="textarea-reminder_1h">Lembrete 1 Hora Antes</Label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReset('reminder_1h')}
                  >
                    Restaurar Padrão
                  </Button>
                </div>
                <Textarea
                  id="textarea-reminder_1h"
                  value={templates.reminder_1h}
                  onChange={(e) => setTemplates({ ...templates, reminder_1h: e.target.value })}
                  className="font-mono text-sm min-h-[300px]"
                  placeholder={DEFAULT_REMINDER_1H}
                />
                <p className="text-xs text-gray-500">
                  Enviada 1 hora antes do horário do agendamento
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}


