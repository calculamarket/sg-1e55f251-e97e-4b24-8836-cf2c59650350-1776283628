import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type MercadoLivreConfig = Tables<"mercadolivre_configs">;
export type ShopeeConfig = Tables<"shopee_configs">;
export type Order = Tables<"orders">;
export type SalesMetric = Tables<"sales_metrics">;

export interface DashboardMetrics {
  totalSales: number;
  totalOrders: number;
  totalProfit: number;
  averageTicket: number;
  salesByMarketplace: Record<string, number>;
  ordersCount: Record<string, number>;
  profitMargin: number;
}

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

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  // Buscar todos os pedidos
  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", user.id);

  if (ordersError) throw ordersError;

  // Buscar produtos para calcular lucro
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id);

  if (productsError) throw productsError;

  const productMap = new Map(products?.map(p => [p.sku, p]) || []);

  let totalSales = 0;
  let totalProfit = 0;
  const salesByMarketplace: Record<string, number> = {};
  const ordersCount: Record<string, number> = {};

  (orders || []).forEach(order => {
    const saleValue = Number(order.total_value || 0);
    totalSales += saleValue;

    // Contadores por marketplace
    const marketplace = order.marketplace || "Outros";
    salesByMarketplace[marketplace] = (salesByMarketplace[marketplace] || 0) + saleValue;
    ordersCount[marketplace] = (ordersCount[marketplace] || 0) + 1;

    // Calcular lucro se produto estiver cadastrado
    const product = productMap.get(order.sku || "");
    if (product) {
      const costPrice = Number(product.cost_price || 0);
      const shippingCost = Number(product.shipping_cost || 0);
      const feePercent = Number(product.platform_fee_percent || 0);
      const platformFee = saleValue * (feePercent / 100);
      const otherCosts = Number(product.other_costs || 0);
      const totalCost = costPrice + shippingCost + platformFee + otherCosts;
      totalProfit += saleValue - totalCost;
    }
  });

  const totalOrders = orders?.length || 0;
  const averageTicket = totalOrders > 0 ? totalSales / totalOrders : 0;
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

  return {
    totalSales,
    totalOrders,
    totalProfit,
    averageTicket,
    salesByMarketplace,
    ordersCount,
    profitMargin
  };
}

// Sincronização de pedidos
export async function syncShopeeOrders(days: number = 15) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Usuário não autenticado");
  }

  console.log(`Iniciando sincronização Shopee (${days} dias)...`);

  const { data, error } = await supabase.functions.invoke("sync-shopee-orders", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: { days },
  });

  console.log("Resposta Shopee:", { data, error });

  if (error) {
    console.error("Erro detalhado Shopee:", JSON.stringify(error, null, 2));
    const errorMsg = error.context?.body?.details || error.context?.body?.error || error.message;
    throw new Error(errorMsg || "Erro ao sincronizar pedidos da Shopee");
  }
  
  return data;
}

export async function syncMercadoLivreOrders(days: number = 15) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Usuário não autenticado");
  }

  console.log(`Iniciando sincronização Mercado Livre (${days} dias)...`);

  const { data, error } = await supabase.functions.invoke("sync-mercadolivre-orders", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: { days },
  });

  console.log("Resposta Mercado Livre:", { data, error });

  if (error) {
    console.error("Erro detalhado Mercado Livre:", JSON.stringify(error, null, 2));
    const errorMsg = error.context?.body?.details || error.context?.body?.error || error.message;
    throw new Error(errorMsg || "Erro ao sincronizar pedidos do Mercado Livre");
  }
  
  return data;
}

export async function syncAllMarketplaces(days: number = 15) {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("Usuário não autenticado");
  }

  console.log(`Iniciando sincronização de todos marketplaces (${days} dias)...`);

  const { data, error } = await supabase.functions.invoke("sync-all-marketplaces", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
    body: { days },
  });

  console.log("Resposta sincronização geral:", { data, error });

  if (error) {
    console.error("❌ Erro completo sync-all:", JSON.stringify(error, null, 2));
    const errorMsg = error.context?.body?.details || error.context?.body?.error || error.message;
    throw new Error(errorMsg || "Erro ao sincronizar marketplaces");
  }
  
  return data;
}