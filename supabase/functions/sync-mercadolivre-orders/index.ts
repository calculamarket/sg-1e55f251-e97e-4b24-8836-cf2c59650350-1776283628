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
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Buscar configuração do Mercado Livre do usuário
    const { data: config, error: configError } = await supabaseClient
      .from("mercadolivre_configs")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (configError || !config) {
      return new Response(JSON.stringify({ error: "Mercado Livre não configurado" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Buscar pedidos usando o Access Token
    const mlUrl = "https://api.mercadolibre.com/orders/search?seller=" + config.client_id + "&sort=date_desc&limit=50";
    
    const mlResponse = await fetch(mlUrl, {
      headers: {
        "Authorization": `Bearer ${config.access_token}`,
      },
    });

    if (!mlResponse.ok) {
      const errorData = await mlResponse.json();
      return new Response(JSON.stringify({ error: "Erro ao buscar pedidos do Mercado Livre", details: errorData }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const mlData = await mlResponse.json();
    const orders = mlData.results || [];

    // Processar pedidos
    const ordersToInsert = orders.map((order: any) => ({
      user_id: user.id,
      marketplace: "Mercado Livre",
      order_id: order.id.toString(),
      customer_name: order.buyer?.nickname || "Cliente ML",
      product_name: order.order_items?.map((item: any) => item.item.title).join(", ") || "Produto",
      total_amount: order.total_amount || 0,
      status: mapMLStatus(order.status),
      order_date: new Date(order.date_created).toISOString(),
    }));

    // Inserir pedidos no banco (com upsert para evitar duplicatas)
    if (ordersToInsert.length > 0) {
      const { error: insertError } = await supabaseClient
        .from("orders")
        .upsert(ordersToInsert, { onConflict: "user_id,order_id" });

      if (insertError) {
        console.error("Erro ao inserir pedidos:", insertError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        synced: ordersToInsert.length,
        message: `${ordersToInsert.length} pedidos sincronizados do Mercado Livre`
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Erro:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function mapMLStatus(status: string): string {
  const statusMap: Record<string, string> = {
    "confirmed": "processing",
    "payment_required": "pending",
    "payment_in_process": "pending",
    "partially_paid": "pending",
    "paid": "processing",
    "partially_refunded": "processing",
    "pending_cancel": "processing",
    "cancelled": "cancelled",
    "invalid": "cancelled",
    "shipped": "shipped",
    "delivered": "completed",
  };
  return statusMap[status] || "processing";
}