-- ===============================================
-- SCRIPT DE DIAGNÓSTICO DO SISTEMA
-- Execute no Supabase SQL Editor
-- ===============================================

-- 1. Verificar se as tabelas existem
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Verificar RLS está habilitado
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- 3. Verificar usuários e tenants
SELECT 
  u.id as user_id,
  u.name as user_name,
  u.email as user_email,
  u.tenant_id,
  t.name as tenant_name,
  t.slug as tenant_slug
FROM users u
LEFT JOIN tenants t ON u.tenant_id = t.id;

-- 4. Verificar se há agendamentos
SELECT 
  a.id,
  a.tenant_id,
  t.name as tenant_name,
  c.name as client_name,
  s.name as service_name,
  e.name as employee_name,
  a.start_time,
  a.status,
  a.created_at
FROM appointments a
LEFT JOIN tenants t ON a.tenant_id = t.id
LEFT JOIN clients c ON a.client_id = c.id
LEFT JOIN services s ON a.service_id = s.id
LEFT JOIN employees e ON a.employee_id = e.id
ORDER BY a.created_at DESC
LIMIT 20;

-- 5. Verificar se existem serviços
SELECT id, tenant_id, name, is_active FROM services;

-- 6. Verificar se existem funcionários
SELECT id, tenant_id, name, is_active FROM employees;

-- 7. Verificar se existem clientes
SELECT id, tenant_id, name, phone FROM clients;

-- 8. Verificar políticas RLS existentes
SELECT 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 9. Verificar se a função get_user_tenant_id existe
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'get_user_tenant_id';

-- 10. Contar registros por tabela
SELECT 
  'tenants' as tabela, COUNT(*) as total FROM tenants
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'employees', COUNT(*) FROM employees
UNION ALL
SELECT 'services', COUNT(*) FROM services
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'appointments', COUNT(*) FROM appointments;

