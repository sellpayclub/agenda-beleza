import { notFound } from 'next/navigation'
import { getTenantPublicData } from '@/lib/actions/tenant'
import { BookingPage } from './booking-page'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const tenant: any = await getTenantPublicData(slug)

  if (!tenant) {
    return { title: 'Não encontrado' }
  }

  return {
    title: `${tenant.name} - Agendamento Online`,
    description: tenant.description || `Agende seus horários com ${tenant.name}`,
  }
}

export default async function PublicBookingPage({ params }: PageProps) {
  const { slug } = await params
  const tenant = await getTenantPublicData(slug)

  if (!tenant) {
    notFound()
  }

  return <BookingPage tenant={tenant} />
}

