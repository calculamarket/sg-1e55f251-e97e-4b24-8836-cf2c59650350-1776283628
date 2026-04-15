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

    // Buscar configuração da Shopee do usuário
    const { data: config, error: configError } = await supabaseClient
      .from("shopee_configs")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (configError || !config) {
      return new Response(JSON.stringify({ error: "Shopee não configurada" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gerar assinatura HMAC SHA256 para autenticação Shopee
    const timestamp = Math.floor(Date.now() / 1000);
    const path = "/api/v2/order/get_order_list";
    const partnerId = config.partner_id;
    const partnerKey = config.partner_key;
    const shopId = config.shop_id;

    const baseString = `${partnerId}${path}${timestamp}`;
    const encoder = new TextEncoder();
    const keyData = encoder.encode(partnerKey);
    const messageData = encoder.encode(baseString);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData);
    const sign = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");

    // Buscar pedidos dos últimos 15 dias
    const timeFrom = Math.floor(Date.now() / 1000) - (15 * 24 * 60 * 60);
    const timeTo = Math.floor(Date.now() / 1000);

    const shopeeUrl = `https://partner.shopeemobile.com${path}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}&shop_id=${shopId}&time_range_field=create_time&time_from=${timeFrom}&time_to=${timeTo}&page_size=50`;

    const shopeeResponse = await fetch(shopeeUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const shopeeData = await shopeeResponse.json();

    if (shopeeData.error) {
      return new Response(JSON.stringify({ error: "Erro ao buscar pedidos da Shopee", details: shopeeData }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Buscar detalhes de cada pedido
    const orderList = shopeeData.response?.order_list || [];
    const ordersToInsert = [];

    for (const orderSummary of orderList) {
      const orderSn = orderSummary.order_sn;
      
      // Buscar detalhes do pedido
      const detailPath = "/api/v2/order/get_order_detail";
      const detailBaseString = `${partnerId}${detailPath}${timestamp}`;
      const detailMessageData = encoder.encode(detailBaseString);
      const detailSignature = await crypto.subtle.sign("HMAC", cryptoKey, detailMessageData);
      const detailSign = Array.from(new Uint8Array(detailSignature))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("");

      const detailUrl = `https://partner.shopeemobile.com${detailPath}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${detailSign}&shop_id=${shopId}&order_sn_list=${orderSn}`;
      
      const detailResponse = await fetch(detailUrl);
      const detailData = await detailResponse.json();

      if (detailData.response?.order_list?.[0]) {
        const order = detailData.response.order_list[0];
        
        ordersToInsert.push({
          user_id: user.id,
          marketplace: "Shopee",
          order_id: order.order_sn,
          customer_name: order.buyer_username || "Cliente Shopee",
          product_name: order.item_list?.map((item: any) => item.item_name).join(", ") || "Produto",
          total_amount: order.total_amount / 100000, // Shopee retorna em centavos
          status: mapShopeeStatus(order.order_status),
          order_date: new Date(order.create_time * 1000).toISOString(),
        });
      }
    }

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
        message: `${ordersToInsert.length} pedidos sincronizados da Shopee`
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

function mapShopeeStatus(status: string): string {
  const statusMap: Record<string, string> = {
    "UNPAID": "pending",
    "READY_TO_SHIP": "processing",
    "PROCESSED": "processing",
    "SHIPPED": "shipped",
    "TO_CONFIRM_RECEIVE": "shipped",
    "COMPLETED": "completed",
    "CANCELLED": "cancelled",
    "INVOICE_PENDING": "pending",
  };
  return statusMap[status] || "processing";
}