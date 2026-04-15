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
    console.log("🚀 Iniciando sync-shopee-orders");

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

    const body = await req.json();
    const days = body?.days || 15;
    console.log("📅 Período de busca: últimos", days, "dias");

    const { data: config, error: configError } = await supabaseClient
      .from("shopee_configs")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (configError || !config) {
      console.error("❌ Shopee não configurada:", configError);
      return new Response(JSON.stringify({ 
        error: "Shopee não configurada",
        details: "Por favor, configure as credenciais da Shopee na página de Configurações"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ Configuração Shopee encontrada");

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

    const timeFrom = Math.floor(Date.now() / 1000) - (days * 24 * 60 * 60);
    const timeTo = Math.floor(Date.now() / 1000);

    const shopeeUrl = `https://partner.shopeemobile.com${path}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}&shop_id=${shopId}&time_range_field=create_time&time_from=${timeFrom}&time_to=${timeTo}&page_size=50`;

    console.log("🔄 Buscando pedidos da Shopee...");
    console.log("📍 URL:", shopeeUrl);
    console.log("🔑 Partner ID:", partnerId);
    console.log("🏪 Shop ID:", shopId);
    console.log("📅 Período:", new Date(timeFrom * 1000).toISOString(), "até", new Date(timeTo * 1000).toISOString());

    const shopeeResponse = await fetch(shopeeUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📡 Status da resposta:", shopeeResponse.status, shopeeResponse.statusText);
    
    const shopeeData = await shopeeResponse.json();
    console.log("📦 Resposta completa Shopee:", JSON.stringify(shopeeData, null, 2));

    if (shopeeData.error) {
      console.error("❌ Erro da API Shopee:", shopeeData.error);
      console.error("❌ Mensagem:", shopeeData.message);
      return new Response(JSON.stringify({ 
        error: "Erro da API Shopee", 
        details: `${shopeeData.error}: ${shopeeData.message}`,
        shopeeResponse: shopeeData
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!shopeeData.response) {
      console.warn("⚠️ Resposta da Shopee não tem campo 'response'");
      console.log("📦 Dados recebidos:", shopeeData);
      return new Response(JSON.stringify({ 
        success: true,
        synced: 0,
        message: "Nenhum pedido encontrado (resposta vazia da API)",
        apiResponse: shopeeData
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderList = shopeeData.response?.order_list || [];
    console.log(`📋 ${orderList.length} pedidos encontrados na lista`);
    
    if (orderList.length === 0) {
      console.log("ℹ️ Nenhum pedido no período especificado");
      return new Response(JSON.stringify({ 
        success: true,
        synced: 0,
        message: `Nenhum pedido encontrado nos últimos ${days} dias`
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    const ordersToInsert = [];

    for (const orderSummary of orderList) {
      const orderSn = orderSummary.order_sn;
      
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
          total_value: order.total_amount / 100000,
          status: mapShopeeStatus(order.order_status),
          order_date: new Date(order.create_time * 1000).toISOString(),
        });
      }
    }

    console.log(`💾 Inserindo ${ordersToInsert.length} pedidos no banco...`);

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
        message: `${ordersToInsert.length} pedidos sincronizados da Shopee (últimos ${days} dias)`
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