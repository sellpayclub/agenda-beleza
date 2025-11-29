export const dynamic = 'force-dynamic'

import { getCurrentTenant } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { ConfiguracoesClient } from './configuracoes-client'

export default async function ConfiguracoesPage() {
  const tenant = await getCurrentTenant()

  if (!tenant) {
    redirect('/login')
  }

  return <ConfiguracoesClient tenant={tenant} />
}

