import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { 
  Calendar, Users, Scissors, BarChart3, Smartphone, Palette, ArrowRight, Check, 
  Sparkles, Shield, Zap, Clock, MessageSquare, DollarSign, Lock, TrendingUp,
  Star, ChevronDown, AlertCircle, Gift, Target, Briefcase, UserCheck, Bell,
  CreditCard, FileText, Settings, Globe, CheckCircle, XCircle
} from 'lucide-react'
import { VideoDemo } from '@/components/video-demo'

export default function LandingPage() {
  const allFeatures = [
    {
      icon: Calendar,
      title: 'Agendamento Inteligente Multi-Horários',
      description: 'Sistema avançado com slots configuráveis, multi-funcionários e lógica de disponibilidade automática. Evite conflitos e otimize sua agenda.',
    },
    {
      icon: Users,
      title: 'Gestão Completa de Clientes',
      description: 'Cadastro ilimitado de clientes com histórico completo, preferências, notas e acompanhamento de todos os atendimentos.',
    },
    {
      icon: Scissors,
      title: 'Catálogo de Serviços Personalizável',
      description: 'Organize seus serviços com preços, duração, descrição e associação específica com funcionários qualificados.',
    },
    {
      icon: UserCheck,
      title: 'Gestão de Equipe e Funcionários',
      description: 'Cadastre funcionários com horários individuais, especialidades, permissões diferenciadas e controle de comissões.',
    },
    {
      icon: BarChart3,
      title: 'Dashboard e Analytics Avançados',
      description: 'Métricas em tempo real: receita, agendamentos, taxa de ocupação, performance por funcionário e horários de pico.',
    },
    {
      icon: DollarSign,
      title: 'Controle Financeiro Completo',
      description: 'Gestão de receitas, gastos, relatórios exportáveis em Excel/PDF e acompanhamento de lucro líquido mensal.',
    },
    {
      icon: MessageSquare,
      title: 'Notificações WhatsApp Automáticas',
      description: 'Integração com WhatsApp para confirmações, lembretes 24h e 1h antes, e mensagens personalizadas. Reduza faltas em até 90%!',
    },
    {
      icon: Bell,
      title: 'Lembretes por Email Automáticos',
      description: 'Sistema de notificações por email profissionais e personalizáveis para seus clientes nunca esquecerem.',
    },
    {
      icon: Palette,
      title: 'White-Label 100% Personalizável',
      description: 'Sua marca em destaque: personalize cores, logo, domínio próprio e crie uma identidade única.',
    },
    {
      icon: Globe,
      title: 'Página de Agendamento Pública',
      description: 'Link único tipo Linktree focado em agendamento. Compartilhe nas redes sociais e receba agendamentos 24/7.',
    },
    {
      icon: Clock,
      title: 'Bloqueios de Agenda Flexíveis',
      description: 'Bloqueie horários para férias, almoço, eventos ou indisponibilidades com poucos cliques.',
    },
    {
      icon: CreditCard,
      title: 'Gestão de Gastos e Despesas',
      description: 'Registre e categorize todas as despesas do seu negócio. Tenha controle total do seu fluxo de caixa.',
    },
    {
      icon: Shield,
      title: 'Multi-Tenant e Segurança',
      description: 'Cada negócio com ambiente 100% isolado e seguro. Seus dados protegidos com criptografia de ponta.',
    },
    {
      icon: Zap,
      title: 'Sincronização em Tempo Real',
      description: 'Todas as alterações aparecem instantaneamente para toda equipe. Zero conflitos de agendamento.',
    },
    {
      icon: FileText,
      title: 'Relatórios Exportáveis',
      description: 'Exporte relatórios financeiros e de agendamentos em Excel/PDF para análise detalhada.',
    },
    {
      icon: Settings,
      title: 'Configurações Avançadas',
      description: 'Personalize intervalos entre atendimentos, tempo de antecedência mínima, regras de cancelamento e muito mais.',
    },
  ]

  const benefits = [
    {
      stat: '90%',
      label: 'Redução em faltas e no-shows',
      icon: TrendingUp,
    },
    {
      stat: '5h+',
      label: 'Economizadas por semana',
      icon: Clock,
    },
    {
      stat: '3x',
      label: 'Mais agendamentos online',
      icon: Calendar,
    },
    {
      stat: '100%',
      label: 'Controle do seu negócio',
      icon: Target,
    },
  ]

  const testimonials = [
    {
      name: 'Mariana Silva',
      business: 'Studio Mariana Silva - SP',
      text: 'Desde que comecei a usar o Agendify, minhas faltas reduziram drasticamente e consigo atender muito mais clientes. A organização está impecável!',
      rating: 5,
    },
    {
      name: 'Carlos Mendes',
      business: 'Barbearia Elite - RJ',
      text: 'O sistema de lembretes automáticos pelo WhatsApp é sensacional! Meus clientes não esquecem mais dos horários e minha agenda está sempre cheia.',
      rating: 5,
    },
    {
      name: 'Juliana Costa',
      business: 'Espaço Beleza & Bem-Estar - MG',
      text: 'Por R$ 9,90 eu tenho um sistema completo que me economiza horas toda semana. Melhor investimento que já fiz para minha clínica!',
      rating: 5,
    },
  ]

  const faqs = [
    {
      question: 'Como funciona a assinatura?',
      answer: 'Você pode escolher entre o Plano Start (R$ 9,90/mês) com recursos básicos ou o Plano Completo (R$ 19,90/mês) com todos os recursos. Assine diretamente pelo link de pagamento.',
    },
    {
      question: 'Posso cancelar a qualquer momento?',
      answer: 'Sim! Não há fidelidade ou multas. Você pode cancelar sua assinatura a qualquer momento diretamente no painel, sem burocracia.',
    },
    {
      question: 'Quantos agendamentos e clientes posso ter?',
      answer: 'Ilimitados! Não há limites de agendamentos, clientes ou funcionários. Você paga o mesmo valor independente do tamanho do seu negócio.',
    },
    {
      question: 'O WhatsApp realmente funciona de forma automática?',
      answer: 'Sim! Após conectar seu WhatsApp (processo simples de escanear QR Code), todas as notificações são enviadas automaticamente sem você precisar fazer nada.',
    },
    {
      question: 'Preciso de conhecimento técnico para usar?',
      answer: 'Não! O sistema é super intuitivo e fácil de usar. Em poucos minutos você consegue cadastrar serviços, funcionários e começar a agendar.',
    },
    {
      question: 'Meus dados estão seguros?',
      answer: 'Absolutamente! Usamos a mesma infraestrutura de segurança de bancos digitais, com criptografia de ponta e backups automáticos diários.',
    },
    {
      question: 'Posso usar meu próprio domínio?',
      answer: 'Sim! Com o white-label completo, você pode configurar seu próprio domínio para a página de agendamentos (ex: agendamento.seusalao.com.br).',
    },
    {
      question: 'Tem suporte em português?',
      answer: 'Sim! Nosso suporte é 100% em português e responde rapidamente para ajudar você com qualquer dúvida.',
    },
  ]

  const planFeaturesStart = [
    { icon: Calendar, label: 'Agendamentos ilimitados' },
    { icon: Users, label: 'Gestão completa de clientes' },
    { icon: MessageSquare, label: 'Notificações WhatsApp automáticas' },
    { icon: Bell, label: 'Notificações por Email automáticas' },
    { icon: Clock, label: 'Lembretes automáticos (24h e 1h antes)' },
  ]

  const planFeaturesCompleto = [
    { icon: Calendar, label: 'Agendamentos ilimitados' },
    { icon: Users, label: 'Clientes ilimitados' },
    { icon: UserCheck, label: 'Funcionários ilimitados' },
    { icon: MessageSquare, label: 'WhatsApp integrado e automático' },
    { icon: Bell, label: 'Emails automáticos ilimitados' },
    { icon: BarChart3, label: 'Dashboard e Analytics completos' },
    { icon: DollarSign, label: 'Controle financeiro total' },
    { icon: FileText, label: 'Relatórios exportáveis (Excel/PDF)' },
    { icon: Sparkles, label: 'Página de agendamento personalizada' },
    { icon: Palette, label: 'White-label e personalização completa' },
    { icon: Globe, label: 'Domínio próprio' },
    { icon: Shield, label: 'Segurança e backup automático' },
    { icon: Zap, label: 'Sincronização em tempo real' },
    { icon: Clock, label: 'Lembretes automáticos (24h e 1h antes)' },
    { icon: Settings, label: 'Configurações avançadas' },
    { icon: Briefcase, label: 'Suporte prioritário em português' },
  ]

  const comparisonItems = [
    {
      feature: 'Agenda de papel ou Excel',
      without: 'Desorganização, conflitos de horário, perda de clientes',
      with: 'Organização total, zero conflitos, clientes satisfeitos',
    },
    {
      feature: 'Lembretes manuais',
      without: '30-50% de faltas, horas perdidas ligando',
      with: '90% menos faltas, lembretes 100% automáticos',
    },
    {
      feature: 'Controle financeiro',
      without: 'Sem visão clara, gastos descontrolados',
      with: 'Total controle de receitas, gastos e lucro real',
    },
    {
      feature: 'Gestão de equipe',
      without: 'Confusão de horários, funcionários ociosos',
      with: 'Cada funcionário otimizado, máxima produtividade',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              {/* Logo Agendify */}
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center overflow-hidden">
                {/* Calendário com checkmark */}
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="absolute"
                >
                  {/* Calendário base */}
                  <rect
                    x="2"
                    y="4"
                    width="16"
                    height="14"
                    rx="2"
                    fill="url(#calendarGradient)"
                  />
                  {/* Tabs do calendário */}
                  <rect x="4" y="2" width="3" height="2" rx="1" fill="url(#calendarGradient)" />
                  <rect x="9" y="2" width="3" height="2" rx="1" fill="url(#calendarGradient)" />
                  {/* Checkmark azul escuro */}
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
              <Link href="/login">
                <Button variant="ghost" className="text-gray-300 hover:text-white">
                  Entrar
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
            Mais de 500 negócios já transformaram sua gestão
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Pare de Perder Clientes por
            <span className="block bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent">
              Desorganização e Faltas
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            Sistema completo de agendamento online para qualquer tipo de negócio que trabalha com agendamentos. 
            <span className="block mt-2 text-white font-semibold">Reduza faltas em até 90% e economize 5+ horas por semana</span>
          </p>

          {/* Video Demo */}
          <VideoDemo />

        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-4 bg-gray-900/30">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Você Está Cansado Disso?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-4">
                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Clientes que Não Aparecem</h3>
                  <p className="text-gray-400">30-50% de faltas sem aviso prévio, horários desperdiçados e agenda vazia que poderia estar gerando receita.</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-4">
                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Desorganização Total</h3>
                  <p className="text-gray-400">Agenda de papel ou Excel desatualizada, conflitos de horário, dupla marcação e clientes insatisfeitos.</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-4">
                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Horas Perdidas Ligando</h3>
                  <p className="text-gray-400">Gastando 5+ horas por semana confirmando horários manualmente via WhatsApp quando poderia estar atendendo.</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20">
              <div className="flex items-start gap-4">
                <XCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Sem Controle Financeiro</h3>
                  <p className="text-gray-400">Não sabe exatamente quanto está ganhando, gastando ou seu lucro real no final do mês.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-xl text-white font-semibold mb-4">
              Está na Hora de Mudar Isso. Para Sempre.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Stats */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Resultados Reais de Quem Usa
            </h2>
            <p className="text-gray-400 text-lg">
              Profissionais que automatizaram sua gestão estão vendo esses resultados
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="text-center p-8 rounded-2xl bg-white/5 border border-white/5 hover:border-violet-500/30 transition-all"
              >
                <benefit.icon className="w-12 h-12 text-violet-400 mx-auto mb-4" />
                <div className="text-5xl font-bold bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {benefit.stat}
                </div>
                <p className="text-gray-400">{benefit.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All Features */}
      <section className="py-20 px-4 bg-gray-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Tudo que Você Precisa em Um Só Lugar
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Sistema completo e profissional. Sem precisar contratar desenvolvedores ou pagar por múltiplos sistemas.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allFeatures.map((feature, index) => (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-violet-500/30 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-violet-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Antes vs. Depois do Agendify
            </h2>
            <p className="text-gray-400 text-lg">
              Veja a transformação que você terá no seu negócio
            </p>
          </div>

          <div className="space-y-4">
            {comparisonItems.map((item, index) => (
              <div key={index} className="grid md:grid-cols-2 gap-4">
                <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="flex items-start gap-3 mb-2">
                    <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Sem o sistema</p>
                      <p className="text-white font-medium">{item.without}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="flex items-start gap-3 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Com o sistema</p>
                      <p className="text-white font-medium">{item.with}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 bg-gray-900/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              O Que Nossos Clientes Dizem
            </h2>
            <p className="text-gray-400 text-lg">
              Profissionais de beleza que já transformaram seus negócios
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-2xl bg-white/5 border border-white/5"
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-4 italic">"{testimonial.text}"</p>
                <div>
                  <p className="text-white font-semibold">{testimonial.name}</p>
                  <p className="text-gray-400 text-sm">{testimonial.business}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing - Enhanced */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Escolha o Plano Ideal Para Você
            </h2>
            <p className="text-gray-400 text-lg mb-2">
              Planos flexíveis que se adaptam ao tamanho do seu negócio
            </p>
            <p className="text-white text-xl font-semibold">
              Planos flexíveis para o seu negócio ☕
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
                  href="https://pay.cakto.com.br/yk2ptg6_683104" 
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
                  href="https://pay.cakto.com.br/poufkzs" 
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
                  href="https://pay.cakto.com.br/k6ccf3h" 
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

          <div className="mt-12 text-center">
            <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl max-w-2xl mx-auto">
              <p className="text-amber-300 font-semibold">
                💡 Dica: O Plano Vitalício paga-se em apenas 7 meses de uso comparado ao plano mensal completo!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-gray-900/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-gray-400 text-lg">
              Tudo que você precisa saber antes de começar
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group p-6 rounded-xl bg-white/5 border border-white/5 hover:border-violet-500/30 transition-all"
              >
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <h3 className="text-lg font-semibold text-white pr-4">
                    {faq.question}
                  </h3>
                  <ChevronDown className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                </summary>
                <p className="text-gray-400 mt-4 leading-relaxed">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-12 rounded-2xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/30">
            <Sparkles className="w-16 h-16 text-violet-400 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Pronto Para Transformar Seu Negócio?
            </h2>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Junte-se a centenas de profissionais que já <span className="text-white font-semibold">automatizaram sua gestão, reduziram faltas em 90%</span> e economizaram horas toda semana.
            </p>
            

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-gray-400 text-sm italic">
                ⏰ Mais de 47 profissionais se cadastraram nas últimas 24 horas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center overflow-hidden">
                {/* Logo Agendify */}
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
                    fill="url(#calendarGradientFooter)"
                  />
                  <rect x="4" y="2" width="3" height="2" rx="1" fill="url(#calendarGradientFooter)" />
                  <rect x="9" y="2" width="3" height="2" rx="1" fill="url(#calendarGradientFooter)" />
                  <path
                    d="M6 10L8.5 12.5L14 7"
                    stroke="#1e3a8a"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                  <defs>
                    <linearGradient id="calendarGradientFooter" x1="0" y1="0" x2="0" y2="20">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <span className="font-semibold text-white text-lg">Agendify</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Contato</a>
              <a href="#" className="hover:text-white transition-colors">Suporte</a>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
            <p className="text-gray-500 text-sm text-center md:text-left">
              © 2024 Agendify. Todos os direitos reservados.
            </p>
            
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Pagamento 100% Seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>Dados Protegidos</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
