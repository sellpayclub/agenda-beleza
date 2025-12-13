export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { getCurrentUserAndTenant } from '@/lib/actions/auth'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { Watermark } from '@/components/dashboard/watermark'
import { isSubscriptionActive } from '@/lib/middleware/subscription-check'
import { BlockedScreen } from '@/components/dashboard/blocked-screen'

const SUPER_ADMIN_EMAIL = 'personaldann@gmail.com'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    // Buscar user e tenant em uma única chamada otimizada
    const { user: userData, tenant: tenantData } = await getCurrentUserAndTenant()
    
    if (!userData || !tenantData) {
      redirect('/login')
    }

    // Normalizar user
    const user = {
      ...userData,
      tenants: Array.isArray((userData as any).tenants) 
        ? (userData as any).tenants[0] 
        : (userData as any).tenants,
    }

    // Normalizar tenant
    const tenant = {
      ...tenantData,
      tenant_settings: Array.isArray((tenantData as any).tenant_settings) 
        ? (tenantData as any).tenant_settings[0] 
        : (tenantData as any).tenant_settings,
    }

    // Verificar se é super admin (sempre tem acesso)
    const userEmail = (user as any).email
    const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL

    // Verificar assinatura ativa (exceto para super admin)
    if (!isSuperAdmin) {
      const subscriptionStatus = isSubscriptionActive(tenant)
      
      // Se assinatura não está ativa, mostrar tela de bloqueio
      if (!subscriptionStatus.active) {
        return (
          <BlockedScreen 
            tenantName={tenant.name}
            reason={subscriptionStatus.reason || 'Sua assinatura está bloqueada'}
          />
        )
      }
    }
    
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar tenant={tenant} userEmail={userEmail} />
        <div className="lg:pl-64">
          <Header user={user} />
          <main className="p-4 md:p-6">
            {children}
          </main>
        </div>
        <Watermark />
      </div>
    )
  } catch (error: any) {
    console.error('Dashboard layout error:', error)
    redirect('/login')
  }
}
