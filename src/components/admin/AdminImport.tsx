'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { adminFetch } from '@/lib/admin-fetch';

interface ImportResult {
  imported: number;
  skipped: number;
  total: number;
  errors: string[];
}

export function AdminImport() {
  const [importing, setImporting] = useState(false);
  const [platform, setPlatform] = useState<'shopify' | 'woocommerce'>('shopify');
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await adminFetch(`/api/import/${platform}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setResult(data);
        toast.success(`Imported ${data.imported} products`);
      } else {
        toast.error(data.error || 'Import failed');
      }
    } catch {
      toast.error('Import failed');
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const downloadSampleCSV = () => {
    let csv = '';
    if (platform === 'shopify') {
      csv = `Handle,Title,Body (HTML),Vendor,Product Type,Tags,Published,Variant SKU,Variant Price,Variant Compare At Price,Variant Inventory Qty,Variant Weight,Image Src,Image Alt Text,Status
sample-product,Sample Product,This is a sample product description,My Brand,Category,tag1; tag2,TRUE,SKU-001,29.99,39.99,100,0.5,https://example.com/image.jpg,Sample Image,active`;
    } else {
      csv = `ID,Type,SKU,Name,Published,Short description,Description,Sale price,Regular price,Categories,Tags,Images,Stock,Stock status,Weight,Status
1,simple,SKU-001,Sample Product,1,Short desc here,Full description here,24.99,29.99,Electronics,gadgets,https://example.com/image.jpg,100,instock,0.5,publish`;
    }

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${platform}-sample.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Import Products</h2>
        <p className="text-muted-foreground mt-1">Migrate products from Shopify or WooCommerce</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="h-4 w-4" />
            Import from CSV
          </CardTitle>
          <CardDescription>
            Upload a product export CSV from your current platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Platform</Label>
            <Select value={platform} onValueChange={(v) => setPlatform(v as 'shopify' | 'woocommerce')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="shopify">Shopify</SelectItem>
                <SelectItem value="woocommerce">WooCommerce</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-dashed p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleImport}
            />
            {importing ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Importing products...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Drop your CSV file here or click to browse
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Select CSV File
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={downloadSampleCSV}>
              <Download className="mr-2 h-4 w-4" />
              Download Sample {platform === 'shopify' ? 'Shopify' : 'WooCommerce'} CSV
            </Button>
          </div>

          {result && (
            <>
              <Separator />
              <div className="space-y-3">
                <h4 className="font-medium">Import Results</h4>
                <div className="flex gap-4 flex-wrap">
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {result.imported} imported
                  </Badge>
                  <Badge variant="secondary">
                    {result.skipped} skipped
                  </Badge>
                  <Badge variant="outline">
                    {result.total} total
                  </Badge>
                </div>
                {result.errors.length > 0 && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm">
                    <p className="font-medium text-destructive mb-1">Errors:</p>
                    <ul className="list-disc list-inside text-destructive/80 text-xs space-y-1">
                      {result.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
