-- ===============================================
-- FIX RLS POLICIES - VERSÃO SEGURA
-- Pode ser executado múltiplas vezes sem erro
-- ===============================================

-- 1. Melhorar a função get_user_tenant_id
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

-- 2. Remover e recriar políticas de appointments
DROP POLICY IF EXISTS "Public can view their own appointment" ON appointments;
DROP POLICY IF EXISTS "Anyone can view specific appointment by id" ON appointments;
DROP POLICY IF EXISTS "Staff can view appointments in their tenant" ON appointments;
DROP POLICY IF EXISTS "Staff can update appointments" ON appointments;
DROP POLICY IF EXISTS "Admins can delete appointments" ON appointments;

-- 3. Criar políticas atualizadas
CREATE POLICY "Anyone can view specific appointment by id"
  ON appointments FOR SELECT
  USING (true);

CREATE POLICY "Staff can view appointments in their tenant"
  ON appointments FOR SELECT
  USING (
    tenant_id = get_user_tenant_id() 
    OR get_user_tenant_id() IS NULL
  );

CREATE POLICY "Staff can update appointments"
  ON appointments FOR UPDATE
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "Admins can delete appointments"
  ON appointments FOR DELETE
  USING (tenant_id = get_user_tenant_id());

-- 4. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_appointments_tenant_start 
ON appointments(tenant_id, start_time);

SELECT 'Migration 006 executada com sucesso!' as status;

