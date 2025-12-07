import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, Users, Scissors, BarChart3, Smartphone, Palette, ArrowRight, Check } from 'lucide-react'

export default function LandingPage() {
  const features = [
    {
      icon: Calendar,
      title: 'Agendamento Inteligente',
      description: 'Sistema multi-horários e multi-funcionários com slots configuráveis e lógica de disponibilidade avançada.',
    },
    {
      icon: Users,
      title: 'Gestão de Equipe',
      description: 'Cadastre funcionários com horários individuais, bloqueios de agenda e permissões diferenciadas.',
    },
    {
      icon: Scissors,
      title: 'Catálogo de Serviços',
      description: 'Organize seus serviços com preços, duração e associação com funcionários específicos.',
    },
    {
      icon: BarChart3,
      title: 'Dashboard & Analytics',
      description: 'Acompanhe métricas, receita, performance de funcionários e horários de pico.',
    },
    {
      icon: Smartphone,
      title: 'Notificações Automáticas',
      description: 'Lembretes por WhatsApp e Email para reduzir faltas e cancelamentos.',
    },
    {
      icon: Palette,
      title: '100% Personalizável',
      description: 'White-label completo com sua marca, cores e domínio próprio.',
    },
  ]

  const plans = [
    {
      name: 'Starter',
      price: 'R$ 49',
      period: '/mês',
      features: [
        'Até 2 funcionários',
        '100 agendamentos/mês',
        'Página pública',
        'Notificações por email',
        'Suporte por email',
      ],
    },
    {
      name: 'Professional',
      price: 'R$ 99',
      period: '/mês',
      popular: true,
      features: [
        'Até 5 funcionários',
        'Agendamentos ilimitados',
        'WhatsApp integrado',
        'Analytics avançado',
        'Domínio personalizado',
        'Suporte prioritário',
      ],
    },
    {
      name: 'Enterprise',
      price: 'R$ 199',
      period: '/mês',
      features: [
        'Funcionários ilimitados',
        'Multi-unidades',
        'API de integração',
        'Relatórios personalizados',
        'Onboarding dedicado',
        'Suporte 24/7',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500" />
              <span className="font-bold text-white text-lg">Minha Agenda Bio</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Entrar
                </Button>
              </Link>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-gray-950 to-gray-950" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-500/20 to-pink-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-gray-300 mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Mais de 500 salões já usam
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Sua agenda de beleza
            <span className="block bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              no piloto automático
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            Sistema completo de agendamento online para salões, barbearias, spas e clínicas de estética. 
            Reduza faltas em até 70% com lembretes automáticos.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-lg px-8 py-6">
                Criar Conta Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-white/20 text-white hover:bg-white/5 text-lg px-8 py-6">
              Ver Demonstração
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Tudo que você precisa
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Funcionalidades pensadas para simplificar a gestão do seu negócio de beleza
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-violet-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4 bg-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Planos para todo tamanho
            </h2>
            <p className="text-gray-400 text-lg">
              Comece grátis por 14 dias. Sem cartão de crédito.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative p-8 rounded-2xl ${
                  plan.popular
                    ? 'bg-gradient-to-b from-violet-500/20 to-pink-500/20 border-2 border-violet-500'
                    : 'bg-white/5 border border-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-violet-500 to-pink-500 text-white text-sm font-medium">
                    Mais Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                    <span className="text-gray-400">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3 text-gray-300">
                      <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    plan.popular
                      ? 'bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  Começar Agora
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Pronto para transformar seu negócio?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Junte-se a centenas de profissionais que já simplificaram sua gestão com o Minha Agenda Bio.
          </p>
          <Link href="/register">
            <Button size="lg" className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-lg px-8 py-6">
              Criar Conta Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500" />
            <span className="font-semibold text-white">Minha Agenda Bio</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 Minha Agenda Bio. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
