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
    console.log("🚀 Iniciando sync-all-marketplaces");

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

    const body = await req.json().catch(() => ({}));
    const days = body?.days || 15;
    console.log("📅 Período de busca: últimos", days, "dias");

    console.log("🔍 Buscando configurações dos marketplaces...");
    
    const { data: shopeeConfig } = await supabaseClient
      .from("shopee_configs")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    const { data: mlConfig } = await supabaseClient
      .from("mercadolivre_configs")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    console.log("🏪 Shopee configurado:", !!shopeeConfig);
    console.log("🛒 Mercado Livre configurado:", !!mlConfig);

    if (!shopeeConfig && !mlConfig) {
      console.warn("⚠️ Nenhum marketplace configurado");
      return new Response(
        JSON.stringify({
          success: false,
          message: "Nenhum marketplace configurado. Configure as credenciais na página de Configurações.",
          results: {
            shopee: { success: false, message: "Não configurado" },
            mercadolivre: { success: false, message: "Não configurado" }
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results = {
      shopee: { success: false, message: "", synced: 0 },
      mercadolivre: { success: false, message: "", synced: 0 }
    };

    let totalSynced = 0;

    if (shopeeConfig) {
      console.log("🔄 Sincronizando Shopee...");
      try {
        const shopeeRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/sync-shopee-orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": req.headers.get("Authorization")!,
          },
          body: JSON.stringify({ days }),
        });

        const shopeeData = await shopeeRes.json();
        console.log("📦 Resultado Shopee:", shopeeData);
        
        if (shopeeData.success) {
          results.shopee = { success: true, message: shopeeData.message, synced: shopeeData.synced || 0 };
          totalSynced += shopeeData.synced || 0;
        } else {
          results.shopee = { success: false, message: shopeeData.error || shopeeData.message, synced: 0 };
        }
      } catch (error: any) {
        console.error("❌ Erro ao sincronizar Shopee:", error);
        results.shopee = { success: false, message: error.message, synced: 0 };
      }
    } else {
      results.shopee = { success: false, message: "Shopee não configurado", synced: 0 };
    }

    if (mlConfig) {
      console.log("🔄 Sincronizando Mercado Livre...");
      try {
        const mlRes = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/sync-mercadolivre-orders`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": req.headers.get("Authorization")!,
          },
          body: JSON.stringify({ days }),
        });

        const mlData = await mlRes.json();
        console.log("📦 Resultado Mercado Livre:", mlData);
        
        if (mlData.success) {
          results.mercadolivre = { success: true, message: mlData.message, synced: mlData.synced || 0 };
          totalSynced += mlData.synced || 0;
        } else {
          results.mercadolivre = { success: false, message: mlData.error || mlData.message, synced: 0 };
        }
      } catch (error: any) {
        console.error("❌ Erro ao sincronizar Mercado Livre:", error);
        results.mercadolivre = { success: false, message: error.message, synced: 0 };
      }
    } else {
      results.mercadolivre = { success: false, message: "Mercado Livre não configurado", synced: 0 };
    }

    console.log("✅ Sincronização geral concluída!");

    return new Response(
      JSON.stringify({
        success: true,
        message: `${totalSynced} pedidos sincronizados (Shopee: ${results.shopee.synced}, ML: ${results.mercadolivre.synced})`,
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("❌ Erro geral:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro interno no servidor",
        details: error.message 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});