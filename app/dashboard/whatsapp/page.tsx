export const dynamic = 'force-dynamic'

import { WhatsAppClient } from './whatsapp-client'

export const metadata = {
  title: 'WhatsApp - Minha Agenda Bio',
}

export default function WhatsAppPage() {
  return <WhatsAppClient />
}

