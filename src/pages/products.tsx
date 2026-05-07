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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Package, DollarSign } from "lucide-react";
import { getProducts, saveProduct, deleteProduct, type Product } from "@/services/productService";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Products() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    cost_price: "",
    shipping_cost: "",
    platform_fee_percent: "",
    other_costs: ""
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await getProducts();
      setProducts(data);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar produtos",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        sku: product.sku,
        name: product.name || "",
        cost_price: product.cost_price?.toString() || "",
        shipping_cost: product.shipping_cost?.toString() || "",
        platform_fee_percent: product.platform_fee_percent?.toString() || "",
        other_costs: product.other_costs?.toString() || ""
      });
    } else {
      setEditingProduct(null);
      setFormData({
        sku: "",
        name: "",
        cost_price: "",
        shipping_cost: "",
        platform_fee_percent: "15",
        other_costs: ""
      });
    }
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingProduct(null);
    setFormData({
      sku: "",
      name: "",
      cost_price: "",
      shipping_cost: "",
      platform_fee_percent: "",
      other_costs: ""
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.sku || !formData.name) {
      toast({
        title: "Campos obrigatórios",
        description: "SKU e Nome são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    try {
      await saveProduct({
        sku: formData.sku,
        name: formData.name,
        cost_price: formData.cost_price ? parseFloat(formData.cost_price) : null,
        shipping_cost: formData.shipping_cost ? parseFloat(formData.shipping_cost) : null,
        platform_fee_percent: formData.platform_fee_percent ? parseFloat(formData.platform_fee_percent) : null,
        other_costs: formData.other_costs ? parseFloat(formData.other_costs) : null
      });

      toast({
        title: editingProduct ? "Produto atualizado" : "Produto criado",
        description: "Dados salvos com sucesso"
      });

      handleCloseDialog();
      loadProducts();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar produto",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Deseja excluir o produto "${name}"?`)) return;

    try {
      await deleteProduct(id);
      toast({
        title: "Produto excluído",
        description: "Produto removido com sucesso"
      });
      loadProducts();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir produto",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const calculateMargin = (product: Product) => {
    const costPrice = Number(product.cost_price || 0);
    const shippingCost = Number(product.shipping_cost || 0);
    const feePercent = Number(product.platform_fee_percent || 0);
    const otherCosts = Number(product.other_costs || 0);
    
    // Assumir preço de venda médio de R$ 100 para exemplo
    const avgSalePrice = 100;
    const platformFee = avgSalePrice * (feePercent / 100);
    const totalCost = costPrice + shippingCost + platformFee + otherCosts;
    const profit = avgSalePrice - totalCost;
    
    return avgSalePrice > 0 ? (profit / avgSalePrice) * 100 : 0;
  };

  return (
    <>
      <SEO title="Produtos - Dashboard" description="Gestão de produtos e custos" />
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="xp-chip mb-4">Cost library</div>
              <h1 className="xp-page-title">Produtos</h1>
              <div className="xp-divider" />
              <p className="text-muted-foreground">Gerencie seus produtos e custos</p>
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Produto
            </Button>
          </div>

          <div className="xp-soft-panel bg-white">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead className="text-right">Custo Produto</TableHead>
                    <TableHead className="text-right">Custo Frete</TableHead>
                    <TableHead className="text-right">Taxa (%)</TableHead>
                    <TableHead className="text-right">Outros Custos</TableHead>
                    <TableHead className="text-right">Margem Est.</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        Carregando produtos...
                      </TableCell>
                    </TableRow>
                  ) : products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Package className="h-12 w-12 text-muted-foreground" />
                          <p className="text-muted-foreground">Nenhum produto cadastrado</p>
                          <Button onClick={() => handleOpenDialog()} className="gap-2 mt-2">
                            <Plus className="h-4 w-4" />
                            Adicionar Primeiro Produto
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => {
                      const margin = calculateMargin(product);
                      return (
                        <TableRow key={product.id}>
                          <TableCell>
                            <Badge variant="outline">{product.sku}</Badge>
                          </TableCell>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell className="text-right">
                            {product.cost_price ? `R$ ${Number(product.cost_price).toFixed(2).replace('.', ',')}` : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {product.shipping_cost ? `R$ ${Number(product.shipping_cost).toFixed(2).replace('.', ',')}` : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {product.platform_fee_percent ? `${Number(product.platform_fee_percent).toFixed(1)}%` : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            {product.other_costs ? `R$ ${Number(product.other_costs).toFixed(2).replace('.', ',')}` : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn(
                              "font-medium",
                              margin >= 20 ? "text-green-600" : margin >= 10 ? "text-yellow-600" : "text-red-600"
                            )}>
                              {margin.toFixed(1)}%
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(product)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(product.id, product.name || "")}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>

        {/* Dialog de Edição/Criação */}
        <Dialog open={showDialog} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                {editingProduct ? "Editar Produto" : "Novo Produto"}
              </DialogTitle>
              <DialogDescription>
                Configure os custos do produto para análise de lucro
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Ex: 50PRE"
                    disabled={!!editingProduct}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Nome do Produto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: 50 Presilhas Acrílico"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cost_price">Custo do Produto (R$)</Label>
                  <Input
                    id="cost_price"
                    type="number"
                    step="0.01"
                    value={formData.cost_price}
                    onChange={(e) => setFormData({ ...formData, cost_price: e.target.value })}
                    placeholder="0,00"
                  />
                  <p className="text-xs text-muted-foreground">Custo de fabricação/compra</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shipping_cost">Custo de Frete (R$)</Label>
                  <Input
                    id="shipping_cost"
                    type="number"
                    step="0.01"
                    value={formData.shipping_cost}
                    onChange={(e) => setFormData({ ...formData, shipping_cost: e.target.value })}
                    placeholder="0,00"
                  />
                  <p className="text-xs text-muted-foreground">Custo médio de envio</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform_fee_percent">Taxa da Plataforma (%)</Label>
                  <Input
                    id="platform_fee_percent"
                    type="number"
                    step="0.1"
                    value={formData.platform_fee_percent}
                    onChange={(e) => setFormData({ ...formData, platform_fee_percent: e.target.value })}
                    placeholder="15"
                  />
                  <p className="text-xs text-muted-foreground">ML: ~15%, Shopee: ~18%</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="other_costs">Outros Custos (R$)</Label>
                  <Input
                    id="other_costs"
                    type="number"
                    step="0.01"
                    value={formData.other_costs}
                    onChange={(e) => setFormData({ ...formData, other_costs: e.target.value })}
                    placeholder="0,00"
                  />
                  <p className="text-xs text-muted-foreground">Embalagem, etiquetas, etc</p>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProduct ? "Atualizar" : "Criar"} Produto
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </DashboardLayout>
    </>
  );
}
