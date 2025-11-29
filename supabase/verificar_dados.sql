-- ===============================================
-- VERIFICAR DADOS DO SISTEMA
-- Execute no Supabase SQL Editor
-- ===============================================

-- 1. Ver todos os tenants
SELECT id, name, slug, email, subscription_status, created_at 
FROM tenants 
ORDER BY created_at;

-- 2. Ver todos os usuários
SELECT id, tenant_id, name, email, role, created_at 
FROM users 
ORDER BY created_at;

-- 3. Ver todos os funcionários
SELECT id, tenant_id, name, email, is_active 
FROM employees 
ORDER BY tenant_id, created_at;

-- 4. Ver todos os serviços
SELECT id, tenant_id, name, price, duration_minutes, is_active 
FROM services 
ORDER BY tenant_id;

-- 5. Ver todos os clientes
SELECT id, tenant_id, name, phone, email, created_at 
FROM clients 
ORDER BY tenant_id;

-- 6. Ver todos os agendamentos (se houver)
SELECT 
  a.id,
  t.name as tenant_name,
  c.name as client_name,
  c.phone as client_phone,
  s.name as service_name,
  e.name as employee_name,
  a.start_time,
  a.end_time,
  a.status,
  a.payment_status,
  a.created_at
FROM appointments a
LEFT JOIN tenants t ON a.tenant_id = t.id
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN services s ON a.service_id = s.id
LEFT JOIN employees e ON a.employee_id = e.id
ORDER BY a.created_at DESC;

-- 7. Verificar RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tenants', 'users', 'employees', 'services', 'clients', 'appointments');

-- 8. Verificar se há algum problema com a função get_user_tenant_id
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'get_user_tenant_id';

-- 9. Testar a função (vai retornar NULL se não estiver autenticado)
SELECT get_user_tenant_id();

-- 10. Contar registros por tabela
SELECT 'tenants' as tabela, COUNT(*) as total FROM tenants
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'employees', COUNT(*) FROM employees
UNION ALL SELECT 'services', COUNT(*) FROM services
UNION ALL SELECT 'clients', COUNT(*) FROM clients
UNION ALL SELECT 'appointments', COUNT(*) FROM appointments
UNION ALL SELECT 'notifications', COUNT(*) FROM notifications;

-- 11. Se você quiser criar um agendamento de teste, descomente abaixo:
/*
-- Primeiro, pegue os IDs necessários:
-- SELECT id FROM tenants LIMIT 1;
-- SELECT id FROM employees WHERE tenant_id = 'SEU_TENANT_ID' LIMIT 1;
-- SELECT id FROM services WHERE tenant_id = 'SEU_TENANT_ID' LIMIT 1;
-- SELECT id FROM clients WHERE tenant_id = 'SEU_TENANT_ID' LIMIT 1;

INSERT INTO appointments (
  tenant_id, 
  client_id, 
  employee_id, 
  service_id, 
  start_time, 
  end_time, 
  status
) VALUES (
  'SEU_TENANT_ID',
  'SEU_CLIENT_ID',
  'SEU_EMPLOYEE_ID',
  'SEU_SERVICE_ID',
  NOW() + INTERVAL '1 day',
  NOW() + INTERVAL '1 day' + INTERVAL '30 minutes',
  'pending'
);
*/

