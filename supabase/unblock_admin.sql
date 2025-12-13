-- Script para desbloquear o usuário admin personaldann@gmail.com
-- Execute este SQL no Supabase Dashboard > SQL Editor

UPDATE tenants 
SET subscription_status = 'active' 
WHERE email = 'personaldann@gmail.com';

-- Verificar se foi atualizado
SELECT id, name, email, subscription_status 
FROM tenants 
WHERE email = 'personaldann@gmail.com';


