import { getRequestConfig } from 'next-intl/server'
import { notFound } from 'next/navigation'

// Idiomas suportados
export const locales = ['pt', 'es', 'en'] as const
export type Locale = (typeof locales)[number]

// Idioma padrão
export const defaultLocale: Locale = 'pt'

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale
  
  // Validar que o locale recebido é válido
  if (!locale || !locales.includes(locale as Locale)) {
    notFound()
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  }
})


