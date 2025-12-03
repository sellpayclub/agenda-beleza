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
import { Loader2, Copy, ExternalLink, Palette, Settings, Bell, Link as LinkIcon, Upload, X, Image as ImageIcon, Globe, ChevronDown, ChevronUp, CheckCircle, AlertCircle } from 'lucide-react'
import type { Tenant, TenantSettingsRow } from '@/types'
import { useTenant } from '@/hooks/use-tenant'
import { hasFeature, FEATURES } from '@/lib/utils/plan-features'
import { FeatureGate } from '@/components/dashboard/feature-gate'
import { getBookingLink } from '@/lib/utils/domain'
import { DNSStatus } from '@/components/dashboard/dns-status'

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
  const [dnsInstructionsOpen, setDnsInstructionsOpen] = useState(false)
  
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
    custom_domain: (tenant as any).custom_domain || '',
  })

  const [settingsData, setSettingsData] = useState({
    min_advance_hours: settings?.min_advance_hours || 2,
    max_advance_days: settings?.max_advance_days || 30,
    slot_interval_minutes: settings?.slot_interval_minutes || 30,
    buffer_between_appointments: settings?.buffer_between_appointments || 0,
    auto_confirm: settings?.auto_confirm || false,
    cancellation_policy: settings?.cancellation_policy || '',
  })

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
                  <h3 className="text-lg font-medium mb-4">Domínio Personalizado</h3>
                  <div className="space-y-2">
                    <Label htmlFor="custom_domain">Seu Domínio</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="custom_domain"
                        value={profileData.custom_domain}
                        onChange={(e) =>
                          setProfileData({ ...profileData, custom_domain: e.target.value })
                        }
                        placeholder="seudominio.com.br"
                        disabled={!hasFeature((tenant as any)?.subscription_plan, FEATURES.CUSTOM_DOMAIN)}
                      />
                      <Globe className="w-4 h-4 text-gray-400" />
                    </div>
                    {!hasFeature((tenant as any)?.subscription_plan, FEATURES.CUSTOM_DOMAIN) ? (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-xs text-amber-800">
                          <strong>Domínio personalizado disponível apenas no Plano Completo.</strong> Faça upgrade para usar seu próprio domínio.
                        </p>
                      </div>
                    ) : (
                      <>
                        {profileData.custom_domain && (
                          <div className="mt-4">
                            <button
                              type="button"
                              onClick={() => setDnsInstructionsOpen(!dnsInstructionsOpen)}
                              className="flex items-center justify-between w-full p-3 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 transition-colors"
                            >
                              <span className="font-medium text-violet-900">
                                {dnsInstructionsOpen ? 'Ocultar' : 'Mostrar'} Instruções de Configuração DNS
                              </span>
                              {dnsInstructionsOpen ? (
                                <ChevronUp className="w-4 h-4 text-violet-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-violet-600" />
                              )}
                            </button>

                            {dnsInstructionsOpen && (
                              <div className="mt-3 p-4 bg-white border border-gray-200 rounded-lg space-y-4">
                                <div>
                                  <h4 className="font-semibold text-gray-900 mb-3">Como Configurar o DNS</h4>
                                  <p className="text-sm text-gray-600 mb-4">
                                    Para que seu domínio funcione, você precisa configurar um registro CNAME no seu provedor de DNS (onde você comprou o domínio).
                                  </p>
                                </div>

                                <div className="space-y-3">
                                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-700 mb-2">Passo 1: Acesse o painel do seu provedor de DNS</p>
                                    <p className="text-xs text-gray-600">
                                      Entre no painel de controle do seu domínio (Registro.br, GoDaddy, Namecheap, etc.)
                                    </p>
                                  </div>

                                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-xs font-semibold text-gray-700 mb-2">Passo 2: Adicione um registro CNAME</p>
                                    <div className="space-y-2 mt-2">
                                      <div className="flex items-center gap-2 text-xs">
                                        <span className="font-medium text-gray-700 w-20">Tipo:</span>
                                        <Badge variant="outline" className="text-xs">CNAME</Badge>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs">
                                        <span className="font-medium text-gray-700 w-20">Nome:</span>
                                        <code className="px-2 py-1 bg-gray-100 rounded text-gray-800">@</code>
                                        <span className="text-gray-500">ou</span>
                                        <code className="px-2 py-1 bg-gray-100 rounded text-gray-800">www</code>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs">
                                        <span className="font-medium text-gray-700 w-20">Valor:</span>
                                        <code className="px-2 py-1 bg-gray-100 rounded text-gray-800 flex-1">
                                          cname.vercel-dns.com
                                        </code>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 px-2"
                                          onClick={() => {
                                            navigator.clipboard.writeText('cname.vercel-dns.com')
                                            toast.success('Valor copiado!')
                                          }}
                                        >
                                          <Copy className="w-3 h-3" />
                                        </Button>
                                      </div>
                                      <div className="flex items-center gap-2 text-xs">
                                        <span className="font-medium text-gray-700 w-20">TTL:</span>
                                        <code className="px-2 py-1 bg-gray-100 rounded text-gray-800">3600</code>
                                        <span className="text-gray-500">(ou automático)</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <div className="flex items-start gap-2">
                                      <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                      <div className="text-xs text-blue-800">
                                        <p className="font-semibold mb-1">Importante:</p>
                                        <ul className="list-disc list-inside space-y-1 ml-2">
                                          <li>A propagação DNS pode levar de 5 minutos a 48 horas</li>
                                          <li>Use o botão "Verificar DNS" abaixo para checar se está configurado</li>
                                          <li>Se usar subdomínio (ex: agendamento.seudominio.com), use o subdomínio como nome</li>
                                        </ul>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <div className="flex items-start gap-2">
                                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                      <div className="text-xs text-emerald-800">
                                        <p className="font-semibold mb-1">Exemplo de Configuração:</p>
                                        <div className="mt-2 font-mono text-xs bg-white p-2 rounded border">
                                          <div>Tipo: <strong>CNAME</strong></div>
                                          <div>Nome: <strong>@</strong></div>
                                          <div>Valor: <strong>cname.vercel-dns.com</strong></div>
                                          <div>TTL: <strong>3600</strong></div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {!profileData.custom_domain && (
                          <p className="text-xs text-gray-500">
                            Configure o DNS do seu domínio apontando para este sistema. Salve o domínio primeiro para ver as instruções.
                          </p>
                        )}
                      </>
                    )}
                    {!profileData.custom_domain && (
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-blue-800">
                          <strong>Domínio padrão:</strong> {typeof window !== 'undefined' ? window.location.origin : ''}/b/{tenant.slug}
                        </p>
                      </div>
                    )}

                    {/* DNS Status Component */}
                    {profileData.custom_domain && hasFeature((tenant as any)?.subscription_plan, FEATURES.CUSTOM_DOMAIN) && (
                      <DNSStatus domain={profileData.custom_domain} />
                    )}
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
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Configure as notificações automáticas por email e WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">Confirmação de Agendamento</h3>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                  <div>
                    <Label>Email de Confirmação</Label>
                    <p className="text-sm text-gray-500">
                      Enviar email quando um agendamento é criado
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                  <div>
                    <Label>WhatsApp de Confirmação</Label>
                    <p className="text-sm text-gray-500">
                      Enviar mensagem no WhatsApp quando um agendamento é criado
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Lembretes</h3>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                  <div>
                    <Label>Lembrete 24h antes (Email)</Label>
                    <p className="text-sm text-gray-500">
                      Enviar lembrete por email 24 horas antes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                  <div>
                    <Label>Lembrete 24h antes (WhatsApp)</Label>
                    <p className="text-sm text-gray-500">
                      Enviar lembrete por WhatsApp 24 horas antes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50">
                  <div>
                    <Label>Lembrete 1h antes (WhatsApp)</Label>
                    <p className="text-sm text-gray-500">
                      Enviar lembrete por WhatsApp 1 hora antes
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Button className="bg-gradient-to-r from-violet-500 to-pink-500">
                Salvar Preferências
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

