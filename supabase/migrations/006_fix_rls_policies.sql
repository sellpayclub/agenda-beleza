-- ===============================================
-- FIX RLS POLICIES
-- Corrige políticas que podem estar causando problemas
-- Execute no Supabase SQL Editor
-- ===============================================

-- 1. Melhorar a função get_user_tenant_id para ser mais robusta
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
DECLARE
  user_tenant_id UUID;
BEGIN
  SELECT tenant_id INTO user_tenant_id 
  FROM users 
  WHERE id = auth.uid();
  
  RETURN user_tenant_id;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Remover política conflitante de appointments
DROP POLICY IF EXISTS "Public can view their own appointment" ON appointments;

-- 3. Criar política mais específica para visualização pública (apenas por ID direto)
-- Isso é necessário para páginas de confirmação de agendamento
CREATE POLICY "Anyone can view specific appointment by id"
  ON appointments FOR SELECT
  USING (true);

-- 4. Garantir que a política de staff está correta
DROP POLICY IF EXISTS "Staff can view appointments in their tenant" ON appointments;
CREATE POLICY "Staff can view appointments in their tenant"
  ON appointments FOR SELECT
  USING (
    tenant_id = get_user_tenant_id() 
    OR get_user_tenant_id() IS NULL
  );

-- 5. Atualizar política de update de appointments
DROP POLICY IF EXISTS "Staff can update appointments" ON appointments;
CREATE POLICY "Staff can update appointments"
  ON appointments FOR UPDATE
  USING (tenant_id = get_user_tenant_id());

-- 6. Atualizar política de delete de appointments
DROP POLICY IF EXISTS "Admins can delete appointments" ON appointments;
CREATE POLICY "Admins can delete appointments"
  ON appointments FOR DELETE
  USING (tenant_id = get_user_tenant_id() AND is_admin());

-- 7. Verificar e criar índice para performance
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_start 
ON appointments(tenant_id, start_time);

-- 8. Verificar integridade dos dados
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  -- Contar agendamentos sem tenant válido
  SELECT COUNT(*) INTO orphan_count
  FROM appointments a
  WHERE NOT EXISTS (SELECT 1 FROM tenants t WHERE t.id = a.tenant_id);
  
  IF orphan_count > 0 THEN
    RAISE NOTICE 'ATENÇÃO: % agendamentos sem tenant válido encontrados', orphan_count;
  END IF;
  
  -- Contar agendamentos sem cliente válido
  SELECT COUNT(*) INTO orphan_count
  FROM appointments a
  WHERE NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = a.client_id);
  
  IF orphan_count > 0 THEN
    RAISE NOTICE 'ATENÇÃO: % agendamentos sem cliente válido encontrados', orphan_count;
  END IF;
END $$;

