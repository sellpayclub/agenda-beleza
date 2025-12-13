import { getRequestConfig } from 'next-intl/server'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  // Obter locale do request
  let locale = await requestLocale
  
  // Validar que o locale recebido é válido, usar padrão se inválido
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale
  }

  return {
    locale: locale as string,
    messages: (await import(`../messages/${locale}.json`)).default
  }
})
