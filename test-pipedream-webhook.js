// Script temporário para testar o webhook do Pipedream

const testData = {
  whatsappNumber: '5515981910807',
  name: 'Daniel',
  service: 'Serviço de Teste',
  // Agendar para 2 minutos no futuro para teste rápido
  scheduledDateTime: (() => {
    const date = new Date(Date.now() + 2 * 60 * 1000); // 2 minutos a partir de agora
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
  })(),
  message: `✅ *Agendamento Confirmado*

Olá Daniel!

Seu agendamento foi confirmado:

📋 *Serviço:* Serviço de Teste
👤 *Profissional:* Profissional de Teste
📅 *Data:* ${new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
⏰ *Horário:* ${new Date(Date.now() + 2 * 60 * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
💰 *Valor:* R$ 0,00

Qualquer dúvida, entre em contato!

_Sistema de Teste_`,
  instanceId: 'tenant_79dcb445_e9ed_4bd9_a6ef_ab6d113d2a89'
};

console.log('📤 Enviando dados ao webhook do Pipedream...\n');
console.log('Payload:', JSON.stringify(testData, null, 2));
console.log('\n');

fetch('https://eorclrf82hfvpb0.m.pipedream.net', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData),
})
  .then(async (response) => {
    const text = await response.text();
    console.log('✅ Status:', response.status, response.statusText);
    console.log('📥 Resposta:', text);
    
    if (response.ok) {
      console.log('\n✅ Webhook enviado com sucesso!');
      console.log(`⏰ Mensagem agendada para: ${testData.scheduledDateTime}`);
    } else {
      console.log('\n❌ Erro ao enviar webhook');
    }
  })
  .catch((error) => {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  });
