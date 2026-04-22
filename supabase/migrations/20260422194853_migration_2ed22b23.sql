-- Adicionar campo SKU na tabela orders se não existir
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sku TEXT;