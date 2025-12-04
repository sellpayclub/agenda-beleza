/**
 * Utilitários para trabalhar com domínios customizados
 */

/**
 * Retorna a URL base para um tenant, usando domínio customizado se disponível
 */
export function getTenantBaseUrl(tenant: { slug: string; custom_domain?: string | null }): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  
  if (tenant.custom_domain) {
    // Usar domínio customizado com protocolo
    const protocol = baseUrl.startsWith('https') ? 'https' : 'http'
    return `${protocol}://${tenant.custom_domain}`
  }
  
  return baseUrl
}

/**
 * Gera link de agendamento público para um tenant
 */
export function getBookingLink(tenant: { slug: string; custom_domain?: string | null }): string {
  const baseUrl = getTenantBaseUrl(tenant)
  return `${baseUrl}/b/${tenant.slug}`
}

/**
 * Gera link de gerenciamento de agendamento
 */
export function getManageLink(
  tenant: { slug: string; custom_domain?: string | null },
  appointmentId: string
): string {
  const baseUrl = getTenantBaseUrl(tenant)
  return `${baseUrl}/b/${tenant.slug}/manage/${appointmentId}`
}



