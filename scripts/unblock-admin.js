// Script para desbloquear o admin
// Executar com: node scripts/unblock-admin.js

require('dotenv').config({ path: '.env.local' })

const { createClient } = require('@supabase/supabase-js')

async function unblockAdmin() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  console.log('🔄 Buscando tenant do usuário personaldann@gmail.com...')

  // Desbloquear direto pelo email do tenant
  const { data, error } = await supabase
    .from('tenants')
    .update({ subscription_status: 'active' })
    .eq('email', 'personaldann@gmail.com')
    .select()

  if (error) {
    console.error('❌ Erro:', error.message)
    return
  }

  if (data && data.length > 0) {
    console.log('✅ Tenant desbloqueado com sucesso!')
    console.log('📋 Tenant:', data[0].name)
    console.log('📧 Email:', data[0].email)
    console.log('🔓 Status:', data[0].subscription_status)
  } else {
    console.log('⚠️ Nenhum tenant encontrado com esse email')
  }
}

unblockAdmin()
