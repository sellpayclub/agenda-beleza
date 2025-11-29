import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const supabase = createAdminClient() as any

    // Buscar tenant pelo slug (sem filtro de status)
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('id, name, slug, subscription_status, created_at')
      .eq('slug', slug)
      .single()

    if (error) {
      return NextResponse.json({
        found: false,
        error: error.message,
        slug: slug,
      })
    }

    // Buscar serviços do tenant
    const { data: services, count: servicesCount } = await supabase
      .from('services')
      .select('id, name, is_active', { count: 'exact' })
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)

    // Buscar funcionários do tenant
    const { data: employees, count: employeesCount } = await supabase
      .from('employees')
      .select('id, name, is_active', { count: 'exact' })
      .eq('tenant_id', tenant.id)
      .eq('is_active', true)

    return NextResponse.json({
      found: true,
      tenant: {
        id: tenant.id,
        name: tenant.name,
        slug: tenant.slug,
        subscription_status: tenant.subscription_status,
        created_at: tenant.created_at,
      },
      services: {
        count: servicesCount,
        items: services,
      },
      employees: {
        count: employeesCount,
        items: employees,
      },
      canShowPublicPage: ['active', 'trial'].includes(tenant.subscription_status),
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
    }, { status: 500 })
  }
}

