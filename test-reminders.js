// Script de teste para verificar o sistema de lembretes

const testCron = async () => {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  const cronSecret = process.env.CRON_SECRET || ''
  
  console.log('🧪 TESTANDO SISTEMA DE LEMBRETES\n')
  console.log('=' .repeat(60))
  
  // Test 1: Verificar próximos agendamentos
  console.log('\n1️⃣ Testando endpoint de teste...')
  try {
    const testRes = await fetch(`${baseUrl}/api/test/reminders`)
    const testData = await testRes.json()
    console.log('✅ Endpoint de teste OK')
    console.log('   Próximos agendamentos:', testData.proximos_agendamentos?.length || 0)
    if (testData.proximos_agendamentos?.length > 0) {
      console.log('\n   Próximos agendamentos:')
      testData.proximos_agendamentos.forEach((apt, i) => {
        console.log(`   ${i + 1}. ${apt.cliente} - ${apt.horario}`)
        console.log(`      Status: ${apt.status}, Horas até: ${apt.horas_ate_agendamento}h`)
        console.log(`      Lembrete 24h: ${apt.proximo_lembrete_24h}`)
        console.log(`      Lembrete 1h: ${apt.proximo_lembrete_1h}`)
      })
    }
  } catch (e) {
    console.log('❌ Erro:', e.message)
  }
  
  // Test 2: Testar cron endpoint (se tiver secret)
  if (cronSecret) {
    console.log('\n2️⃣ Testando endpoint do cron...')
    try {
      const cronRes = await fetch(`${baseUrl}/api/cron/reminders`, {
        headers: {
          'Authorization': `Bearer ${cronSecret}`
        }
      })
      const cronData = await cronRes.json()
      if (cronRes.ok) {
        console.log('✅ Cron executado com sucesso!')
        console.log('   Lembretes 24h enviados:', cronData.reminders?.['24h'] || 0)
        console.log('   Lembretes 1h enviados:', cronData.reminders?.['1h'] || 0)
      } else {
        console.log('❌ Erro no cron:', cronData.error)
      }
    } catch (e) {
      console.log('❌ Erro:', e.message)
    }
  } else {
    console.log('\n2️⃣ Pulando teste do cron (CRON_SECRET não configurado)')
  }
  
  console.log('\n' + '='.repeat(60))
  console.log('✅ Teste concluído!')
}

testCron()
