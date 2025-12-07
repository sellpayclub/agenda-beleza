import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// TEMPORARY: Remove after unblocking
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const secret = searchParams.get('secret')
  
  // Simple protection
  if (secret !== 'unblock2024') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient() as any

  // Find tenant by admin email
  const { data: user } = await supabase
    .from('users')
    .select('tenant_id')
    .eq('email', 'personaldann@gmail.com')
    .single()

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Unblock tenant - set to active
  const { error } = await supabase
    .from('tenants')
    .update({ subscription_status: 'active' })
    .eq('id', user.tenant_id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ 
    success: true, 
    message: 'Tenant unblocked successfully',
    tenant_id: user.tenant_id 
  })
}
