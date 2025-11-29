'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import {
  CreditCard,
  Check,
  Calendar,
  AlertCircle,
  Sparkles,
  Shield,
  Zap,
  MessageSquare,
  BarChart3,
  Users,
  Clock,
  Star,
  XCircle,
} from 'lucide-react'
import { format, addDays, parseISO, isPast } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import type { Tenant } from '@/types'

interface AssinaturaClientProps {
  tenant: Tenant | null
}

const PRICE = 9.90
const FEATURES = [
  { icon: Calendar, label: 'Agendamentos ilimitados' },
  { icon: Users, label: 'Clientes ilimitados' },
  { icon: MessageSquare, label: 'Notificações WhatsApp' },
  { icon: BarChart3, label: 'Dashboard e Analytics' },
  { icon: Sparkles, label: 'Página de agendamento personalizada' },
  { icon: Shield, label: 'Suporte prioritário' },
  { icon: Zap, label: 'Atualizações automáticas' },
  { icon: Clock, label: 'Lembretes automáticos' },
]

export function AssinaturaClient({ tenant }: AssinaturaClientProps) {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const subscriptionStatus = (tenant as any)?.subscription_status || 'trial'
  const expiresAt = (tenant as any)?.subscription_expires_at
  const isExpired = expiresAt ? isPast(parseISO(expiresAt)) : false
  const isActive = subscriptionStatus === 'active' && !isExpired
  const isTrial = subscriptionStatus === 'trial'
  const isCancelled = subscriptionStatus === 'cancelled'

  const getStatusBadge = () => {
    if (isActive) {
      return <Badge className="bg-green-100 text-green-700">Ativa</Badge>
    }
    if (isTrial) {
      return <Badge className="bg-blue-100 text-blue-700">Período de Teste</Badge>
    }
    if (isCancelled) {
      return <Badge className="bg-red-100 text-red-700">Cancelada</Badge>
    }
    if (isExpired) {
      return <Badge className="bg-amber-100 text-amber-700">Expirada</Badge>
    }
    return <Badge className="bg-gray-100 text-gray-700">Pendente</Badge>
  }

  const handleCancelSubscription = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: tenant?.id }),
      })

      if (!response.ok) {
        throw new Error('Erro ao cancelar assinatura')
      }

      toast.success('Assinatura cancelada. Você terá acesso até o fim do período pago.')
      setCancelDialogOpen(false)
      window.location.reload()
    } catch (error) {
      toast.error('Erro ao cancelar assinatura')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = () => {
    // Por enquanto, apenas mostrar instruções de pagamento manual
    toast.info('Entre em contato pelo WhatsApp para ativar sua assinatura!')
    window.open(`https://wa.me/5511999999999?text=Olá! Quero assinar o plano mensal de R$ 9,90. Meu negócio: ${tenant?.name}`, '_blank')
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Minha Assinatura</h1>
        <p className="text-gray-500">Gerencie seu plano e pagamentos</p>
      </div>

      {/* Current Plan Card */}
      <Card className="border-2 border-violet-200 bg-gradient-to-br from-violet-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-violet-100 rounded-full">
                <CreditCard className="w-6 h-6 text-violet-600" />
              </div>
              <div>
                <CardTitle>Plano Profissional</CardTitle>
                <CardDescription>Acesso completo a todas as funcionalidades</CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">R$ {PRICE.toFixed(2).replace('.', ',')}</span>
            <span className="text-gray-500">/mês</span>
          </div>

          {/* Status Info */}
          {isActive && expiresAt && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Assinatura Ativa</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Próxima renovação: {format(parseISO(expiresAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          )}

          {isTrial && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Período de Teste</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Você está no período de teste gratuito. Assine para continuar usando após o período.
              </p>
            </div>
          )}

          {isCancelled && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-800">Assinatura Cancelada</span>
              </div>
              <p className="text-sm text-red-700 mt-1">
                {expiresAt 
                  ? `Seu acesso termina em ${format(parseISO(expiresAt), "dd/MM/yyyy", { locale: ptBR })}`
                  : 'Sua assinatura foi cancelada. Assine novamente para continuar usando.'}
              </p>
            </div>
          )}

          {isExpired && (
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800">Assinatura Expirada</span>
              </div>
              <p className="text-sm text-amber-700 mt-1">
                Sua assinatura expirou. Renove para continuar usando todas as funcionalidades.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            {(!isActive || isCancelled || isExpired) && (
              <Button 
                onClick={handleSubscribe}
                className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isActive ? 'Renovar Assinatura' : 'Assinar Agora'}
              </Button>
            )}

            {isActive && !isCancelled && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                    Cancelar Assinatura
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancelar Assinatura?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza que deseja cancelar sua assinatura? Você continuará tendo acesso
                      até o fim do período já pago, mas não será renovada automaticamente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Voltar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCancelSubscription}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Confirmar Cancelamento
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Features */}
      <Card>
        <CardHeader>
          <CardTitle>O que está incluso</CardTitle>
          <CardDescription>
            Todas as funcionalidades para gerenciar seu negócio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {FEATURES.map((feature, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <feature.icon className="w-4 h-4 text-violet-600" />
                </div>
                <span className="text-sm font-medium">{feature.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Pagamento Seguro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Para ativar ou renovar sua assinatura, entre em contato conosco via WhatsApp.
            Aceitamos PIX, cartão de crédito e boleto.
          </p>
          
          <div className="p-4 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Formas de Pagamento:</h4>
            <ul className="space-y-1 text-sm text-green-700">
              <li>• PIX (aprovação imediata)</li>
              <li>• Cartão de Crédito</li>
              <li>• Boleto Bancário</li>
            </ul>
          </div>

          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleSubscribe}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Falar com Suporte via WhatsApp
          </Button>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium">Posso cancelar a qualquer momento?</h4>
            <p className="text-sm text-gray-600">
              Sim! Você pode cancelar sua assinatura quando quiser. O acesso continuará até o fim do período pago.
            </p>
          </div>
          <div>
            <h4 className="font-medium">O que acontece se eu não renovar?</h4>
            <p className="text-sm text-gray-600">
              Seus dados ficam salvos por 30 dias. Após esse período, podem ser removidos do sistema.
            </p>
          </div>
          <div>
            <h4 className="font-medium">Existe limite de agendamentos?</h4>
            <p className="text-sm text-gray-600">
              Não! Com a assinatura ativa você tem agendamentos, clientes e funcionários ilimitados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

