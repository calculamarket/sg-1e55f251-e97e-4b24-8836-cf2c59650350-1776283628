-- Verificar e corrigir constraint única na tabela shopee_configs
ALTER TABLE shopee_configs DROP CONSTRAINT IF EXISTS shopee_configs_user_id_key;
ALTER TABLE shopee_configs ADD CONSTRAINT shopee_configs_user_id_unique UNIQUE (user_id);

-- Verificar e corrigir constraint única na tabela mercadolivre_configs
ALTER TABLE mercadolivre_configs DROP CONSTRAINT IF EXISTS mercadolivre_configs_user_id_key;
ALTER TABLE mercadolivre_configs ADD CONSTRAINT mercadolivre_configs_user_id_unique UNIQUE (user_id);