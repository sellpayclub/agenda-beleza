import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser, getCurrentTenant } from '@/lib/actions/auth'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient() as any
    const adminClient = createAdminClient() as any
    
    // Get current auth user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Get current user profile
    const currentUser = await getCurrentUser()
    
    // Get current tenant
    const currentTenant = await getCurrentTenant()
    
    // Count appointments for this tenant
    let appointmentsCount = 0
    let allAppointments: any[] = []
    if (currentUser && (currentUser as any).tenant_id) {
      const { data: appointments, count } = await adminClient
        .from('appointments')
        .select('*, client:clients(name), service:services(name), employee:employees(name)', { count: 'exact' })
        .eq('tenant_id', (currentUser as any).tenant_id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      appointmentsCount = count || 0
      allAppointments = appointments || []
    }
    
    // Count all entities
    const { count: totalAppointments } = await adminClient
      .from('appointments')
      .select('*', { count: 'exact', head: true })
    
    const { count: totalClients } = await adminClient
      .from('clients')
      .select('*', { count: 'exact', head: true })
    
    const { count: totalServices } = await adminClient
      .from('services')
      .select('*', { count: 'exact', head: true })
    
    const { count: totalEmployees } = await adminClient
      .from('employees')
      .select('*', { count: 'exact', head: true })
    
    const { count: totalTenants } = await adminClient
      .from('tenants')
      .select('*', { count: 'exact', head: true })
    
    const { count: totalUsers } = await adminClient
      .from('users')
      .select('*', { count: 'exact', head: true })

    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      auth: {
        isAuthenticated: !!user,
        userId: user?.id,
        email: user?.email,
      },
      profile: currentUser ? {
        id: (currentUser as any).id,
        name: (currentUser as any).name,
        email: (currentUser as any).email,
        tenantId: (currentUser as any).tenant_id,
        role: (currentUser as any).role,
      } : null,
      tenant: currentTenant ? {
        id: (currentTenant as any).id,
        name: (currentTenant as any).name,
        slug: (currentTenant as any).slug,
      } : null,
      counts: {
        tenants: totalTenants,
        users: totalUsers,
        employees: totalEmployees,
        services: totalServices,
        clients: totalClients,
        appointments: totalAppointments,
        myAppointments: appointmentsCount,
      },
      recentAppointments: allAppointments.map(a => ({
        id: a.id,
        client: a.client?.name,
        service: a.service?.name,
        employee: a.employee?.name,
        startTime: a.start_time,
        status: a.status,
        createdAt: a.created_at,
      })),
    })
  } catch (error: any) {
    console.error('Debug error:', error)
    return NextResponse.json({
      status: 'error',
      error: error.message,
      stack: error.stack,
    }, { status: 500 })
  }
}

