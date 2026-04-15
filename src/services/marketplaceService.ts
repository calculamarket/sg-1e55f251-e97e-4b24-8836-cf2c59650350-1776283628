import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type MercadoLivreConfig = Tables<"mercadolivre_configs">;
export type ShopeeConfig = Tables<"shopee_configs">;
export type Order = Tables<"orders">;
export type SalesMetric = Tables<"sales_metrics">;

// Mercado Livre Config
export async function getMercadoLivreConfig() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("mercadolivre_configs")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveMercadoLivreConfig(config: {
  client_id: string;
  client_secret: string;
  access_token: string;
  refresh_token?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("mercadolivre_configs")
    .upsert({
      user_id: user.id,
      ...config,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Shopee Config
export async function getShopeeConfig() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("shopee_configs")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveShopeeConfig(config: {
  partner_id: string;
  partner_key: string;
  shop_id: string;
  access_token?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("shopee_configs")
    .upsert({
      user_id: user.id,
      ...config,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Orders
export async function getOrders(filters?: {
  marketplace?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  let query = supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id)
    .order("order_date", { ascending: false });

  if (filters?.marketplace && filters.marketplace !== "all") {
    query = query.eq("marketplace", filters.marketplace);
  }

  if (filters?.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters?.startDate) {
    query = query.gte("order_date", filters.startDate);
  }

  if (filters?.endDate) {
    query = query.lte("order_date", filters.endDate);
  }

  const { data, error } = await query;
  console.log("getOrders:", { data, error });

  if (error) throw error;
  return data || [];
}

// Sales Metrics
export async function getSalesMetrics(days: number = 30) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("sales_metrics")
    .select("*")
    .eq("user_id", user.id)
    .gte("metric_date", startDate.toISOString().split("T")[0])
    .order("metric_date", { ascending: true });

  console.log("getSalesMetrics:", { data, error });

  if (error) throw error;
  return data || [];
}

export async function getDashboardMetrics() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  // Buscar métricas do mês atual
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  
  const { data, error } = await supabase
    .from("sales_metrics")
    .select("*")
    .eq("user_id", user.id)
    .gte("metric_date", firstDay.toISOString().split("T")[0])
    .order("metric_date", { ascending: false });

  console.log("getDashboardMetrics:", { data, error });

  if (error) throw error;

  const metrics = data || [];
  
  // Agregar por marketplace
  const aggregated = {
    total: { sales: 0, orders: 0, ticket: 0, conversion: 0 },
    mercadolivre: { sales: 0, orders: 0, ticket: 0, conversion: 0 },
    shopee: { sales: 0, orders: 0, ticket: 0, conversion: 0 }
  };

  metrics.forEach(metric => {
    const key = metric.marketplace === "Mercado Livre" ? "mercadolivre" 
              : metric.marketplace === "Shopee" ? "shopee" 
              : "total";
    
    aggregated[key].sales += Number(metric.total_sales || 0);
    aggregated[key].orders += metric.total_orders || 0;
  });

  // Calcular tickets médios
  Object.keys(aggregated).forEach(key => {
    const metrics = aggregated[key as keyof typeof aggregated];
    if (metrics.orders > 0) {
      metrics.ticket = metrics.sales / metrics.orders;
    }
  });

  return aggregated;
}