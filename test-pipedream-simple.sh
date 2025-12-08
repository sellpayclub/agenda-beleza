#!/bin/bash

# Script para testar webhook do Pipedream com dados do Daniel

# Calcular data/hora para 2 minutos no futuro (formato YYYY-MM-DDTHH:mm:ss)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    FUTURE_TIME=$(date -u -v+2M +"%Y-%m-%dT%H:%M:%S")
else
    # Linux
    FUTURE_TIME=$(date -u -d "+2 minutes" +"%Y-%m-%dT%H:%M:%S")
fi

# Data formatada em português
if [[ "$OSTYPE" == "darwin"* ]]; then
    DATA_FORMATADA=$(date "+%A, %d de %B" | sed 's/december/dezembro/' | sed 's/december/dezembro/' | sed 's/Dezembro/dezembro/')
    HORA_FORMATADA=$(date -v+2M "+%H:%M")
else
    DATA_FORMATADA=$(date "+%A, %d de %B")
    HORA_FORMATADA=$(date -d "+2 minutes" "+%H:%M")
fi

echo "📤 Enviando dados ao webhook do Pipedream..."
echo ""
echo "Dados do teste:"
echo "  Nome: Daniel"
echo "  Telefone: 15981910807"
echo "  Instância: tenant_79dcb445_e9ed_4bd9_a6ef_ab6d113d2a89"
echo "  Horário agendado: $FUTURE_TIME"
echo ""

# Criar payload JSON
PAYLOAD=$(cat <<EOF
{
  "whatsappNumber": "5515981910807",
  "name": "Daniel",
  "service": "Serviço de Teste",
  "scheduledDateTime": "$FUTURE_TIME",
  "message": "✅ *Agendamento Confirmado*\n\nOlá Daniel!\n\nSeu agendamento foi confirmado:\n\n📋 *Serviço:* Serviço de Teste\n👤 *Profissional:* Profissional de Teste\n📅 *Data:* $DATA_FORMATADA\n⏰ *Horário:* $HORA_FORMATADA\n💰 *Valor:* R$ 0,00\n\nQualquer dúvida, entre em contato!\n\n_Sistema de Teste_",
  "instanceId": "tenant_79dcb445_e9ed_4bd9_a6ef_ab6d113d2a89"
}
EOF
)

# Enviar ao webhook
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST https://eorclrf82hfvpb0.m.pipedream.net \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

echo "Resposta do webhook:"
echo "  Status HTTP: $HTTP_CODE"
echo "  Corpo: $BODY"
echo ""

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Webhook enviado com sucesso!"
    echo "⏰ Mensagem agendada para: $FUTURE_TIME"
    echo ""
    echo "O Pipedream deve processar e agendar o envio da mensagem para o horário especificado."
else
    echo "❌ Erro ao enviar webhook (código: $HTTP_CODE)"
fi
