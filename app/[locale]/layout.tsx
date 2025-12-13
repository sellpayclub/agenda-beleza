import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Outfit } from "next/font/google"
import { routing } from '@/i18n/routing'

const { locales } = routing
import { Providers } from '@/components/providers'
import { FacebookPixel } from '@/components/facebook-pixel'
import '../globals.css'

const outfit = Outfit({ 
  subsets: ["latin"],
  variable: "--font-outfit",
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  
  // Validar locale
  if (!locales.includes(locale as any)) {
    notFound()
  }

  // Carregar mensagens para o locale
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${outfit.variable} font-sans antialiased`}>
        <FacebookPixel />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            {children}
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}


