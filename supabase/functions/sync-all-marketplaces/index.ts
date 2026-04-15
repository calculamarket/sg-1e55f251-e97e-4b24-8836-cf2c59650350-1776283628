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
      return new Response(JSON.stringify({ 
        error: "Unauthorized",
        details: "Usuário não autenticado" 
      }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("✅ Usuário autenticado:", user.id);

    const results = {
      shopee: { success: false, message: "", synced: 0 },
      mercadolivre: { success: false, message: "", synced: 0 }
    };

    // Verificar configuração Shopee
    console.log("🔍 Verificando configuração Shopee...");
    const { data: shopeeConfig } = await supabaseClient
      .from("shopee_configs")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (shopeeConfig) {
      console.log("✅ Shopee configurada, iniciando sincronização...");
      try {
        const { data: shopeeResult, error: shopeeError } = await supabaseClient.functions.invoke(
          "sync-shopee-orders",
          {
            headers: {
              Authorization: req.headers.get("Authorization")!,
            },
          }
        );

        if (shopeeError) {
          console.error("❌ Erro Shopee:", shopeeError);
          results.shopee.message = shopeeError.message || "Erro ao sincronizar Shopee";
        } else {
          console.log("✅ Shopee sincronizada:", shopeeResult);
          results.shopee.success = true;
          results.shopee.synced = shopeeResult?.synced || 0;
          results.shopee.message = shopeeResult?.message || "Sincronizado com sucesso";
        }
      } catch (err) {
        console.error("❌ Erro catch Shopee:", err);
        results.shopee.message = err.message || "Erro ao sincronizar Shopee";
      }
    } else {
      console.log("⚠️ Shopee não configurada");
      results.shopee.message = "Shopee não configurada";
    }

    // Verificar configuração Mercado Livre
    console.log("🔍 Verificando configuração Mercado Livre...");
    const { data: mlConfig } = await supabaseClient
      .from("mercadolivre_configs")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (mlConfig) {
      console.log("✅ Mercado Livre configurado, iniciando sincronização...");
      try {
        const { data: mlResult, error: mlError } = await supabaseClient.functions.invoke(
          "sync-mercadolivre-orders",
          {
            headers: {
              Authorization: req.headers.get("Authorization")!,
            },
          }
        );

        if (mlError) {
          console.error("❌ Erro Mercado Livre:", mlError);
          results.mercadolivre.message = mlError.message || "Erro ao sincronizar Mercado Livre";
        } else {
          console.log("✅ Mercado Livre sincronizado:", mlResult);
          results.mercadolivre.success = true;
          results.mercadolivre.synced = mlResult?.synced || 0;
          results.mercadolivre.message = mlResult?.message || "Sincronizado com sucesso";
        }
      } catch (err) {
        console.error("❌ Erro catch Mercado Livre:", err);
        results.mercadolivre.message = err.message || "Erro ao sincronizar Mercado Livre";
      }
    } else {
      console.log("⚠️ Mercado Livre não configurado");
      results.mercadolivre.message = "Mercado Livre não configurado";
    }

    const totalSynced = results.shopee.synced + results.mercadolivre.synced;
    const message = `${totalSynced} pedidos sincronizados (Shopee: ${results.shopee.synced}, ML: ${results.mercadolivre.synced})`;

    console.log("✅ Sincronização completa:", message);

    return new Response(
      JSON.stringify({
        success: true,
        message,
        results,
        synced: totalSynced
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error("❌ Erro geral:", error);
    return new Response(
      JSON.stringify({ 
        error: "Erro interno no servidor",
        details: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});