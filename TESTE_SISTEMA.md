# 🧪 Guia de Teste do Sistema de Lembretes

## ✅ Como Testar o Sistema

### 1. **Teste de Confirmação Imediata**

Quando um agendamento confirmado é criado, a mensagem deve ser enviada **IMEDIATAMENTE**.

**Como testar:**
1. Crie um novo agendamento confirmado no sistema
2. Verifique os logs do servidor - deve aparecer:
   ```
   📤 Sending confirmation WhatsApp to [telefone] for appointment [id]
   ✅ Confirmation WhatsApp sent successfully for appointment [id]
   ```
3. O cliente deve receber a mensagem no WhatsApp instantaneamente

---

### 2. **Teste dos Lembretes Automáticos**

#### 2.1. Verificar Próximos Agendamentos

```bash
# Teste local
curl http://localhost:3000/api/test/reminders

# Ou acesse no navegador:
http://localhost:3000/api/test/reminders
```

Este endpoint mostra:
- Próximos agendamentos
- Quando os lembretes serão enviados
- Status das notificações

#### 2.2. Testar o Cron Manualmente

```bash
# Com CRON_SECRET configurado
curl -X GET http://localhost:3000/api/cron/reminders \
  -H "Authorization: Bearer SEU_CRON_SECRET"
```

Resposta esperada:
```json
{
  "success": true,
  "reminders": {
    "24h": 0,  // Quantos lembretes de 24h foram enviados
    "1h": 0    // Quantos lembretes de 1h foram enviados
  }
}
```

---

### 3. **Configurar o Cron Automático**

#### Opção A: Vercel Cron (Recomendado)

O arquivo `vercel.json` já está configurado. O cron roda automaticamente a cada 5 minutos na Vercel.

#### Opção B: Serviço Externo

Use um serviço como [cron-job.org](https://cron-job.org) ou [Upstash Cron](https://upstash.com):

- **URL:** `https://seudominio.com/api/cron/reminders`
- **Método:** GET
- **Header:** `Authorization: Bearer SEU_CRON_SECRET`
- **Frequência:** A cada 5 minutos (`*/5 * * * *`)

---

### 4. **Verificar Logs**

Os logs mostram:
- ✅ Quando lembretes são enviados com sucesso
- ❌ Quando há erros
- ⏭️ Quando lembretes já foram enviados
- ⚠️ Quando há dados faltando

---

### 5. **Teste Completo do Fluxo**

1. **Criar agendamento para daqui 25 horas:**
   - Agendamento criado → ✅ Confirmação enviada imediatamente
   - Após ~1 hora → 📤 Lembrete 24h será enviado (entre 23h55min e 24h5min)

2. **Criar agendamento para daqui 2 horas:**
   - Agendamento criado → ✅ Confirmação enviada imediatamente
   - Após ~1 hora → 📤 Lembrete 1h será enviado (entre 55min e 1h5min)

---

## 🔍 Troubleshooting

### Lembretes não estão sendo enviados?

1. Verifique se o cron está configurado e rodando
2. Verifique se `CRON_SECRET` está configurado corretamente
3. Verifique se os agendamentos têm:
   - Cliente com telefone
   - Tenant com `whatsapp_instance` configurado
   - Status `pending` ou `confirmed`

### Mensagens não chegam no WhatsApp?

1. Verifique se a Evolution API está configurada:
   - `EVOLUTION_API_URL`
   - `EVOLUTION_API_KEY`
2. Verifique se a instância está conectada
3. Verifique os logs do servidor para erros

---

## 📊 Monitoramento

O endpoint `/api/test/reminders` mostra em tempo real:
- Próximos agendamentos
- Quando os lembretes serão enviados
- Notificações já enviadas
- Configurações do sistema


