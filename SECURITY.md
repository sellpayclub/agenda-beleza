# Segurança - Controle de Registro

## Problema Identificado

O sistema estava permitindo registro público sem controle, resultando em criação de contas não autorizadas.

## Solução Implementada

### 1. Controle de Registro Público

O registro de novas contas agora é controlado por uma variável de ambiente:

```bash
ENABLE_PUBLIC_REGISTRATION=false  # Desabilitado por padrão
```

**Para habilitar o registro público:**
```bash
ENABLE_PUBLIC_REGISTRATION=true
```

### 2. Rate Limiting

- **Máximo de 3 tentativas por hora** por email
- Bloqueio automático após exceder o limite
- Janela de tempo: 1 hora

### 3. Validações de Segurança

- ✅ Validação de formato de email
- ✅ Verificação de email duplicado
- ✅ Confirmação de email obrigatória (configurar no Supabase Dashboard)
- ✅ Logs de segurança para rastreamento

### 4. Bloqueio de Acesso

A página `/register` verifica automaticamente se o registro está habilitado:
- Se desabilitado: mostra mensagem e redireciona para login
- Se habilitado: permite registro normal

## Configuração no Vercel

1. Acesse o projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione:
   ```
   ENABLE_PUBLIC_REGISTRATION = false
   ```
4. Faça um novo deploy

## Configuração no Supabase

**IMPORTANTE:** Configure o Supabase para exigir confirmação de email:

1. Acesse o Supabase Dashboard
2. Vá em **Authentication** → **Settings**
3. Em **Email Auth**, ative:
   - ✅ **Enable email confirmations**
   - ✅ **Enable email change confirmations**

## Monitoramento

Todos os registros são logados no console com:
- ✅ Registros bem-sucedidos
- ⚠️ Tentativas bloqueadas (rate limit, email duplicado, etc.)
- ❌ Erros de segurança

## Recomendações

1. **Mantenha o registro desabilitado por padrão** (`ENABLE_PUBLIC_REGISTRATION=false`)
2. **Habilite apenas quando necessário** para testes ou lançamento controlado
3. **Monitore os logs** regularmente para detectar tentativas suspeitas
4. **Configure confirmação de email obrigatória** no Supabase
5. **Considere adicionar CAPTCHA** em produção (ex: reCAPTCHA do Google)

## Como Verificar Usuários Existentes

Para verificar e remover usuários não autorizados:

1. Acesse o Supabase Dashboard
2. Vá em **Authentication** → **Users**
3. Revise os usuários criados
4. Remova usuários suspeitos ou não autorizados

## Próximos Passos (Opcional)

- [ ] Adicionar CAPTCHA (reCAPTCHA)
- [ ] Implementar whitelist de domínios de email
- [ ] Adicionar rate limiting por IP (além de email)
- [ ] Implementar sistema de aprovação manual de contas
- [ ] Adicionar notificações de novos registros para admin




