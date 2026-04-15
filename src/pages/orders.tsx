import { useState } from "react";
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
import { Search, Filter, Package, MoreHorizontal, Eye } from "lucide-react";
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

// Mock data
const mockOrders = [
  { id: "MLB123456789", marketplace: "Mercado Livre", customer: "João Silva", product: "Teclado Mecânico RGB", value: 299.90, status: "completed", date: "2026-04-15" },
  { id: "SHP987654321", marketplace: "Shopee", customer: "Maria Oliveira", product: "Mouse Gamer 10000DPI", value: 149.90, status: "processing", date: "2026-04-14" },
  { id: "MLB123456790", marketplace: "Mercado Livre", customer: "Carlos Santos", product: "Monitor 24' IPS", value: 899.00, status: "shipped", date: "2026-04-14" },
  { id: "SHP987654322", marketplace: "Shopee", customer: "Ana Costa", product: "Headset Bluetooth", value: 199.50, status: "pending", date: "2026-04-13" },
  { id: "MLB123456791", marketplace: "Mercado Livre", customer: "Pedro Ferreira", product: "Webcam Full HD", value: 259.90, status: "completed", date: "2026-04-13" },
  { id: "SHP987654323", marketplace: "Shopee", customer: "Lucia Lima", product: "Mousepad Extra Grande", value: 89.90, status: "completed", date: "2026-04-12" },
  { id: "MLB123456792", marketplace: "Mercado Livre", customer: "Roberto Alves", product: "Cadeira Gamer", value: 1299.00, status: "processing", date: "2026-04-12" },
];

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: "Pendente", variant: "outline" },
  processing: { label: "Preparando", variant: "secondary" },
  shipped: { label: "Enviado", variant: "default" },
  completed: { label: "Entregue", variant: "default" },
  cancelled: { label: "Cancelado", variant: "destructive" },
};

export default function Orders() {
  const [searchTerm, setSearchTerm] = useState("");
  const [marketplace, setMarketplace] = useState("all");
  const [status, setStatus] = useState("all");

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          order.product.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMarketplace = marketplace === "all" || order.marketplace === marketplace;
    const matchesStatus = status === "all" || order.status === status;

    return matchesSearch && matchesMarketplace && matchesStatus;
  });

  return (
    <>
      <SEO title="Pedidos - Dashboard" description="Gerenciamento de pedidos" />
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold font-heading">Pedidos</h1>
              <p className="text-muted-foreground">Gerencie os pedidos de todos os marketplaces</p>
            </div>
            <Button className="gap-2">
              <Filter className="h-4 w-4" />
              Exportar Relatório
            </Button>
          </div>

          <div className="bg-card border rounded-lg shadow-sm">
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
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Nenhum pedido encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-muted-foreground" />
                            {order.marketplace}
                          </div>
                        </TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={order.product}>
                          {order.product}
                        </TableCell>
                        <TableCell>
                          {new Date(order.date).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusMap[order.status]?.variant || "default"}>
                            {statusMap[order.status]?.label || order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          R$ {order.value.toFixed(2).replace('.', ',')}
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
      </DashboardLayout>
    </>
  );
}