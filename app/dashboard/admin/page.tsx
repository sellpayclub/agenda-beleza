export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { isSuperAdmin, getAdminStats, getAllTenants } from '@/lib/actions/admin'
import { AdminClient } from './admin-client'

export const metadata = {
  title: 'Painel Admin - Minha Agenda Bio',
}

export default async function AdminPage() {
  const isAdmin = await isSuperAdmin()
  
  if (!isAdmin) {
    redirect('/dashboard')
  }

  const [stats, tenants] = await Promise.all([
    getAdminStats(),
    getAllTenants(),
  ])

  return <AdminClient initialStats={stats} initialTenants={tenants} />
}

