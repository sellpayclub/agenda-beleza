'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Check, 
  ArrowRight,
  Lock,
  AlertCircle,
} from 'lucide-react'

interface BlockedScreenProps {
  tenantName?: string
  reason?: string
}

export function BlockedScreen({ tenantName, reason }: BlockedScreenProps) {
  const planFeaturesCompleto = [
    { label: 'Agendamentos ilimitados' },
    { label: 'Gestão completa de clientes' },
    { label: 'Múltiplos funcionários' },
    { label: 'Notificações WhatsApp automáticas' },
    { label: 'Lembretes automáticos (24h e 1h antes)' },
    { label: 'Dashboard e Analytics completos' },
    { label: 'Controle financeiro total' },
    { label: 'Relatórios exportáveis' },
    { label: 'White-label e personalização' },
    { label: 'Domínio personalizado' },
    { label: 'Gestão de bloqueios e horários' },
    { label: 'Suporte prioritário' },
  ]

  const planFeaturesStart = [
    { label: 'Agendamentos ilimitados' },
    { label: 'Gestão de clientes' },
    { label: 'Notificações WhatsApp' },
    { label: 'Lembretes automáticos' },
    { label: '1 funcionário' },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center overflow-hidden">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute"
                >
                  <rect
                    x="2"
                    y="4"
                    width="16"
                    height="14"
                    rx="2"
                    fill="url(#calendarGradient)"
                  />
                  <rect x="4" y="2" width="3" height="2" rx="1" fill="url(#calendarGradient)" />
                  <rect x="9" y="2" width="3" height="2" rx="1" fill="url(#calendarGradient)" />
                  <path
                    d="M6 10L8.5 12.5L14 7"
                    stroke="#1e3a8a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="calendarGradient" x1="0" y1="0" x2="0" y2="20">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="font-bold text-white text-lg">Agendify</span>
            </div>
            <div className="flex items-center gap-4">
              {tenantName && (
                <span className="text-gray-400 text-sm">{tenantName}</span>
              )}
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Sair
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden min-h-screen">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-gray-950 to-gray-950" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-500/20 to-pink-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-6xl mx-auto">
          {/* Alert Message */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-red-500/10 border-2 border-red-500/30 mb-8">
              <Lock className="w-6 h-6 text-red-400" />
              <div className="text-left">
                <h1 className="text-2xl font-bold text-white mb-2">
                  Acesso Bloqueado
                </h1>
                <p className="text-red-300">
                  {reason || 'Sua assinatura está cancelada ou expirada. Renove sua assinatura para continuar usando o sistema.'}
                </p>
              </div>
            </div>
            
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Escolha um plano para restaurar seu acesso e continuar gerenciando seus agendamentos.
            </p>
          </div>

          {/* PLANO VITALÍCIO - DESTAQUE PRINCIPAL */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-amber-500/30 via-yellow-500/20 to-orange-500/30 border-4 border-amber-400 shadow-2xl shadow-amber-500/30">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-gray-900 text-lg font-bold shadow-lg animate-pulse">
                🏆 MELHOR CUSTO-BENEFÍCIO
              </div>
              
              <div className="text-center mb-8 pt-4">
                <h3 className="text-3xl font-bold text-white mb-2">Plano Vitalício</h3>
                <p className="text-amber-300 font-semibold text-lg mb-4">
                  💎 Sistema completo PARA SEMPRE
                </p>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-6xl font-bold text-white">R$ 147</span>
                  <span className="text-xl text-amber-300">único</span>
                </div>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-gray-400 line-through">R$ 238,80/ano</span>
                  <span className="px-3 py-1 bg-emerald-500 text-white text-sm font-bold rounded-full">ECONOMIZE 38%</span>
                </div>
                <p className="text-emerald-400 font-semibold text-xl">
                  ✨ Apenas R$ 12,25/mês dividido em 12x
                </p>
                <p className="text-amber-200 text-sm mt-2">
                  💳 Cartão ou PIX • Sem mensalidade • Sem reajustes
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-3 mb-8">
                {planFeaturesCompleto.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-amber-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-amber-400" />
                    </div>
                    <span className="text-gray-200 text-sm">{feature.label}</span>
                  </div>
                ))}
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-emerald-300 text-sm font-semibold">🔒 Acesso vitalício garantido</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <span className="text-emerald-300 text-sm font-semibold">📈 Sem reajuste de preço nunca</span>
                </div>
              </div>

              <div className="text-center">
                <a 
                  href="https://lastlink.com/p/C563F06C1/checkout-payment/" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-gray-900 text-xl font-bold px-8 py-8 shadow-xl shadow-amber-500/40 mb-3"
                  >
                    🚀 GARANTIR ACESSO VITALÍCIO
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </a>
                <p className="text-amber-200 text-sm">
                  ✅ Pague uma vez, use para sempre • PIX ou Cartão em até 12x
                </p>
              </div>
            </div>
          </div>

          {/* Planos Mensais */}
          <div className="text-center mb-8">
            <p className="text-gray-400 text-lg">Ou escolha um plano mensal:</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Plano Start */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-b from-violet-500/20 to-pink-500/20 border-2 border-violet-500/50 shadow-xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Plano Start</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-bold text-white">R$ 9,90</span>
                  <span className="text-xl text-gray-400">/mês</span>
                </div>
                <p className="text-gray-400 text-sm">
                  Agendamento, notificações e clientes
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {planFeaturesStart.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-gray-300 text-sm">{feature.label}</span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <a 
                  href="https://lastlink.com/p/C80E6C97B/checkout-payment/" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white text-lg px-8 py-6 shadow-lg shadow-violet-500/25 mb-3"
                  >
                    🚀 Assinar Plano Start
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <p className="text-gray-400 text-xs">
                  💳 Cartão de crédito • Cancele quando quiser
                </p>
              </div>
            </div>

            {/* Plano Completo Mensal */}
            <div className="relative p-8 rounded-2xl bg-gradient-to-b from-pink-500/20 to-violet-500/20 border-2 border-pink-500/50 shadow-xl">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-4">Plano Completo</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-bold text-white">R$ 19,90</span>
                  <span className="text-xl text-gray-400">/mês</span>
                </div>
                <p className="text-emerald-400 font-semibold mb-1">
                  💎 Todos os recursos premium
                </p>
                <p className="text-gray-400 text-sm">
                  Para negócios que querem o máximo
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {planFeaturesCompleto.slice(0, 8).map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-emerald-400" />
                    </div>
                    <span className="text-gray-300 text-sm">{feature.label}</span>
                  </div>
                ))}
                <p className="text-violet-400 text-sm text-center">+ mais recursos...</p>
              </div>

              <div className="text-center">
                <a 
                  href="https://lastlink.com/p/C449B720D/checkout-payment/" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 text-white text-lg px-8 py-6 shadow-lg shadow-pink-500/25 mb-3"
                  >
                    🚀 Assinar Plano Completo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </a>
                <p className="text-gray-400 text-xs">
                  💳 Cartão de crédito • Cancele quando quiser
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
