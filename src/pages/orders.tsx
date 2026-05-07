import { useState, useEffect } from "react";
import { SEO } from "@/components/SEO";
import { DashboardLayout } from "@/components/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Filter, Package, MoreHorizontal, Eye, RefreshCw, Upload, TrendingUp } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getOrders, syncAllMarketplaces } from "@/services/marketplaceService";
import { analyzeProfits, type ProfitAnalysis } from "@/services/productService";
import { ExcelUpload } from "@/components/ExcelUpload";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { cn } from "@/lib/utils";

type Order = Tables<"orders">;

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "outline" },
  processing: { label: "Preparando", variant: "secondary" },
  shipped: { label: "Enviado", variant: "default" },
  completed: { label: "Entregue", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

export default function Orders() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [marketplace, setMarketplace] = useState("all");
  const [status, setStatus] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [showProfitAnalysis, setShowProfitAnalysis] = useState(false);
  const [profitAnalysis, setProfitAnalysis] = useState<ProfitAnalysis[]>([]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await getOrders({
        marketplace: marketplace !== "all" ? marketplace : undefined,
        status: status !== "all" ? status : undefined,
      });
      setOrders(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar pedidos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await syncAllMarketplaces();
      toast({
        title: "Sincronização iniciada",
        description: "Os pedidos estão sendo atualizados",
      });
      setTimeout(loadOrders, 2000);
    } catch (error: any) {
      toast({
        title: "Erro na sincronização",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleShowProfitAnalysis = async () => {
    try {
      const analysis = await analyzeProfits(filteredOrders);
      setProfitAnalysis(analysis);
      setShowProfitAnalysis(true);
    } catch (error: any) {
      toast({
        title: "Erro ao calcular lucros",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadOrders();
  }, [marketplace, status]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.order_id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const totalProfit = profitAnalysis.reduce((sum, item) => sum + item.profit, 0);
  const avgMargin = profitAnalysis.length > 0
    ? profitAnalysis.reduce((sum, item) => sum + item.profitMargin, 0) / profitAnalysis.length
    : 0;

  return (
    <>
      <SEO title="Pedidos - Dashboard" description="Gerenciamento de pedidos" />
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="xp-chip mb-4">Order flow</div>
              <h1 className="xp-page-title">Pedidos</h1>
              <div className="xp-divider" />
              <p className="text-muted-foreground">Gerencie os pedidos de todos os marketplaces</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="gap-2" onClick={handleSync} disabled={syncing}>
                <RefreshCw className={cn("h-4 w-4", syncing && "animate-spin")} />
                Sincronizar
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setShowUpload(true)}>
                <Upload className="h-4 w-4" />
                Importar CSV
              </Button>
              <Button variant="outline" className="gap-2" onClick={handleShowProfitAnalysis}>
                <TrendingUp className="h-4 w-4" />
                Análise de Lucro
              </Button>
              <Button className="gap-2">
                <Filter className="h-4 w-4" />
                Exportar Relatório
              </Button>
            </div>
          </div>

          <div className="xp-soft-panel bg-white">
            <div className="p-4 border-b flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por ID, cliente ou produto..." 
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={marketplace} onValueChange={setMarketplace}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Marketplace" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Marketplaces</SelectItem>
                  <SelectItem value="Mercado Livre">Mercado Livre</SelectItem>
                  <SelectItem value="Shopee">Shopee</SelectItem>
                </SelectContent>
              </Select>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="processing">Preparando</SelectItem>
                  <SelectItem value="shipped">Enviado</SelectItem>
                  <SelectItem value="completed">Entregue</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID do Pedido</TableHead>
                    <TableHead>Marketplace</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Carregando pedidos...
                      </TableCell>
                    </TableRow>
                  ) : filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhum pedido encontrado. Configure as credenciais e sincronize os dados.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.order_id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            {order.marketplace}
                          </div>
                        </TableCell>
                        <TableCell>{order.customer_name || "-"}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={order.product_name || ""}>
                          {order.product_name || "-"}
                        </TableCell>
                        <TableCell>
                          {order.order_date ? new Date(order.order_date).toLocaleDateString('pt-BR') : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusMap[order.status]?.variant || "default"}>
                            {statusMap[order.status]?.label || order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {Number(order.total_value || 0).toFixed(2).replace('.', ',')}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="gap-2">
                                <Eye className="h-4 w-4" />
                                Ver Detalhes
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Dialog Upload */}
        <Dialog open={showUpload} onOpenChange={setShowUpload}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Importar Planilha de Vendas</DialogTitle>
              <DialogDescription>
                Importe o relatório CSV do Mercado Livre para análise de lucros
              </DialogDescription>
            </DialogHeader>
            <ExcelUpload onImportComplete={() => {
              setShowUpload(false);
              loadOrders();
            }} />
          </DialogContent>
        </Dialog>

        {/* Dialog Análise de Lucro */}
        <Dialog open={showProfitAnalysis} onOpenChange={setShowProfitAnalysis}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Análise de Lucro</DialogTitle>
              <DialogDescription>
                Análise detalhada de custos e lucros por pedido
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="xp-soft-panel bg-[var(--xp-mint)] p-4">
                <p className="text-sm text-muted-foreground">Lucro Total</p>
                <p className={cn(
                  "text-2xl font-bold",
                  totalProfit >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  R$ {totalProfit.toFixed(2).replace('.', ',')}
                </p>
              </div>
              <div className="xp-soft-panel bg-[var(--xp-sky)] p-4">
                <p className="text-sm text-muted-foreground">Margem Média</p>
                <p className={cn(
                  "text-2xl font-bold",
                  avgMargin >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {avgMargin.toFixed(1)}%
                </p>
              </div>
              <div className="xp-soft-panel bg-[var(--xp-lilac)] p-4">
                <p className="text-sm text-muted-foreground">Pedidos Analisados</p>
                <p className="text-2xl font-bold">{profitAnalysis.length}</p>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead className="text-right">Venda</TableHead>
                  <TableHead className="text-right">Custo</TableHead>
                  <TableHead className="text-right">Taxa</TableHead>
                  <TableHead className="text-right">Lucro</TableHead>
                  <TableHead className="text-right">Margem</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profitAnalysis.map((item) => (
                  <TableRow key={item.orderId}>
                    <TableCell className="font-medium">{item.orderId}</TableCell>
                    <TableCell>
                      {item.sku ? (
                        <Badge variant="outline">{item.sku}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">Sem SKU</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{item.productName}</TableCell>
                    <TableCell className="text-right">
                      R$ {item.salePrice.toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {item.totalCost.toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {item.platformFee.toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-medium",
                      item.profit >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      R$ {item.profit.toFixed(2).replace('.', ',')}
                    </TableCell>
                    <TableCell className={cn(
                      "text-right font-medium",
                      item.profitMargin >= 0 ? "text-green-600" : "text-red-600"
                    )}>
                      {item.profitMargin.toFixed(1)}%
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
}
