import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseMercadoLivreCSV, importOrdersFromCSV } from "@/services/productService";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ExcelUploadProps {
  onImportComplete: () => void;
}

export function ExcelUpload({ onImportComplete }: ExcelUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState<{ total: number; skus: number } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setPreview(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = parseMercadoLivreCSV(text);
        const skusCount = rows.filter(r => r.sku).length;
        
        setPreview({ total: rows.length, skus: skusCount });
      } catch (error) {
        console.error("Erro ao ler arquivo:", error);
        toast({
          title: "Erro ao ler arquivo",
          description: "Formato de arquivo inválido",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fileInput = document.getElementById("csv-file") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const text = event.target?.result as string;
          const rows = parseMercadoLivreCSV(text);
          
          await importOrdersFromCSV(rows);

          toast({
            title: "Importação concluída",
            description: `${rows.length} pedidos importados com sucesso`
          });

          setFileName("");
          setPreview(null);
          fileInput.value = "";
          onImportComplete();
        } catch (error: any) {
          console.error("Erro na importação:", error);
          toast({
            title: "Erro na importação",
            description: error.message,
            variant: "destructive"
          });
        } finally {
          setUploading(false);
        }
      };
      reader.readAsText(file);
    } catch (error: any) {
      toast({
        title: "Erro ao processar arquivo",
        description: error.message,
        variant: "destructive"
      });
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Importar Planilha de Vendas
        </CardTitle>
        <CardDescription>
          Faça upload do relatório CSV exportado do Mercado Livre
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csv-file">Arquivo CSV</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>

          {preview && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                <strong>{preview.total} pedidos</strong> encontrados. 
                {preview.skus > 0 ? (
                  <> <strong>{preview.skus}</strong> com SKU mapeado.</>
                ) : (
                  <> Nenhum SKU encontrado - cadastre os produtos para análise de lucro.</>
                )}
              </AlertDescription>
            </Alert>
          )}

          {fileName && !preview && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Processando arquivo: {fileName}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            disabled={!fileName || uploading}
            className="w-full gap-2"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Importando..." : "Importar Pedidos"}
          </Button>
        </form>

        <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
          <p className="font-medium mb-1">Como exportar do Mercado Livre:</p>
          <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
            <li>Acesse Faturas e relatórios</li>
            <li>Clique em "Vendas"</li>
            <li>Selecione o período desejado</li>
            <li>Baixe o relatório em formato CSV</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}