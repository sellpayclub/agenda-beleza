-- Create expenses table for financial control
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

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_expenses_tenant_id ON expenses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
CREATE INDEX IF NOT EXISTS idx_expenses_expense_date ON expenses(expense_date);

-- Enable RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Add subscription fields to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'trial';

-- Update subscription_status check constraint
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_subscription_status_check;
ALTER TABLE tenants 
ADD CONSTRAINT tenants_subscription_status_check 
CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired', 'pending'));

-- Comment for documentation
COMMENT ON TABLE expenses IS 'Financial control for tenant expenses and costs';
COMMENT ON COLUMN expenses.type IS 'Type of expense: fixed, variable, material, other';
COMMENT ON COLUMN expenses.recurrence IS 'How often this expense occurs: once, daily, weekly, monthly, yearly';

