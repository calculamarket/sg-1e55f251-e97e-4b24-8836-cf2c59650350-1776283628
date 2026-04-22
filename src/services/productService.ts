import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Product = Tables<"products">;
export type ProductInsert = TablesInsert<"products">;

// Produtos
export async function getProducts() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .order("name");

  console.log("getProducts:", { data, error });
  if (error) throw error;
  return data || [];
}

export async function getProductBySku(sku: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.id)
    .eq("sku", sku)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function saveProduct(product: Omit<ProductInsert, "user_id" | "id">) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { data, error } = await supabase
    .from("products")
    .upsert({
      ...product,
      user_id: user.id,
      updated_at: new Date().toISOString()
    }, {
      onConflict: "user_id,sku"
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProduct(id: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;
}

// Análise de Lucro
export interface ProfitAnalysis {
  orderId: string;
  sku: string;
  productName: string;
  salePrice: number;
  costPrice: number;
  shippingCost: number;
  platformFee: number;
  otherCosts: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
}

export async function analyzeProfits(orders: any[]): Promise<ProfitAnalysis[]> {
  const products = await getProducts();
  const productMap = new Map(products.map(p => [p.sku, p]));

  return orders.map(order => {
    const product = productMap.get(order.sku || "");
    
    const salePrice = Number(order.total_value || 0);
    const costPrice = product ? Number(product.cost_price || 0) : 0;
    const shippingCost = product ? Number(product.shipping_cost || 0) : 0;
    const feePercent = product ? Number(product.platform_fee_percent || 0) : 0;
    const platformFee = salePrice * (feePercent / 100);
    const otherCosts = product ? Number(product.other_costs || 0) : 0;
    
    const totalCost = costPrice + shippingCost + platformFee + otherCosts;
    const profit = salePrice - totalCost;
    const profitMargin = salePrice > 0 ? (profit / salePrice) * 100 : 0;

    return {
      orderId: order.order_id,
      sku: order.sku || "",
      productName: order.product_name || "",
      salePrice,
      costPrice,
      shippingCost,
      platformFee,
      otherCosts,
      totalCost,
      profit,
      profitMargin
    };
  });
}

// Processar CSV do Mercado Livre
export interface MercadoLivreRow {
  orderNumber: string;
  date: string;
  sku: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  platformFee: number;
  shippingFee: number;
  customerName: string;
  status: string;
}

export function parseMercadoLivreCSV(csvText: string): MercadoLivreRow[] {
  const lines = csvText.split("\n");
  
  // Encontrar linha de cabeçalho (pula as primeiras linhas informativas)
  let headerIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("N.º de venda")) {
      headerIndex = i;
      break;
    }
  }

  const rows: MercadoLivreRow[] = [];
  
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Parse CSV (considerando campos entre aspas)
    const values = parseCSVLine(line);
    if (values.length < 20) continue;

    const orderNumber = values[0];
    if (!orderNumber || orderNumber === "N.º de venda") continue;

    rows.push({
      orderNumber,
      date: values[1],
      sku: values[21] || "", // Coluna SKU
      productName: values[25] || "", // Título do anúncio
      quantity: parseInt(values[7]) || 1,
      unitPrice: parsePrice(values[26]),
      totalValue: parsePrice(values[8]),
      platformFee: Math.abs(parsePrice(values[11])),
      shippingFee: Math.abs(parsePrice(values[13])),
      customerName: values[34] || "",
      status: values[3] || ""
    });
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  result.push(current.trim());
  return result;
}

function parsePrice(value: string): number {
  if (!value) return 0;
  // Remove aspas, pontos de milhar e converte vírgula em ponto
  const cleaned = value.replace(/["\s]/g, "").replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

// Importar pedidos do CSV
export async function importOrdersFromCSV(rows: MercadoLivreRow[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado");

  const ordersToInsert = rows.map(row => ({
    user_id: user.id,
    order_id: row.orderNumber,
    marketplace: "Mercado Livre",
    order_date: parseMercadoLivreDate(row.date),
    customer_name: row.customerName,
    product_name: row.productName,
    sku: row.sku,
    quantity: row.quantity,
    unit_price: row.unitPrice,
    total_value: row.totalValue,
    status: mapStatus(row.status)
  }));

  const { data, error } = await supabase
    .from("orders")
    .upsert(ordersToInsert, {
      onConflict: "user_id,order_id",
      ignoreDuplicates: false
    })
    .select();

  if (error) throw error;
  return data;
}

function parseMercadoLivreDate(dateStr: string): string {
  // Formato: "22 de abril de 2026 16:21 hs."
  const months: Record<string, string> = {
    janeiro: "01", fevereiro: "02", março: "03", abril: "04",
    maio: "05", junho: "06", julho: "07", agosto: "08",
    setembro: "09", outubro: "10", novembro: "11", dezembro: "12"
  };

  const match = dateStr.match(/(\d+) de (\w+) de (\d{4})/);
  if (!match) return new Date().toISOString();

  const day = match[1].padStart(2, "0");
  const month = months[match[2]] || "01";
  const year = match[3];

  return `${year}-${month}-${day}T00:00:00Z`;
}

function mapStatus(status: string): string {
  const statusMap: Record<string, string> = {
    "Processando": "processing",
    "Entregue": "completed",
    "A caminho": "shipped",
    "Vamos enviar": "pending",
    "Cancelada": "cancelled"
  };

  for (const [key, value] of Object.entries(statusMap)) {
    if (status.includes(key)) return value;
  }

  return "pending";
}