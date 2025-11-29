export const dynamic = 'force-dynamic'

import { getMonthlyAppointments } from '@/lib/actions/appointments'
import { FinanceiroClient } from './financeiro-client'
import { format } from 'date-fns'

export default async function FinanceiroPage() {
  const now = new Date()
  const appointments = await getMonthlyAppointments(now.getFullYear(), now.getMonth() + 1)

  return <FinanceiroClient initialAppointments={appointments} />
}

