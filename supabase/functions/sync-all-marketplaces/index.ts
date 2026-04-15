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

    const results = {
      shopee: { success: false, synced: 0, error: null as string | null },
      mercadolivre: { success: false, synced: 0, error: null as string | null },
    };

    // Sincronizar Shopee
    try {
      const shopeeResponse = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/sync-shopee-orders`,
        {
          method: "POST",
          headers: {
            "Authorization": req.headers.get("Authorization")!,
            "Content-Type": "application/json",
          },
        }
      );

      if (shopeeResponse.ok) {
        const shopeeData = await shopeeResponse.json();
        results.shopee = { success: true, synced: shopeeData.synced || 0, error: null };
      } else {
        const errorData = await shopeeResponse.json();
        results.shopee.error = errorData.error || "Erro desconhecido";
      }
    } catch (error) {
      results.shopee.error = error.message;
    }

    // Sincronizar Mercado Livre
    try {
      const mlResponse = await fetch(
        `${Deno.env.get("SUPABASE_URL")}/functions/v1/sync-mercadolivre-orders`,
        {
          method: "POST",
          headers: {
            "Authorization": req.headers.get("Authorization")!,
            "Content-Type": "application/json",
          },
        }
      );

      if (mlResponse.ok) {
        const mlData = await mlResponse.json();
        results.mercadolivre = { success: true, synced: mlData.synced || 0, error: null };
      } else {
        const errorData = await mlResponse.json();
        results.mercadolivre.error = errorData.error || "Erro desconhecido";
      }
    } catch (error) {
      results.mercadolivre.error = error.message;
    }

    // Atualizar métricas
    const totalSynced = results.shopee.synced + results.mercadolivre.synced;
    
    if (totalSynced > 0) {
      // Calcular métricas do dia
      const today = new Date().toISOString().split('T')[0];
      
      const { data: orders } = await supabaseClient
        .from("orders")
        .select("*")
        .eq("user_id", user.id)
        .gte("order_date", today);

      if (orders && orders.length > 0) {
        const shopeeOrders = orders.filter(o => o.marketplace === "Shopee");
        const mlOrders = orders.filter(o => o.marketplace === "Mercado Livre");

        const metrics = [
          {
            user_id: user.id,
            marketplace: "Shopee",
            metric_date: today,
            total_orders: shopeeOrders.length,
            total_sales: shopeeOrders.reduce((sum, o) => sum + o.total_amount, 0),
            average_ticket: shopeeOrders.length > 0 
              ? shopeeOrders.reduce((sum, o) => sum + o.total_amount, 0) / shopeeOrders.length 
              : 0,
          },
          {
            user_id: user.id,
            marketplace: "Mercado Livre",
            metric_date: today,
            total_orders: mlOrders.length,
            total_sales: mlOrders.reduce((sum, o) => sum + o.total_amount, 0),
            average_ticket: mlOrders.length > 0 
              ? mlOrders.reduce((sum, o) => sum + o.total_amount, 0) / mlOrders.length 
              : 0,
          },
        ];

        await supabaseClient
          .from("sales_metrics")
          .upsert(metrics, { onConflict: "user_id,marketplace,metric_date" });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        results,
        total_synced: totalSynced,
        message: `Total de ${totalSynced} pedidos sincronizados`
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