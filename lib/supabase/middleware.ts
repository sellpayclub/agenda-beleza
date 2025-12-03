import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Verificar domínio customizado
  const hostname = request.headers.get('host') || ''
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
  const baseHost = baseUrl.replace('https://', '').replace('http://', '').split('/')[0]
  
  const isCustomDomain = hostname && 
                         !hostname.includes('localhost') && 
                         !hostname.includes('127.0.0.1') &&
                         !hostname.includes('vercel.app') &&
                         hostname !== baseHost
  
  if (isCustomDomain) {
    // Buscar tenant pelo domínio customizado
    const adminSupabase = createAdminClient()
    const { data: tenant } = await adminSupabase
      .from('tenants')
      .select('slug')
      .eq('custom_domain', hostname)
      .single()
    
    if (tenant) {
      // Se está acessando a raiz ou /b/, redirecionar para a página pública do tenant
      if (request.nextUrl.pathname === '/' || request.nextUrl.pathname.startsWith('/b/')) {
        const url = request.nextUrl.clone()
        url.pathname = `/b/${tenant.slug}`
        return NextResponse.redirect(url)
      }
    }
  }

  // Protected routes
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register') ||
                     request.nextUrl.pathname.startsWith('/forgot-password')
  
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard')
  const isPublicPage = request.nextUrl.pathname.startsWith('/b/') || 
                       request.nextUrl.pathname === '/'

  // Redirecionar para login se não autenticado e tentando acessar dashboard
  if (!user && isDashboardPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirecionar para dashboard se já autenticado e tentando acessar páginas de auth
  if (user && isAuthPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

