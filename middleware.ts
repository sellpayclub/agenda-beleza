import createMiddleware from 'next-intl/middleware'
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { routing } from './i18n/routing'

// Configurar middleware do next-intl
const intlMiddleware = createMiddleware(routing)

export async function middleware(request: NextRequest) {
  // Primeiro, processar a sessão do Supabase
  const supabaseResponse = await updateSession(request)

  // Se o Supabase redirecionou, retornar a resposta dele
  if (supabaseResponse.status !== 200 || supabaseResponse.url !== request.url) {
    return supabaseResponse
  }

  // Depois, processar o next-intl
  // Ignorar rotas da API e arquivos estáticos
  const pathname = request.nextUrl.pathname
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    /\.(svg|png|jpg|jpeg|gif|webp)$/.test(pathname)
  ) {
    return supabaseResponse
  }

  // Aplicar middleware do next-intl
  const response = intlMiddleware(request)

  // Mesclar headers do Supabase com os do next-intl
  supabaseResponse.headers.forEach((value, key) => {
    response.headers.set(key, value)
  })

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

