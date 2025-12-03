// Sistema de controle de features por plano

export const PLAN_START = 'start'
export const PLAN_COMPLETO = 'completo'
export const PLAN_TRIAL = 'trial'

// Features disponíveis
export const FEATURES = {
  APPOINTMENTS: 'appointments',
  CLIENTS: 'clients',
  NOTIFICATIONS: 'notifications',
  REMINDERS: 'reminders',
  EMPLOYEES: 'employees',
  ANALYTICS: 'analytics',
  FINANCIAL: 'financial',
  REPORTS: 'reports',
  WHITE_LABEL: 'white_label',
  CUSTOM_DOMAIN: 'custom_domain',
  ADVANCED_SETTINGS: 'advanced_settings',
} as const

// Features do Plano Start
const START_FEATURES = [
  FEATURES.APPOINTMENTS,
  FEATURES.CLIENTS,
  FEATURES.NOTIFICATIONS,
  FEATURES.REMINDERS,
]

// Features do Plano Completo (todas)
const COMPLETO_FEATURES = [
  ...START_FEATURES,
  FEATURES.EMPLOYEES,
  FEATURES.ANALYTICS,
  FEATURES.FINANCIAL,
  FEATURES.REPORTS,
  FEATURES.WHITE_LABEL,
  FEATURES.CUSTOM_DOMAIN,
  FEATURES.ADVANCED_SETTINGS,
]

// Features do Trial (apenas básicas)
const TRIAL_FEATURES = [
  FEATURES.APPOINTMENTS,
  FEATURES.CLIENTS,
  FEATURES.NOTIFICATIONS,
]

/**
 * Retorna as features disponíveis para um plano
 */
export function getPlanFeatures(plan: string | null | undefined): string[] {
  if (!plan) return TRIAL_FEATURES
  
  switch (plan.toLowerCase()) {
    case PLAN_START:
      return START_FEATURES
    case PLAN_COMPLETO:
      return COMPLETO_FEATURES
    case PLAN_TRIAL:
      return TRIAL_FEATURES
    default:
      return TRIAL_FEATURES
  }
}

/**
 * Verifica se um plano tem acesso a uma feature específica
 */
export function hasFeature(
  plan: string | null | undefined,
  feature: string
): boolean {
  const features = getPlanFeatures(plan)
  return features.includes(feature)
}

/**
 * Retorna o nome amigável do plano
 */
export function getPlanName(plan: string | null | undefined): string {
  if (!plan) return 'Trial'
  
  switch (plan.toLowerCase()) {
    case PLAN_START:
      return 'Plano Start'
    case PLAN_COMPLETO:
      return 'Plano Completo'
    case PLAN_TRIAL:
      return 'Trial'
    default:
      return 'Trial'
  }
}

/**
 * Verifica se o plano permite upgrade
 */
export function canUpgrade(plan: string | null | undefined): boolean {
  if (!plan) return true
  return plan.toLowerCase() === PLAN_START || plan.toLowerCase() === PLAN_TRIAL
}

