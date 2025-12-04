-- Migration 007: Plan Features and Subscription Improvements
-- Adiciona suporte para planos (start/completo) e melhora performance

-- Garantir que subscription_plan aceita valores corretos
DO $$
BEGIN
  -- Atualizar tenants existentes sem plano para 'trial'
  UPDATE tenants 
  SET subscription_plan = 'trial' 
  WHERE subscription_plan IS NULL OR subscription_plan = '';
  
  -- Se subscription_plan não existir, adicionar
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'subscription_plan'
  ) THEN
    ALTER TABLE tenants ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'trial';
  END IF;
END $$;

-- Adicionar índices para melhorar performance de consultas de assinatura
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_status ON tenants(subscription_status);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_expires_at ON tenants(subscription_expires_at);
CREATE INDEX IF NOT EXISTS idx_tenants_subscription_plan ON tenants(subscription_plan);
CREATE INDEX IF NOT EXISTS idx_tenants_custom_domain ON tenants(custom_domain) WHERE custom_domain IS NOT NULL;

-- Garantir que custom_domain existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tenants' AND column_name = 'custom_domain'
  ) THEN
    ALTER TABLE tenants ADD COLUMN custom_domain VARCHAR(255);
  END IF;
END $$;

SELECT 'Migration 007 executada com sucesso!' as status;



