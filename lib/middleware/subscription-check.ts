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
  blocked: boolean
  reason?: string
} {
  if (!tenant) {
    return {
      active: false,
      expired: true,
      blocked: false,
      reason: 'Tenant não encontrado',
    }
  }

  const status = tenant.subscription_status
  const expiresAt = tenant.subscription_expires_at

  // Verificar se está bloqueado (prioridade máxima)
  if (status === 'blocked') {
    return {
      active: false,
      expired: false,
      blocked: true,
      reason: 'Conta bloqueada por falta de pagamento',
    }
  }

  // Verificar se está expirado
  if (expiresAt) {
    const expired = isPast(parseISO(expiresAt))
    if (expired) {
      return {
        active: false,
        expired: true,
        blocked: false,
        reason: 'Assinatura expirada',
      }
    }
  }

  // Verificar status
  if (status !== 'active' && status !== 'trial') {
    return {
      active: false,
      expired: status === 'expired',
      blocked: false,
      reason: `Assinatura ${status}`,
    }
  }

  return {
    active: true,
    expired: false,
    blocked: false,
  }
}

/**
 * Verifica se o tenant está bloqueado
 */
export function isTenantBlocked(tenant: TenantSubscription | null): boolean {
  if (!tenant) return false
  return tenant.subscription_status === 'blocked'
}









