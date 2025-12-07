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

  // Unblock tenant by email directly
  const { data, error } = await supabase
    .from('tenants')
    .update({ subscription_status: 'active' })
    .eq('email', 'personaldann@gmail.com')
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (data && data.length > 0) {
    return NextResponse.json({ 
      success: true, 
      message: 'Tenant desbloqueado com sucesso!',
      tenant: data[0].name,
      status: data[0].subscription_status
    })
  }

  return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 })
}
