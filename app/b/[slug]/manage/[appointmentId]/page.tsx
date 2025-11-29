import { createAdminClient } from '@/lib/supabase/admin'
import { ManageAppointmentClient } from './manage-client'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ slug: string; appointmentId: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = createAdminClient()
  
  const { data: tenant } = await supabase
    .from('tenants')
    .select('name')
    .eq('slug', slug)
    .single()

  return {
    title: tenant ? `Gerenciar Agendamento - ${(tenant as any).name}` : 'Agendamento não encontrado',
  }
}

export default async function ManageAppointmentPage({ params }: PageProps) {
  const { slug, appointmentId } = await params
  const supabase = createAdminClient() as any

  // Get tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .single()

  if (tenantError || !tenant) {
    notFound()
  }

  // Get appointment with relations
  const { data: appointment, error: appointmentError } = await supabase
    .from('appointments')
    .select(`
      *,
      client:clients (*),
      employee:employees (*),
      service:services (*)
    `)
    .eq('id', appointmentId)
    .eq('tenant_id', tenant.id)
    .single()

  if (appointmentError || !appointment) {
    notFound()
  }

  return (
    <ManageAppointmentClient
      tenant={tenant}
      appointment={appointment}
    />
  )
}

