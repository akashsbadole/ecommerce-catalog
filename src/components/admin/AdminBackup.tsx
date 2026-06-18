'use client';

import { useState, useRef } from 'react';
import { Download, Upload, Loader2, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { adminFetch } from '@/lib/admin-fetch';

export function AdminBackup() {
  const [exporting, setExporting] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreResult, setRestoreResult] = useState<Record<string, number> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await adminFetch('/api/admin/backup');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Backup downloaded');
      } else {
        toast.error('Backup failed');
      }
    } catch {
      toast.error('Backup failed');
    } finally {
      setExporting(false);
    }
  };

  const handleRestore = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoring(true);
    setRestoreResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await adminFetch('/api/admin/backup', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setRestoreResult(data.restored);
        toast.success('Backup restored successfully');
      } else {
        toast.error(data.error || 'Restore failed');
      }
    } catch {
      toast.error('Restore failed');
    } finally {
      setRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Database Backup</h2>
        <p className="text-muted-foreground mt-1">Export and restore your data</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Download className="h-4 w-4" />
              Export Data
            </CardTitle>
            <CardDescription>
              Download a complete JSON backup of all application data, including multi-tenant records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} disabled={exporting} className="w-full">
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {exporting ? 'Exporting...' : 'Download Backup'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Upload className="h-4 w-4" />
              Restore Data
            </CardTitle>
            <CardDescription>
              Upload a previously exported JSON backup to restore your data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleRestore}
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={restoring}
              className="w-full"
            >
              {restoring ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {restoring ? 'Restoring...' : 'Select Backup File'}
            </Button>

            {restoreResult && (
              <div className="space-y-2">
                <Separator />
                <p className="text-sm font-medium">Restored:</p>
                <div className="flex gap-2 flex-wrap">
                  {Object.entries(restoreResult).map(([key, count]) => (
                    <Badge key={key} variant="secondary">
                      {key}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-yellow-800">Important Notes</p>
              <ul className="mt-1 text-yellow-700 list-disc list-inside space-y-1">
                <li>Backups include all 27 database models (stores, users, products, orders, etc.)</li>
                <li>Sensitive data like passwords and API keys are included in the backup</li>
                <li>Restoring will merge data (upsert) by ID, preserving existing records</li>
                <li>Multi-tenant data for all stores is included in a single backup</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
