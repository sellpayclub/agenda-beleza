import { getCurrentUser } from '@/lib/actions/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { MensagensClient } from './mensagens-client'

export default async function MensagensPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect('/login')
  }

  const user = currentUser as any
  const supabase = createAdminClient() as any

  // Buscar configurações do tenant
  const { data: settings } = await supabase
    .from('tenant_settings')
    .select('message_templates')
    .eq('tenant_id', user.tenant_id)
    .single()

  const templates = (settings?.message_templates as any) || {
    confirmation: null,
    reminder_24h: null,
    reminder_1h: null,
  }

  return <MensagensClient initialTemplates={templates} />
}


