-- Adicionar status 'blocked' ao constraint de subscription_status
-- Este status é usado para bloquear usuários que não pagaram a renovação

-- Remove o constraint antigo
ALTER TABLE tenants DROP CONSTRAINT IF EXISTS tenants_subscription_status_check;

-- Adiciona novo constraint incluindo 'blocked'
ALTER TABLE tenants 
ADD CONSTRAINT tenants_subscription_status_check 
CHECK (subscription_status IN ('trial', 'active', 'cancelled', 'expired', 'pending', 'blocked'));

-- Comentário explicativo
COMMENT ON COLUMN tenants.subscription_status IS 'Status da assinatura: trial, active, cancelled, expired, pending, blocked. O status blocked é usado para bloquear manualmente usuários que não pagaram renovação.';
