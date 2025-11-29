-- ===============================================
-- EXPENSES TABLE - VERSÃO SEGURA
-- Pode ser executado múltiplas vezes sem erro
-- ===============================================

-- Criar tabela expenses se não existir
CREATE TABLE IF NOT EXISTS expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  type VARCHAR(50) NOT NULL DEFAULT 'other' CHECK (type IN ('fixed', 'variable', 'material', 'other')),
  category VARCHAR(100),
  recurrence VARCHAR(50) NOT NULL DEFAULT 'once' CHECK (recurrence IN ('once', 'daily', 'weekly', 'monthly', 'yearly')),
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índices se não existirem
CREATE INDEX IF NOT EXISTS idx_expenses_tenant_id ON expenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);

-- Habilitar RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (se houver)
DROP POLICY IF EXISTS "Users can view their tenant's expenses" ON expenses;
DROP POLICY IF EXISTS "Users can create expenses for their tenant" ON expenses;
DROP POLICY IF EXISTS "Users can update their tenant's expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete their tenant's expenses" ON expenses;

-- Criar políticas RLS
CREATE POLICY "Users can view their tenant's expenses"
  ON expenses FOR SELECT
  USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can create expenses for their tenant"
  ON expenses FOR INSERT
  WITH CHECK (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can update their tenant's expenses"
  ON expenses FOR UPDATE
  USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Users can delete their tenant's expenses"
  ON expenses FOR DELETE
  USING (tenant_id IN (SELECT tenant_id FROM users WHERE id = auth.uid()));

-- Adicionar campos de assinatura ao tenants (se não existirem)
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'trial';

-- Atualizar constraint de subscription_status
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_subscription_status_check;

-- Garantir que a coluna existe antes de adicionar constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'subscription_status'
  ) THEN
    ALTER TABLE tenants ADD COLUMN subscription_status VARCHAR(50) DEFAULT 'trial';
  END IF;
END $$;

-- Atualizar tenants existentes para ter status trial se estiver NULL ou vazio
UPDATE tenants SET subscription_status = 'trial' WHERE subscription_status IS NULL OR subscription_status = '';

SELECT 'Migration 005 executada com sucesso!' as status;

