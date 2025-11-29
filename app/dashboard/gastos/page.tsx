export const dynamic = 'force-dynamic'

import { getExpenses, getExpenseStats, getExpenseCategories } from '@/lib/actions/expenses'
import { GastosClient } from './gastos-client'

export const metadata = {
  title: 'Controle de Gastos - Minha Agenda Bio',
}

export default async function GastosPage() {
  const [expenses, stats, categories] = await Promise.all([
    getExpenses(),
    getExpenseStats(),
    getExpenseCategories(),
  ])

  return (
    <GastosClient 
      initialExpenses={expenses} 
      initialStats={stats}
      categories={categories}
    />
  )
}

