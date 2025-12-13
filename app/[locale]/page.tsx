import { 
  Calendar, Users, Scissors, BarChart3, Smartphone, Palette, ArrowRight, Check, 
  Sparkles, Shield, Zap, Clock, MessageSquare, DollarSign, Lock, TrendingUp,
  Star, ChevronDown, AlertCircle, Gift, Target, Briefcase, UserCheck, Bell,
  CreditCard, FileText, Settings, Globe, CheckCircle, XCircle
} from 'lucide-react'
import { VideoDemo } from '@/components/video-demo'
import { DelayedContent } from '@/components/delayed-content'
import { TodayBadge } from '@/components/today-badge'
import { Button } from '@/components/ui/button'

export default function LandingPage() {
  const allFeatures = [
    {
      icon: Calendar,
      title: 'Agenda Multi-funcionário',
      description: 'Gerencie múltiplos funcionários com agendas individuais e visão geral completa.',
    },
    {
      icon: Users,
      title: 'Gestão de Clientes',
      description: 'Cadastro completo de clientes com histórico de atendimentos e preferências.',
    },
    {
      icon: Scissors,
      title: 'Catálogo de Serviços',
      description: 'Configure serviços com preços, durações e profissionais habilitados.',
    },
    {
      icon: UserCheck,
      title: 'Gestão de Funcionários',
      description: 'Controle horários, folgas e comissões de cada profissional.',
    },
    {
      icon: BarChart3,
      title: 'Dashboard Completo',
      description: 'Métricas e relatórios em tempo real sobre seu negócio.',
    },
    {
      icon: DollarSign,
      title: 'Controle Financeiro',
      description: 'Acompanhe receitas, despesas e lucro com relatórios detalhados.',
    },
    {
      icon: MessageSquare,
      title: 'WhatsApp Automático',
      description: 'Lembretes e confirmações automáticas via WhatsApp.',
    },
    {
      icon: Bell,
      title: 'Notificações por Email',
      description: 'Envio automático de emails de confirmação e lembrete.',
    },
    {
      icon: Palette,
      title: 'White-label Completo',
      description: 'Personalize cores, logo e marca da sua página de agendamento.',
    },
    {
      icon: Globe,
      title: 'Página de Agendamento',
      description: 'Link personalizado para seus clientes agendarem online 24/7.',
    },
    {
      icon: Clock,
      title: 'Bloqueios de Horário',
      description: 'Bloqueie horários para folgas, férias ou compromissos.',
    },
    {
      icon: CreditCard,
      title: 'Controle de Despesas',
      description: 'Registre e categorize todas as despesas do seu negócio.',
    },
    {
      icon: Shield,
      title: 'Segurança Total',
      description: 'Seus dados protegidos com criptografia de ponta.',
    },
    {
      icon: Zap,
      title: 'Tempo Real',
      description: 'Sincronização instantânea em todos os dispositivos.',
    },
    {
      icon: FileText,
      title: 'Relatórios Exportáveis',
      description: 'Exporte dados em Excel e PDF para sua contabilidade.',
    },
    {
      icon: Settings,
      title: 'Configurações Avançadas',
      description: 'Personalize cada detalhe do sistema para seu negócio.',
    },
  ]

  const benefits = [
    {
      stat: '98%',
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
      text: 'Melhor investimento que já fiz para minha clínica! A IA resolve tudo automaticamente.',
      rating: 5,
    },
  ]

  const faqs = [
    {
      question: 'Como funciona o plano anual?',
      answer: 'Você paga R$ 197 à vista ou 12x de R$ 19,90 no cartão e tem acesso completo ao sistema por 1 ano inteiro, com todos os recursos liberados.',
    },
    {
      question: 'Posso cancelar?',
      answer: 'Sim! Oferecemos garantia de 7 dias. Se não gostar, devolvemos 100% do seu dinheiro sem perguntas.',
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

  const planFeatures = [
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
      with: '98% menos faltas, lembretes 100% automáticos',
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
      {/* Header - aparece após 9 minutos */}
      <DelayedContent delayMinutes={9}>
        <header className="fixed top-0 left-0 right-0 z-50 bg-gray-950/80 backdrop-blur-lg border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-16">
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
            </div>
          </div>
        </header>
      </DelayedContent>

      {/* Hero */}
      <section className="relative pt-16 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-gray-950 to-gray-950" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-violet-500/20 to-pink-500/20 rounded-full blur-3xl" />
        
        <div className="relative max-w-5xl mx-auto text-center">
          <TodayBadge />
          
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            Descubra Como Reduzir faltas em até 98% e Transformar horários vazios em faturamento sem trabalhar mais com essa
            <span className="block bg-gradient-to-r from-violet-400 to-pink-400 bg-clip-text text-transparent mt-2">
              Inteligência Artificial
            </span>
          </h1>
          
          <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-3xl mx-auto">
            <span className="text-white font-semibold">
              Exclusivo para todos os tipos de Negócios que usam agenda e horário marcados
            </span>
          </p>

          {/* Video Demo */}
          <VideoDemo />

        </div>
      </section>

      {/* Conteúdo com Delay de 9 minutos */}
      <DelayedContent delayMinutes={9}>
        {/* Seção de Preço Abaixo do Vídeo */}
        <section className="py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="relative p-8 rounded-3xl bg-gradient-to-br from-violet-500/30 via-pink-500/20 to-violet-500/30 border-4 border-violet-400 shadow-2xl shadow-violet-500/30">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-gradient-to-r from-violet-400 to-pink-500 text-white text-lg font-bold shadow-lg">
                OFERTA ESPECIAL
              </div>
              
              <div className="text-center pt-4">
                <h3 className="text-2xl font-bold text-white mb-4">Plano Único Anual</h3>
                <div className="flex items-baseline justify-center gap-2 mb-2">
                  <span className="text-5xl font-bold text-white">R$ 197</span>
                  <span className="text-xl text-violet-300">/ ano</span>
                </div>
                <p className="text-gray-300 mb-2">ou</p>
                <p className="text-2xl font-semibold text-emerald-400 mb-6">
                  12x de R$ 19,90
                </p>
                
                <a 
                  href="https://pay.cakto.com.br/yk2ptg6_683104" 
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white text-xl font-bold px-8 py-8 shadow-xl shadow-violet-500/40"
                  >
                    GARANTIR ACESSO AGORA
                    <ArrowRight className="ml-2 h-6 w-6" />
                  </Button>
                </a>
                <p className="text-gray-400 text-sm mt-4">
                  Garantia de 7 dias ou seu dinheiro de volta
                </p>
              </div>
            </div>
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
                Profissionais que já transformaram seus negócios
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
                  <p className="text-gray-300 mb-4 italic">&quot;{testimonial.text}&quot;</p>
                  <div>
                    <p className="text-white font-semibold">{testimonial.name}</p>
                    <p className="text-gray-400 text-sm">{testimonial.business}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing - Plano Único */}
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Invista no Seu Negócio
              </h2>
              <p className="text-gray-400 text-lg mb-2">
                Acesso completo a todas as funcionalidades
              </p>
            </div>

            {/* PLANO ÚNICO */}
            <div className="max-w-2xl mx-auto">
              <div className="relative p-8 rounded-3xl bg-gradient-to-br from-violet-500/30 via-pink-500/20 to-violet-500/30 border-4 border-violet-400 shadow-2xl shadow-violet-500/30">
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full bg-gradient-to-r from-violet-400 to-pink-500 text-white text-lg font-bold shadow-lg animate-pulse">
                  MELHOR CUSTO-BENEFÍCIO
                </div>
                
                <div className="text-center mb-8 pt-4">
                  <h3 className="text-3xl font-bold text-white mb-2">Plano Único Anual</h3>
                  <p className="text-violet-300 font-semibold text-lg mb-4">
                    Sistema completo por 1 ano
                  </p>
                  <div className="flex items-baseline justify-center gap-2 mb-2">
                    <span className="text-6xl font-bold text-white">R$ 197</span>
                    <span className="text-xl text-violet-300">/ ano</span>
                  </div>
                  <p className="text-gray-300 mb-2">ou</p>
                  <p className="text-emerald-400 font-semibold text-2xl mb-4">
                    12x de R$ 19,90 no cartão
                  </p>
                  <p className="text-gray-400 text-sm">
                    Apenas R$ 16,42/mês - Menos que um café por dia!
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-3 mb-8">
                  {planFeatures.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-400" />
                      </div>
                      <span className="text-gray-200 text-sm">{feature.label}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <a 
                    href="https://pay.cakto.com.br/yk2ptg6_683104" 
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button
                      size="lg"
                      className="w-full bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white text-xl font-bold px-8 py-8 shadow-xl shadow-violet-500/40 mb-3"
                    >
                      GARANTIR ACESSO AGORA
                      <ArrowRight className="ml-2 h-6 w-6" />
                    </Button>
                  </a>
                  <p className="text-gray-400 text-sm">
                    Garantia de 7 dias ou seu dinheiro de volta
                  </p>
                </div>
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
                Junte-se a centenas de profissionais que já <span className="text-white font-semibold">automatizaram sua gestão, reduziram faltas em 98%</span> e economizaram horas toda semana.
              </p>
              
              <a 
                href="https://pay.cakto.com.br/yk2ptg6_683104" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-violet-500 to-pink-500 hover:from-violet-600 hover:to-pink-600 text-white text-xl font-bold px-12 py-8 shadow-xl shadow-violet-500/40"
                >
                  GARANTIR ACESSO AGORA
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </a>

              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-gray-400 text-sm italic">
                  Mais de 47 profissionais se cadastraram nas últimas 24 horas
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
      </DelayedContent>
    </div>
  )
}
