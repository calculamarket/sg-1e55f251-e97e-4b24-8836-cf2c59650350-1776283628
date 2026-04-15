import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🚀 Iniciando sync-mercadolivre-orders");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      console.error("❌ Usuário não autenticado");
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ Usuário autenticado:", user.id);

    // Buscar configuração do Mercado Livre do usuário
    const { data: config, error: configError } = await supabaseClient
      .from("mercadolivre_configs")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (configError || !config) {
      console.error("❌ Mercado Livre não configurado:", configError);
      return new Response(JSON.stringify({ 
        error: "Mercado Livre não configurado",
        details: "Por favor, configure as credenciais do Mercado Livre na página de Configurações"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ Configuração Mercado Livre encontrada");

    // Buscar pedidos dos últimos 30 dias
    const mlUrl = `https://api.mercadolibre.com/orders/search?seller=${config.client_id}&access_token=${config.access_token}`;

    console.log("🔄 Buscando pedidos do Mercado Livre...");

    const mlResponse = await fetch(mlUrl);
    const mlData = await mlResponse.json();

    console.log("📦 Resposta Mercado Livre:", JSON.stringify(mlData, null, 2));

    if (mlData.error) {
      console.error("❌ Erro da API Mercado Livre:", mlData);
      return new Response(JSON.stringify({ 
        error: "Erro ao buscar pedidos do Mercado Livre",
        details: mlData.message || mlData.error,
        mlError: mlData
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orders = mlData.results || [];
    console.log(`📋 ${orders.length} pedidos encontrados`);

    const ordersToInsert = orders.map((order: any) => ({
      user_id: user.id,
      marketplace: "Mercado Livre",
      order_id: order.id.toString(),
      customer_name: order.buyer?.nickname || "Cliente ML",
      product_name: order.order_items?.map((item: any) => item.item.title).join(", ") || "Produto",
      total_value: order.total_amount,
      status: mapMercadoLivreStatus(order.status),
      order_date: new Date(order.date_created).toISOString(),
    }));

    console.log(`💾 Inserindo ${ordersToInsert.length} pedidos no banco...`);

    // Inserir pedidos no banco (com upsert para evitar duplicatas)
    if (ordersToInsert.length > 0) {
      const { error: insertError } = await supabaseClient
        .from("orders")
        .upsert(ordersToInsert, { onConflict: "user_id,marketplace,order_id" });

      if (insertError) {
        console.error("❌ Erro ao inserir pedidos:", insertError);
        return new Response(JSON.stringify({ 
          error: "Erro ao salvar pedidos no banco",
          details: insertError.message
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    console.log("✅ Sincronização concluída com sucesso!");

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: ordersToInsert.length,
        message: `${ordersToInsert.length} pedidos sincronizados do Mercado Livre`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Erro geral:", error);
    return new Response(JSON.stringify({ 
      error: "Erro interno no servidor",
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function mapMercadoLivreStatus(status: string): string {
  const statusMap: Record<string, string> = {
    "confirmed": "processing",
    "payment_required": "pending",
    "payment_in_process": "pending",
    "partially_paid": "processing",
    "paid": "processing",
    "cancelled": "cancelled",
    "shipped": "shipped",
    "delivered": "completed",
  };
  return statusMap[status] || "processing";
}