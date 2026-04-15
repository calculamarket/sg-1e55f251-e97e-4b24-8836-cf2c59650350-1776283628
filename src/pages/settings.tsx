import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, Key } from "lucide-react";

interface MercadoLivreConfig {
  clientId: string;
  clientSecret: string;
  accessToken: string;
}

interface ShopeeConfig {
  partnerId: string;
  partnerKey: string;
  shopId: string;
}

export default function Settings() {
  const { toast } = useToast();
  const [mercadoLivre, setMercadoLivre] = useState<MercadoLivreConfig>({
    clientId: "",
    clientSecret: "",
    accessToken: ""
  });
  const [shopee, setShopee] = useState<ShopeeConfig>({
    partnerId: "",
    partnerKey: "",
    shopId: ""
  });

  useEffect(() => {
    const savedML = localStorage.getItem("mercadoLivre");
    const savedShopee = localStorage.getItem("shopee");
    
    if (savedML) setMercadoLivre(JSON.parse(savedML));
    if (savedShopee) setShopee(JSON.parse(savedShopee));
  }, []);

  const handleSaveMercadoLivre = () => {
    if (!mercadoLivre.clientId || !mercadoLivre.clientSecret || !mercadoLivre.accessToken) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos do Mercado Livre",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem("mercadoLivre", JSON.stringify(mercadoLivre));
    toast({
      title: "Configuração salva",
      description: "Credenciais do Mercado Livre foram salvas com sucesso"
    });
  };

  const handleSaveShopee = () => {
    if (!shopee.partnerId || !shopee.partnerKey || !shopee.shopId) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos da Shopee",
        variant: "destructive"
      });
      return;
    }

    localStorage.setItem("shopee", JSON.stringify(shopee));
    toast({
      title: "Configuração salva",
      description: "Credenciais da Shopee foram salvas com sucesso"
    });
  };

  const isMercadoLivreConfigured = mercadoLivre.clientId && mercadoLivre.clientSecret && mercadoLivre.accessToken;
  const isShopeeConfigured = shopee.partnerId && shopee.partnerKey && shopee.shopId;

  return (
    <>
      <SEO 
        title="Configurações - API Marketplaces"
        description="Configure as credenciais de API do Mercado Livre e Shopee"
      />
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-heading">Configurações</h1>
            <p className="text-muted-foreground mt-1">Gerencie as credenciais de API dos marketplaces</p>
          </div>

          <div className="grid gap-6">
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
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
                    value={mercadoLivre.clientId}
                    onChange={(e) => setMercadoLivre({ ...mercadoLivre, clientId: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ml-client-secret">Client Secret</Label>
                  <Input
                    id="ml-client-secret"
                    type="password"
                    placeholder="Digite o Client Secret"
                    value={mercadoLivre.clientSecret}
                    onChange={(e) => setMercadoLivre({ ...mercadoLivre, clientSecret: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ml-access-token">Access Token</Label>
                  <Input
                    id="ml-access-token"
                    type="password"
                    placeholder="Digite o Access Token"
                    value={mercadoLivre.accessToken}
                    onChange={(e) => setMercadoLivre({ ...mercadoLivre, accessToken: e.target.value })}
                  />
                </div>

                <Button onClick={handleSaveMercadoLivre} className="w-full">
                  Salvar Configurações
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
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
                    value={shopee.partnerId}
                    onChange={(e) => setShopee({ ...shopee, partnerId: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="shopee-partner-key">Partner Key</Label>
                  <Input
                    id="shopee-partner-key"
                    type="password"
                    placeholder="Digite o Partner Key"
                    value={shopee.partnerKey}
                    onChange={(e) => setShopee({ ...shopee, partnerKey: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="shopee-shop-id">Shop ID</Label>
                  <Input
                    id="shopee-shop-id"
                    type="text"
                    placeholder="Digite o Shop ID"
                    value={shopee.shopId}
                    onChange={(e) => setShopee({ ...shopee, shopId: e.target.value })}
                  />
                </div>

                <Button onClick={handleSaveShopee} className="w-full">
                  Salvar Configurações
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}