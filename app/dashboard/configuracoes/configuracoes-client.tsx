'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { updateTenantProfile, updateTenantSettings } from '@/lib/actions/tenant'
import { toast } from 'sonner'
import { Loader2, Copy, ExternalLink, Palette, Settings, Bell, Link as LinkIcon, Upload, X, Image as ImageIcon } from 'lucide-react'
import type { Tenant, TenantSettingsRow } from '@/types'
import { useTenant } from '@/hooks/use-tenant'
import { hasFeature, FEATURES } from '@/lib/utils/plan-features'
import { FeatureGate } from '@/components/dashboard/feature-gate'
import { getBookingLink } from '@/lib/utils/domain'

interface ConfiguracoesClientProps {
  tenant: Tenant & { tenant_settings: TenantSettingsRow[] | TenantSettingsRow | null }
}

export function ConfiguracoesClient({ tenant }: ConfiguracoesClientProps) {
  const settings = Array.isArray(tenant.tenant_settings)
    ? tenant.tenant_settings[0]
    : tenant.tenant_settings

  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url || '')
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [profileData, setProfileData] = useState({
    name: tenant.name,
    slug: tenant.slug,
    phone: tenant.phone || '',
    email: tenant.email || '',
    address: tenant.address || '',
    description: tenant.description || '',
    instagram: tenant.instagram || '',
    facebook: tenant.facebook || '',
    primary_color: tenant.primary_color,
    secondary_color: tenant.secondary_color,
  })

  const [settingsData, setSettingsData] = useState({
    min_advance_hours: settings?.min_advance_hours || 2,
    max_advance_days: settings?.max_advance_days || 30,
    slot_interval_minutes: settings?.slot_interval_minutes || 30,
    buffer_between_appointments: settings?.buffer_between_appointments || 0,
    auto_confirm: settings?.auto_confirm || false,
    cancellation_policy: settings?.cancellation_policy || '',
  })

  // Carregar preferências de notificação do banco (apenas WhatsApp)
  const defaultNotificationPrefs = {
    whatsappConfirmation: true,
    whatsappReminder24h: true,
    whatsappReminder1h: true,
  }
  
  const savedNotificationPrefs = (settings?.notification_preferences as any) || {}
  
  const [notificationPrefs, setNotificationPrefs] = useState({
    whatsappConfirmation: savedNotificationPrefs.whatsappConfirmation ?? defaultNotificationPrefs.whatsappConfirmation,
    whatsappReminder24h: savedNotificationPrefs.whatsappReminder24h ?? defaultNotificationPrefs.whatsappReminder24h,
    whatsappReminder1h: savedNotificationPrefs.whatsappReminder1h ?? defaultNotificationPrefs.whatsappReminder1h,
  })
  
  const [savingNotifications, setSavingNotifications] = useState(false)

  const publicUrl = typeof window !== 'undefined' 
    ? getBookingLink(tenant)
    : `/b/${tenant.slug}`

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl)
    toast.success('Link copiado!')
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await updateTenantProfile(profileData)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Perfil atualizado com sucesso')
    }

    setLoading(false)
  }

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const result = await updateTenantSettings(settingsData)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Configurações atualizadas com sucesso')
    }

    setLoading(false)
  }

  const handleNotificationsSubmit = async () => {
    setSavingNotifications(true)

    const result = await updateTenantSettings({
      notification_preferences: notificationPrefs
    })
    
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Preferências de notificação salvas com sucesso!')
    }

    setSavingNotifications(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem')
      return
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 2MB')
      return
    }

    setUploadingLogo(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('tenantId', tenant.id)

      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao fazer upload')
      }

      setLogoUrl(result.url)
      toast.success('Logo atualizado com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer upload do logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleRemoveLogo = async () => {
    setUploadingLogo(true)
    try {
      const response = await fetch('/api/upload/logo', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tenant.id }),
      })

      if (!response.ok) {
        throw new Error('Erro ao remover logo')
      }

      setLogoUrl('')
      toast.success('Logo removido com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao remover logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-500">Personalize seu negócio</p>
      </div>

      {/* Public Link Card */}
      <Card className="bg-gradient-to-r from-violet-500/10 to-pink-500/10 border-violet-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-violet-600" />
            Seu Link de Agendamento
          </CardTitle>
          <CardDescription>
            Compartilhe este link com seus clientes para agendamento online
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Input
              value={publicUrl}
              readOnly
              className="bg-white font-mono text-sm"
            />
            <Button variant="outline" size="icon" onClick={handleCopyLink}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" asChild>
              <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <Palette className="h-4 w-4" />
            Perfil e Marca
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="gap-2">
            <Settings className="h-4 w-4" />
            Agendamento
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <form onSubmit={handleProfileSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Informações do Negócio</CardTitle>
                <CardDescription>
                  Estas informações aparecem na sua página pública
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-4">
                  <Label>Logo do Negócio</Label>
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      {logoUrl ? (
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200">
                          <img
                            src={logoUrl}
                            alt="Logo"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={handleRemoveLogo}
                            disabled={uploadingLogo}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 cursor-pointer hover:border-violet-400 hover:bg-violet-50 transition-colors"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingLogo}
                      >
                        {uploadingLogo ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        {logoUrl ? 'Trocar Logo' : 'Enviar Logo'}
                      </Button>
                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG ou GIF. Máximo 2MB.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome do Negócio</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug (URL)</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">/b/</span>
                      <Input
                        id="slug"
                        value={profileData.slug}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                          })
                        }
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={profileData.description}
                    onChange={(e) =>
                      setProfileData({ ...profileData, description: e.target.value })
                    }
                    placeholder="Descreva seu negócio..."
                    rows={3}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone/WhatsApp</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Endereço</Label>
                  <Input
                    id="address"
                    value={profileData.address}
                    onChange={(e) =>
                      setProfileData({ ...profileData, address: e.target.value })
                    }
                    placeholder="Rua, número, bairro, cidade"
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Redes Sociais</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="instagram">Instagram</Label>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">@</span>
                        <Input
                          id="instagram"
                          value={profileData.instagram}
                          onChange={(e) =>
                            setProfileData({ ...profileData, instagram: e.target.value })
                          }
                          placeholder="seuinstagram"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="facebook">Facebook</Label>
                      <Input
                        id="facebook"
                        value={profileData.facebook}
                        onChange={(e) =>
                          setProfileData({ ...profileData, facebook: e.target.value })
                        }
                        placeholder="URL da página"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-4">Cores da Marca</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="primary_color">Cor Primária</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="primary_color"
                          value={profileData.primary_color}
                          onChange={(e) =>
                            setProfileData({ ...profileData, primary_color: e.target.value })
                          }
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={profileData.primary_color}
                          onChange={(e) =>
                            setProfileData({ ...profileData, primary_color: e.target.value })
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="secondary_color">Cor Secundária</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          id="secondary_color"
                          value={profileData.secondary_color}
                          onChange={(e) =>
                            setProfileData({ ...profileData, secondary_color: e.target.value })
                          }
                          className="w-12 h-10 rounded cursor-pointer"
                        />
                        <Input
                          value={profileData.secondary_color}
                          onChange={(e) =>
                            setProfileData({ ...profileData, secondary_color: e.target.value })
                          }
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-violet-500 to-pink-500"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar Alterações'}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* Scheduling Tab */}
        <TabsContent value="scheduling">
          <form onSubmit={handleSettingsSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Configurações de Agendamento</CardTitle>
                <CardDescription>
                  Defina as regras para agendamentos online
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="min_advance_hours">Antecedência Mínima (horas)</Label>
                    <Input
                      id="min_advance_hours"
                      type="number"
                      min="0"
                      max="168"
                      value={settingsData.min_advance_hours}
                      onChange={(e) =>
                        setSettingsData({
                          ...settingsData,
                          min_advance_hours: parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Tempo mínimo de antecedência para agendar
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_advance_days">Antecedência Máxima (dias)</Label>
                    <Input
                      id="max_advance_days"
                      type="number"
                      min="1"
                      max="365"
                      value={settingsData.max_advance_days}
                      onChange={(e) =>
                        setSettingsData({
                          ...settingsData,
                          max_advance_days: parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Quantos dias no futuro podem ser agendados
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="slot_interval_minutes">Intervalo de Slots (minutos)</Label>
                    <Input
                      id="slot_interval_minutes"
                      type="number"
                      min="15"
                      max="120"
                      step="15"
                      value={settingsData.slot_interval_minutes}
                      onChange={(e) =>
                        setSettingsData({
                          ...settingsData,
                          slot_interval_minutes: parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Intervalo entre os horários disponíveis
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="buffer_between_appointments">
                      Buffer entre Atendimentos (minutos)
                    </Label>
                    <Input
                      id="buffer_between_appointments"
                      type="number"
                      min="0"
                      max="60"
                      value={settingsData.buffer_between_appointments}
                      onChange={(e) =>
                        setSettingsData({
                          ...settingsData,
                          buffer_between_appointments: parseInt(e.target.value),
                        })
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Tempo de folga entre um atendimento e outro
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                  <div>
                    <Label>Confirmação Automática</Label>
                    <p className="text-sm text-gray-500">
                      Confirmar agendamentos automaticamente sem revisão manual
                    </p>
                  </div>
                  <Switch
                    checked={settingsData.auto_confirm}
                    onCheckedChange={(checked) =>
                      setSettingsData({ ...settingsData, auto_confirm: checked })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancellation_policy">Política de Cancelamento</Label>
                  <Textarea
                    id="cancellation_policy"
                    value={settingsData.cancellation_policy}
                    onChange={(e) =>
                      setSettingsData({ ...settingsData, cancellation_policy: e.target.value })
                    }
                    placeholder="Ex: Cancelamentos devem ser feitos com pelo menos 24 horas de antecedência..."
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-to-r from-violet-500 to-pink-500"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar Configurações'}
                </Button>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificações WhatsApp</CardTitle>
              <CardDescription>
                Configure as notificações automáticas por WhatsApp para seus clientes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                <p className="text-sm text-emerald-800">
                  <strong>📱 WhatsApp Automático:</strong> As mensagens são enviadas automaticamente via Evolution API com todos os dados do agendamento: nome, serviço, profissional, data, horário e valor.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-lg">✅ Confirmação de Agendamento</h3>
                <p className="text-sm text-gray-500 -mt-2">
                  Enviada imediatamente quando o cliente faz um agendamento
                </p>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border">
                  <div>
                    <Label className="font-medium">WhatsApp de Confirmação</Label>
                    <p className="text-sm text-gray-500">
                      Enviar mensagem com todos os detalhes do agendamento
                    </p>
                  </div>
                  <Switch 
                    checked={notificationPrefs.whatsappConfirmation}
                    onCheckedChange={(checked) => setNotificationPrefs({...notificationPrefs, whatsappConfirmation: checked})}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium text-lg">⏰ Lembretes Automáticos</h3>
                <p className="text-sm text-gray-500 -mt-2">
                  Enviados automaticamente antes do horário agendado (cron a cada 30 min)
                </p>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border">
                  <div>
                    <Label className="font-medium">Lembrete 24 horas antes</Label>
                    <p className="text-sm text-gray-500">
                      Lembrar o cliente um dia antes do agendamento
                    </p>
                  </div>
                  <Switch 
                    checked={notificationPrefs.whatsappReminder24h}
                    onCheckedChange={(checked) => setNotificationPrefs({...notificationPrefs, whatsappReminder24h: checked})}
                  />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 border">
                  <div>
                    <Label className="font-medium">Lembrete 1 hora antes</Label>
                    <p className="text-sm text-gray-500">
                      Lembrar o cliente uma hora antes do agendamento
                    </p>
                  </div>
                  <Switch 
                    checked={notificationPrefs.whatsappReminder1h}
                    onCheckedChange={(checked) => setNotificationPrefs({...notificationPrefs, whatsappReminder1h: checked})}
                  />
                </div>
              </div>

              <Separator />

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">📱 Exemplo de mensagem de lembrete:</h4>
                <div className="text-sm text-blue-900 bg-white p-3 rounded border border-blue-200 font-mono whitespace-pre-line text-xs">
{`⏰ *Lembrete de Agendamento*

Olá Maria! 👋

Passando para lembrar do seu agendamento *amanhã*:

📋 *Serviço:* Corte de Cabelo
👤 *Profissional:* João Silva
📅 *Data:* segunda-feira, 15 de janeiro
⏰ *Horário:* 14:30
💰 *Valor:* R$ 50,00

📍 *Endereço:* Rua Exemplo, 123

🔗 *Precisa reagendar ou cancelar?*
[Link automático]

Estamos esperando você! 😊

_${tenant.name}_`}
                </div>
              </div>

              <Button 
                onClick={handleNotificationsSubmit}
                disabled={savingNotifications}
                className="bg-gradient-to-r from-violet-500 to-pink-500 w-full"
              >
                {savingNotifications ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {savingNotifications ? 'Salvando...' : 'Salvar Preferências de Notificação'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

