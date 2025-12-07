'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Ban, 
  Check, 
  Zap, 
  Crown, 
  Sparkles,
  Calendar,
  Users,
  Bell,
  BarChart3,
  Wallet,
  Palette,
  Globe,
  MessageSquare,
  LogOut
} from 'lucide-react'
import { signOut } from '@/lib/actions/auth'

interface BlockedScreenProps {
  tenantName: string
}

const plans = [
  {
    id: 'trial',
    name: 'Trial',
    price: 'Grátis',
    period: '7 dias',
    description: 'Teste o sistema gratuitamente',
    icon: Sparkles,
    color: 'from-gray-500 to-gray-600',
    popular: false,
    features: [
      { name: 'Agendamentos ilimitados', icon: Calendar },
      { name: 'Gestão de clientes', icon: Users },
      { name: 'Notificações básicas', icon: Bell },
    ],
    cta: 'Período expirado',
    disabled: true,
  },
  {
    id: 'start',
    name: 'Start',
    price: 'R$ 9,90',
    period: '/mês',
    description: 'Para quem está começando',
    icon: Zap,
    color: 'from-violet-500 to-pink-500',
    popular: true,
    features: [
      { name: 'Agendamentos ilimitados', icon: Calendar },
      { name: 'Gestão de clientes', icon: Users },
      { name: 'Notificações por WhatsApp', icon: MessageSquare },
      { name: 'Lembretes automáticos', icon: Bell },
    ],
    cta: 'Assinar Plano Start',
    paymentLink: 'https://lastlink.com/p/C5D4AB5C8/subscribe-checkout',
    disabled: false,
  },
  {
    id: 'completo',
    name: 'Completo',
    price: 'R$ 19,90',
    period: '/mês',
    description: 'Todos os recursos disponíveis',
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    popular: false,
    features: [
      { name: 'Tudo do Plano Start', icon: Check },
      { name: 'Múltiplos funcionários', icon: Users },
      { name: 'Relatórios e analytics', icon: BarChart3 },
      { name: 'Controle financeiro', icon: Wallet },
      { name: 'Personalização de marca', icon: Palette },
      { name: 'Domínio personalizado', icon: Globe },
    ],
    cta: 'Assinar Plano Completo',
    paymentLink: 'https://lastlink.com/p/CA4E66B8C/subscribe-checkout',
    disabled: false,
  },
  {
    id: 'lifetime',
    name: 'Vitalício',
    price: 'R$ 147',
    period: 'único',
    description: 'Pague uma vez, use para sempre',
    icon: Sparkles,
    color: 'from-emerald-500 to-teal-500',
    popular: false,
    features: [
      { name: 'Tudo do Plano Completo', icon: Check },
      { name: 'Acesso vitalício', icon: Crown },
      { name: 'Sem mensalidades', icon: Wallet },
      { name: 'Atualizações incluídas', icon: Zap },
      { name: 'Suporte prioritário', icon: MessageSquare },
    ],
    cta: 'Comprar Acesso Vitalício',
    paymentLink: 'https://lastlink.com/p/CC28B8DD0/checkout-payment',
    disabled: false,
  },
]

export function BlockedScreen({ tenantName }: BlockedScreenProps) {
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    await signOut()
  }

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-900/20 via-gray-950 to-gray-950" />
      
      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-gray-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
              <Ban className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-white font-semibold">{tenantName}</h1>
              <p className="text-xs text-red-400">Acesso Bloqueado</p>
            </div>
          </div>
          <Button
            variant="ghost"
            onClick={handleLogout}
            disabled={loading}
            className="text-gray-400 hover:text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Warning Banner */}
        <div className="w-full max-w-4xl mb-8">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
              <Ban className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Sua conta está bloqueada
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              O acesso ao sistema foi bloqueado por falta de pagamento. 
              Para continuar usando todos os recursos, escolha um plano abaixo e regularize sua situação.
            </p>
          </div>
        </div>

        {/* Plans */}
        <div className="w-full max-w-6xl">
          <h3 className="text-xl font-semibold text-white text-center mb-8">
            Escolha um plano para desbloquear sua conta
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => {
              const Icon = plan.icon
              return (
                <Card 
                  key={plan.id}
                  className={`relative bg-gray-900/50 border-white/10 backdrop-blur overflow-hidden ${
                    plan.popular ? 'ring-2 ring-violet-500' : ''
                  } ${plan.disabled ? 'opacity-60' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0">
                      <Badge className="rounded-none rounded-bl-lg bg-gradient-to-r from-violet-500 to-pink-500 text-white border-0">
                        Mais Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="pb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-white">{plan.name}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {plan.description}
                    </CardDescription>
                    <div className="mt-4">
                      <span className="text-3xl font-bold text-white">{plan.price}</span>
                      {plan.period && (
                        <span className="text-gray-400">{plan.period}</span>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => {
                        const FeatureIcon = feature.icon
                        return (
                          <li key={idx} className="flex items-center gap-3 text-gray-300">
                            <FeatureIcon className="w-4 h-4 text-violet-400 flex-shrink-0" />
                            <span className="text-sm">{feature.name}</span>
                          </li>
                        )
                      })}
                    </ul>
                    
                    {plan.disabled ? (
                      <Button
                        disabled
                        className="w-full bg-gray-700 text-gray-400 cursor-not-allowed"
                      >
                        {plan.cta}
                      </Button>
                    ) : (
                      <a 
                        href={plan.paymentLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <Button
                          className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90`}
                        >
                          {plan.cta}
                        </Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Help text */}
        <p className="text-gray-500 text-sm mt-8 text-center max-w-xl">
          Após o pagamento, sua conta será desbloqueada automaticamente em poucos minutos.
          Se precisar de ajuda, entre em contato pelo WhatsApp.
        </p>
      </div>
    </div>
  )
}

