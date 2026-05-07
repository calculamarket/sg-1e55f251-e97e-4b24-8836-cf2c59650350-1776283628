import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Key, RefreshCw, ShoppingBag, Package, Bug } from "lucide-react";
import {
  getMercadoLivreConfig,
  saveMercadoLivreConfig,
  getShopeeConfig,
  saveShopeeConfig,
  syncShopeeOrders,
  syncMercadoLivreOrders,
  syncAllMarketplaces
} from "@/services/marketplaceService";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MercadoLivreConfig {
  client_id: string;
  client_secret: string;
  access_token: string;
}

interface ShopeeConfig {
  partner_id: string;
  partner_key: string;
  shop_id: string;
}

export default function Settings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"ml" | "shopee" | null>(null);
  const [mercadoLivre, setMercadoLivre] = useState<MercadoLivreConfig>({
    client_id: "",
    client_secret: "",
    access_token: ""
  });
  const [shopee, setShopee] = useState<ShopeeConfig>({
    partner_id: "",
    partner_key: "",
    shop_id: ""
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncPeriod, setSyncPeriod] = useState("15"); // dias

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    try {
      const [mlConfig, shopeeConfig] = await Promise.all([
        getMercadoLivreConfig(),
        getShopeeConfig()
      ]);

      if (mlConfig) {
        setMercadoLivre({
          client_id: mlConfig.client_id,
          client_secret: mlConfig.client_secret,
          access_token: mlConfig.access_token
        });
      }

      if (shopeeConfig) {
        setShopee({
          partner_id: shopeeConfig.partner_id,
          partner_key: shopeeConfig.partner_key,
          shop_id: shopeeConfig.shop_id
        });
      }
    } catch (error: any) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMercadoLivre = async () => {
    if (!mercadoLivre.client_id || !mercadoLivre.client_secret || !mercadoLivre.access_token) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos do Mercado Livre",
        variant: "destructive"
      });
      return;
    }

    setSaving("ml");
    try {
      await saveMercadoLivreConfig(mercadoLivre);
      toast({
        title: "Configuração salva",
        description: "Credenciais do Mercado Livre foram salvas com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(null);
    }
  };

  const handleSaveShopee = async () => {
    if (!shopee.partner_id || !shopee.partner_key || !shopee.shop_id) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos da Shopee",
        variant: "destructive"
      });
      return;
    }

    setSaving("shopee");
    try {
      await saveShopeeConfig(shopee);
      toast({
        title: "Configuração salva",
        description: "Credenciais da Shopee foram salvas com sucesso"
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(null);
    }
  };

  const handleSyncShopee = async () => {
    setIsSyncing(true);
    try {
      console.log(`🚀 Iniciando sincronização Shopee (últimos ${syncPeriod} dias)...`);
      const result = await syncShopeeOrders(Number(syncPeriod));
      console.log("✅ Resultado sincronização:", result);
      
      const message = result.synced > 0 
        ? `${result.synced} pedidos sincronizados da Shopee`
        : "Nenhum pedido encontrado no período selecionado";
      
      toast({
        title: result.synced > 0 ? "Sincronização concluída" : "Nenhum pedido encontrado",
        description: message,
        variant: result.synced > 0 ? "default" : "default",
      });
    } catch (error: any) {
      console.error("❌ Erro completo:", error);
      console.error("❌ Erro JSON:", JSON.stringify(error, null, 2));
      
      let errorMessage = "Erro desconhecido na sincronização";
      
      if (error.context?.body) {
        const body = error.context.body;
        errorMessage = body.details || body.error || body.message || JSON.stringify(body);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro na sincronização da Shopee",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncMercadoLivre = async () => {
    setIsSyncing(true);
    try {
      console.log(`🚀 Iniciando sincronização Mercado Livre (últimos ${syncPeriod} dias)...`);
      const result = await syncMercadoLivreOrders(Number(syncPeriod));
      console.log("✅ Resultado sincronização:", result);
      
      const message = result.synced > 0 
        ? `${result.synced} pedidos sincronizados do Mercado Livre`
        : "Nenhum pedido encontrado no período selecionado";
      
      toast({
        title: result.synced > 0 ? "Sincronização concluída" : "Nenhum pedido encontrado",
        description: message,
      });
    } catch (error: any) {
      console.error("❌ Erro completo:", error);
      console.error("❌ Erro JSON:", JSON.stringify(error, null, 2));
      
      let errorMessage = "Erro desconhecido na sincronização";
      
      if (error.context?.body) {
        const body = error.context.body;
        errorMessage = body.details || body.error || body.message || JSON.stringify(body);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro na sincronização do Mercado Livre",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      console.log(`🚀 Iniciando sincronização de todos marketplaces (últimos ${syncPeriod} dias)...`);
      const result = await syncAllMarketplaces(Number(syncPeriod));
      console.log("✅ Resultado sincronização:", result);
      
      // Mostrar detalhes de cada marketplace
      const shopeeMsg = result.results?.shopee?.success 
        ? `Shopee: ${result.results.shopee.synced} pedidos`
        : `Shopee: ${result.results?.shopee?.message || "Erro"}`;
      
      const mlMsg = result.results?.mercadolivre?.success 
        ? `ML: ${result.results.mercadolivre.synced} pedidos`
        : `ML: ${result.results?.mercadolivre?.message || "Erro"}`;
      
      const hasErrors = !result.results?.shopee?.success || !result.results?.mercadolivre?.success;
      
      toast({
        title: hasErrors ? "Sincronização com avisos" : "Sincronização concluída",
        description: (
          <div className="space-y-1">
            <p>{result.message}</p>
            <p className="text-sm">{shopeeMsg}</p>
            <p className="text-sm">{mlMsg}</p>
          </div>
        ),
        variant: hasErrors ? "default" : "default",
      });
    } catch (error: any) {
      console.error("❌ Erro completo:", error);
      console.error("❌ Erro JSON:", JSON.stringify(error, null, 2));
      
      let errorMessage = "Erro desconhecido na sincronização";
      
      if (error.context?.body) {
        const body = error.context.body;
        errorMessage = body.details || body.error || body.message || JSON.stringify(body);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro na sincronização",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDebugShopee = async () => {
    try {
      const response = await fetch("/api/debug-shopee");
      const result = await response.json();
      
      console.log("🐛 DEBUG SHOPEE - Resultado completo:");
      console.log(JSON.stringify(result, null, 2));
      
      if (result.shopeeResponse?.error) {
        toast({
          title: "⚠️ Erro da API Shopee",
          description: (
            <div className="space-y-2">
              <p className="font-semibold">Erro: {result.shopeeResponse.error}</p>
              <p className="text-sm">{result.shopeeResponse.message || "Verifique suas credenciais"}</p>
              <p className="text-xs text-muted-foreground">Abra o Console (F12) para ver detalhes completos</p>
            </div>
          ),
          variant: "destructive",
        });
      } else if (result.shopeeResponse?.response) {
        const orderCount = result.shopeeResponse.response.order_list?.length || 0;
        toast({
          title: "✅ API Shopee OK",
          description: `${orderCount} pedidos encontrados. Veja detalhes no Console (F12)`,
        });
      } else {
        toast({
          title: "🔍 Resposta inesperada",
          description: "Abra o Console (F12) para ver a resposta completa da API",
        });
      }
    } catch (error: any) {
      console.error("❌ Erro no debug:", error);
      toast({
        title: "Erro ao testar API",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isMercadoLivreConfigured = mercadoLivre.client_id && mercadoLivre.client_secret && mercadoLivre.access_token;
  const isShopeeConfigured = shopee.partner_id && shopee.partner_key && shopee.shop_id;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando configurações...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <>
      <SEO 
        title="Configurações - API Marketplaces"
        description="Configure as credenciais de API do Mercado Livre e Shopee"
      />
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <div className="xp-chip mb-4">Connections</div>
              <h1 className="xp-page-title">Configurações</h1>
              <div className="xp-divider" />
              <p className="text-muted-foreground">Configure as credenciais de API dos marketplaces</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Período:</label>
                <Select value={syncPeriod} onValueChange={setSyncPeriod}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">Últimos 7 dias</SelectItem>
                    <SelectItem value="15">Últimos 15 dias</SelectItem>
                    <SelectItem value="30">Últimos 30 dias</SelectItem>
                    <SelectItem value="60">Últimos 60 dias</SelectItem>
                    <SelectItem value="90">Últimos 90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleSyncAll} disabled={isSyncing} className="gap-2">
                <RefreshCw className={cn("h-4 w-4", isSyncing && "animate-spin")} />
                Sincronizar Tudo
              </Button>
            </div>
          </div>

          <div className="grid gap-6">
            <Card className="border-0 bg-white p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--xp-lemon)]">
                    <Key className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold font-heading">Mercado Livre</h2>
                    <p className="text-sm text-muted-foreground">Configure as credenciais da API</p>
                  </div>
                </div>
                <Badge variant={isMercadoLivreConfigured ? "default" : "secondary"} className="gap-1">
                  {isMercadoLivreConfigured ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Configurado
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      Não configurado
                    </>
                  )}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="ml-client-id">Client ID</Label>
                  <Input
                    id="ml-client-id"
                    type="text"
                    placeholder="Digite o Client ID"
                    value={mercadoLivre.client_id}
                    onChange={(e) => setMercadoLivre({ ...mercadoLivre, client_id: e.target.value })}
                    disabled={saving === "ml"}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ml-client-secret">Client Secret</Label>
                  <Input
                    id="ml-client-secret"
                    type="password"
                    placeholder="Digite o Client Secret"
                    value={mercadoLivre.client_secret}
                    onChange={(e) => setMercadoLivre({ ...mercadoLivre, client_secret: e.target.value })}
                    disabled={saving === "ml"}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ml-access-token">Access Token</Label>
                  <Input
                    id="ml-access-token"
                    type="password"
                    placeholder="Digite o Access Token"
                    value={mercadoLivre.access_token}
                    onChange={(e) => setMercadoLivre({ ...mercadoLivre, access_token: e.target.value })}
                    disabled={saving === "ml"}
                  />
                </div>

                <Button 
                  onClick={handleSaveMercadoLivre} 
                  className="w-full"
                  disabled={saving === "ml"}
                >
                  {saving === "ml" ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </Card>

            <Card className="border-0 bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--xp-peach)]">
                    <Key className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold font-heading">Shopee</h2>
                    <p className="text-sm text-muted-foreground">Configure as credenciais da API</p>
                  </div>
                </div>
                <Badge variant={isShopeeConfigured ? "default" : "secondary"} className="gap-1">
                  {isShopeeConfigured ? (
                    <>
                      <CheckCircle2 className="h-3 w-3" />
                      Configurado
                    </>
                  ) : (
                    <>
                      <XCircle className="h-3 w-3" />
                      Não configurado
                    </>
                  )}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="shopee-partner-id">Partner ID</Label>
                  <Input
                    id="shopee-partner-id"
                    type="text"
                    placeholder="Digite o Partner ID"
                    value={shopee.partner_id}
                    onChange={(e) => setShopee({ ...shopee, partner_id: e.target.value })}
                    disabled={saving === "shopee"}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="shopee-partner-key">Partner Key</Label>
                  <Input
                    id="shopee-partner-key"
                    type="password"
                    placeholder="Digite o Partner Key"
                    value={shopee.partner_key}
                    onChange={(e) => setShopee({ ...shopee, partner_key: e.target.value })}
                    disabled={saving === "shopee"}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="shopee-shop-id">Shop ID</Label>
                  <Input
                    id="shopee-shop-id"
                    type="text"
                    placeholder="Digite o Shop ID"
                    value={shopee.shop_id}
                    onChange={(e) => setShopee({ ...shopee, shop_id: e.target.value })}
                    disabled={saving === "shopee"}
                  />
                </div>

                <Button 
                  onClick={handleSaveShopee} 
                  className="w-full"
                  disabled={saving === "shopee"}
                >
                  {saving === "shopee" ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
