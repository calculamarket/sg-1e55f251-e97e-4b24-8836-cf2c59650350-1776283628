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

    const results = {
      shopee: { success: false, synced: 0, error: null as string | null },
      mercadolivre: { success: false, synced: 0, error: null as string | null }
    };

    // Sincronizar Shopee
    console.log("🔄 Verificando configuração Shopee...");
    const { data: shopeeConfig } = await supabaseClient
      .from("shopee_configs")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (shopeeConfig) {
      console.log("✅ Shopee configurada, iniciando sincronização...");
      try {
        const shopeeResult = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/sync-shopee-orders`, {
          method: "POST",
          headers: {
            Authorization: req.headers.get("Authorization")!,
            "Content-Type": "application/json",
          },
        });

        const shopeeData = await shopeeResult.json();
        
        if (shopeeResult.ok) {
          results.shopee.success = true;
          results.shopee.synced = shopeeData.synced || 0;
          console.log(`✅ Shopee: ${shopeeData.synced} pedidos sincronizados`);
        } else {
          results.shopee.error = shopeeData.details || shopeeData.error || "Erro desconhecido";
          console.error("❌ Erro Shopee:", results.shopee.error);
        }
      } catch (error) {
        results.shopee.error = error.message;
        console.error("❌ Erro ao chamar sync-shopee:", error);
      }
    } else {
      results.shopee.error = "Shopee não configurada";
      console.log("⚠️ Shopee não configurada");
    }

    // Sincronizar Mercado Livre
    console.log("🔄 Verificando configuração Mercado Livre...");
    const { data: mlConfig } = await supabaseClient
      .from("mercadolivre_configs")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (mlConfig) {
      console.log("✅ Mercado Livre configurado, iniciando sincronização...");
      try {
        const mlResult = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/sync-mercadolivre-orders`, {
          method: "POST",
          headers: {
            Authorization: req.headers.get("Authorization")!,
            "Content-Type": "application/json",
          },
        });

        const mlData = await mlResult.json();
        
        if (mlResult.ok) {
          results.mercadolivre.success = true;
          results.mercadolivre.synced = mlData.synced || 0;
          console.log(`✅ Mercado Livre: ${mlData.synced} pedidos sincronizados`);
        } else {
          results.mercadolivre.error = mlData.details || mlData.error || "Erro desconhecido";
          console.error("❌ Erro Mercado Livre:", results.mercadolivre.error);
        }
      } catch (error) {
        results.mercadolivre.error = error.message;
        console.error("❌ Erro ao chamar sync-mercadolivre:", error);
      }
    } else {
      results.mercadolivre.error = "Mercado Livre não configurado";
      console.log("⚠️ Mercado Livre não configurado");
    }

    const totalSynced = results.shopee.synced + results.mercadolivre.synced;
    const hasErrors = results.shopee.error || results.mercadolivre.error;

    console.log("📊 Resultado final:", JSON.stringify(results, null, 2));

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sincronização concluída: ${totalSynced} pedidos no total`,
        synced: totalSynced,
        details: results,
        hasErrors
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