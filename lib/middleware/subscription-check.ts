import { isPast, parseISO } from 'date-fns'

export interface TenantSubscription {
  subscription_status: string | null
  subscription_expires_at: string | null
  subscription_plan: string | null
}

/**
 * Verifica se a assinatura está ativa e válida
 */
export function isSubscriptionActive(tenant: TenantSubscription | null): {
  active: boolean
  expired: boolean
  reason?: string
} {
  if (!tenant) {
    return {
      active: false,
      expired: true,
      reason: 'Tenant não encontrado',
    }
  }

  const status = tenant.subscription_status
  const expiresAt = tenant.subscription_expires_at

  // Verificar se está expirado
  if (expiresAt) {
    const expired = isPast(parseISO(expiresAt))
    if (expired) {
      return {
        active: false,
        expired: true,
        reason: 'Assinatura expirada',
      }
    }
  }

  // Verificar status
  // Permitir acesso se status for 'active' ou 'trial' (mas ainda verificar expiração)
  if (status === 'active' || status === 'trial') {
    // Se já verificamos expiração por data acima, não precisa verificar novamente
    return {
      active: true,
      expired: false,
    }
  }

  // Status 'cancelled' ou 'expired' bloqueia acesso
  return {
    active: false,
    expired: status === 'expired',
    reason: `Assinatura ${status}`,
  }
}









