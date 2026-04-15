-- RLS para mercadolivre_configs (T1 - dados privados do usuário)
ALTER TABLE mercadolivre_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_ml_config" ON mercadolivre_configs 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own_ml_config" ON mercadolivre_configs 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_ml_config" ON mercadolivre_configs 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own_ml_config" ON mercadolivre_configs 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS para shopee_configs (T1 - dados privados do usuário)
ALTER TABLE shopee_configs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_shopee_config" ON shopee_configs 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own_shopee_config" ON shopee_configs 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_shopee_config" ON shopee_configs 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own_shopee_config" ON shopee_configs 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS para orders (T1 - dados privados do usuário)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_orders" ON orders 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own_orders" ON orders 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_orders" ON orders 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own_orders" ON orders 
  FOR DELETE USING (auth.uid() = user_id);

-- RLS para sales_metrics (T1 - dados privados do usuário)
ALTER TABLE sales_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "select_own_metrics" ON sales_metrics 
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "insert_own_metrics" ON sales_metrics 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "update_own_metrics" ON sales_metrics 
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "delete_own_metrics" ON sales_metrics 
  FOR DELETE USING (auth.uid() = user_id);