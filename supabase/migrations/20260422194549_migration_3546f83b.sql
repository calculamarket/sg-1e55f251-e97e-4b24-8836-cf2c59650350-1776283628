-- Criar tabela de produtos com SKU e custos
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sku TEXT NOT NULL,
  name TEXT NOT NULL,
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  shipping_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  platform_fee_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  other_costs NUMERIC(10,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT products_user_sku_unique UNIQUE(user_id, sku)
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);

-- RLS policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_products" ON products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own_products" ON products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_products" ON products
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own_products" ON products
  FOR DELETE USING (auth.uid() = user_id);

-- Adicionar SKU na tabela orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sku TEXT;
CREATE INDEX IF NOT EXISTS idx_orders_sku ON orders(sku);

COMMENT ON TABLE products IS 'Cadastro de produtos com custos para análise de lucro';
COMMENT ON COLUMN products.sku IS 'SKU do produto (identificador único)';
COMMENT ON COLUMN products.cost_price IS 'Preço de custo do produto';
COMMENT ON COLUMN products.shipping_cost IS 'Custo de envio estimado';
COMMENT ON COLUMN products.platform_fee_percent IS 'Percentual de taxa da plataforma';
COMMENT ON COLUMN products.other_costs IS 'Outros custos (embalagem, etc)';