import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { parseMercadoLivreCSV, importOrdersFromCSV } from "@/services/productService";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as XLSX from "xlsx";

interface ExcelUploadProps {
  onImportComplete: () => void;
}

export function ExcelUpload({ onImportComplete }: ExcelUploadProps) {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState<{ total: number; skus: number } | null>(null);

  const processFile = async (file: File) => {
    setFileName(file.name);
    setPreview(null);

    try {
      let csvText: string;

      // Se for Excel (.xlsx ou .xls), converter para CSV
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // Pegar a primeira planilha
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Converter para CSV
        csvText = XLSX.utils.sheet_to_csv(worksheet);
      } else {
        // Se for CSV, ler diretamente
        csvText = await file.text();
      }

      // Processar o CSV
      const rows = parseMercadoLivreCSV(csvText);
      const skusCount = rows.filter(r => r.sku).length;
      
      setPreview({ total: rows.length, skus: skusCount });
    } catch (error) {
      console.error("Erro ao ler arquivo:", error);
      toast({
        title: "Erro ao ler arquivo",
        description: "Formato de arquivo inválido ou corrompido",
        variant: "destructive"
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    await processFile(file);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fileInput = document.getElementById("excel-file") as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      let csvText: string;

      // Converter Excel para CSV se necessário
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const arrayBuffer = await file.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        csvText = XLSX.utils.sheet_to_csv(worksheet);
      } else {
        csvText = await file.text();
      }

      // Processar e importar
      const rows = parseMercadoLivreCSV(csvText);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileSpreadsheet className="h-5 w-5" />
          Importar Planilha de Vendas
        </CardTitle>
        <CardDescription>
          Faça upload do relatório do Mercado Livre (Excel ou CSV)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="excel-file">Arquivo de Vendas</Label>
            <Input
              id="excel-file"
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
              disabled={uploading}
            />
            <p className="text-xs text-muted-foreground">
              Formatos aceitos: Excel (.xlsx, .xls) ou CSV (.csv)
            </p>
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
            <li>Baixe o relatório em formato Excel ou CSV</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}