import { getCurrentTenant } from '@/lib/actions/auth'
import { AssinaturaClient } from './assinatura-client'

export const metadata = {
  title: 'Assinatura - Minha Agenda Bio',
}

export default async function AssinaturaPage() {
  const tenant = await getCurrentTenant()

  return <AssinaturaClient tenant={tenant} />
}

