import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar última configuração Shopee
    const { data: configs } = await supabase
      .from("shopee_configs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (!configs || configs.length === 0) {
      return res.status(200).json({
        error: "Nenhuma configuração Shopee encontrada",
        hint: "Configure a Shopee primeiro na página de Configurações"
      });
    }

    const config = configs[0];

    // Preparar chamada à API Shopee
    const partnerId = config.partner_id;
    const partnerKey = config.partner_key;
    const shopId = config.shop_id;
    
    const path = "/api/v2/order/get_order_list";
    const timestamp = Math.floor(Date.now() / 1000);
    
    // Calcular HMAC
    const crypto = await import("crypto");
    const baseString = `${partnerId}${path}${timestamp}`;
    const sign = crypto
      .createHmac("sha256", partnerKey)
      .update(baseString)
      .digest("hex");

    // Período: últimos 15 dias
    const timeTo = Math.floor(Date.now() / 1000);
    const timeFrom = timeTo - (15 * 24 * 60 * 60);

    const shopeeUrl = `https://partner.shopeemobile.com${path}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}&shop_id=${shopId}&time_range_field=create_time&time_from=${timeFrom}&time_to=${timeTo}&page_size=50`;

    console.log("🔍 DEBUG - Chamando API Shopee:");
    console.log("📍 URL:", shopeeUrl);
    console.log("🔑 Partner ID:", partnerId);
    console.log("🏪 Shop ID:", shopId);
    console.log("📅 Timestamp:", timestamp);
    console.log("🔐 Sign:", sign);

    const shopeeResponse = await fetch(shopeeUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const shopeeData = await shopeeResponse.json();

    return res.status(200).json({
      success: true,
      apiStatus: shopeeResponse.status,
      apiStatusText: shopeeResponse.statusText,
      requestDetails: {
        partnerId,
        shopId,
        timestamp,
        sign,
        period: {
          from: new Date(timeFrom * 1000).toISOString(),
          to: new Date(timeTo * 1000).toISOString()
        }
      },
      shopeeResponse: shopeeData
    });

  } catch (error: any) {
    console.error("❌ Erro no debug:", error);
    return res.status(500).json({
      error: "Erro ao testar API Shopee",
      details: error.message,
      stack: error.stack
    });
  }
}