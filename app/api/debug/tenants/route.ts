import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verificar se as variáveis de ambiente existem
    const envCheck = {
      SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }

    if (!envCheck.SERVICE_ROLE_KEY) {
      return NextResponse.json({
        error: 'SUPABASE_SERVICE_ROLE_KEY não configurada na Vercel',
        envCheck,
      })
    }

    const supabase = createAdminClient() as any

    // Listar todos os tenants
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('id, name, slug, subscription_status, created_at')
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) {
      return NextResponse.json({
        error: error.message,
        envCheck,
      })
    }

    return NextResponse.json({
      success: true,
      envCheck,
      tenants: tenants || [],
      totalTenants: tenants?.length || 0,
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}

