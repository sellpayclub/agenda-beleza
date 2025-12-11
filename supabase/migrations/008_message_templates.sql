-- Add message_templates column to tenant_settings
-- This allows tenants to customize their WhatsApp message templates

ALTER TABLE tenant_settings
ADD COLUMN IF NOT EXISTS message_templates JSONB DEFAULT '{
  "confirmation": null,
  "reminder_24h": null,
  "reminder_1h": null
}'::jsonb;

-- Add comment explaining the structure
COMMENT ON COLUMN tenant_settings.message_templates IS 'Personalized WhatsApp message templates. Structure: {"confirmation": "template...", "reminder_24h": "template...", "reminder_1h": "template..."}. If null, uses default template. Supports variables like {cliente_nome}, {servico_nome}, {data}, {hora}, etc.';


