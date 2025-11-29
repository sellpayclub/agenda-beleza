export const dynamic = 'force-dynamic'

import { getClients } from '@/lib/actions/clients'
import { ClientsClient } from './clients-client'

export default async function ClientesPage() {
  const clients = await getClients()

  return <ClientsClient initialClients={clients} />
}

