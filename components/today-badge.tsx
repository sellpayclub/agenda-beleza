'use client'

export function TodayBadge() {
  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric'
  })

  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/50 text-sm text-white font-semibold mb-8">
      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
      AULA GRÁTIS DISPONÍVEL ATÉ {today}
    </div>
  )
}
