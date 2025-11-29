-- Add whatsapp_instance column to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS whatsapp_instance TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_tenants_whatsapp_instance 
ON tenants(whatsapp_instance);

-- Comment for documentation
COMMENT ON COLUMN tenants.whatsapp_instance IS 'Evolution API instance name for WhatsApp notifications';

