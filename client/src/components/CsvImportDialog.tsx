import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Upload, FileText, AlertCircle, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ImportResult {
  created: number;
  skipped: number;
  colleaguesUpdated?: number;
  accountsCreated?: number;
  createdAccounts?: Array<{ name: string; email: string; temporaryPassword: string }>;
  errors: string[];
}

interface CsvImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  expectedColumns: string[];
  onImport: (rows: Record<string, string>[]) => Promise<ImportResult>;
  onComplete: () => void;
}

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return [];

  const headerLine = lines[0];
  const headers: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < headerLine.length; i++) {
    const ch = headerLine[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      headers.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  headers.push(current.trim());

  const rows: Record<string, string>[] = [];
  for (let r = 1; r < lines.length; r++) {
    const line = lines[r];
    const values: string[] = [];
    let val = '';
    let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQ && i + 1 < line.length && line[i + 1] === '"') {
          val += '"';
          i++;
        } else {
          inQ = !inQ;
        }
      } else if (ch === ',' && !inQ) {
        values.push(val.trim());
        val = '';
      } else {
        val += ch;
      }
    }
    values.push(val.trim());

    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = values[i] || '';
    });
    rows.push(row);
  }
  return rows;
}

export function CsvImportDialog({ open, onOpenChange, title, description, expectedColumns, onImport, onComplete }: CsvImportDialogProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setResult(null);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const rows = parseCSV(text);
      setParsedRows(rows);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await onImport(parsedRows);
      setResult(res);
      if (res.created > 0 || (res.colleaguesUpdated && res.colleaguesUpdated > 0) || (res.accountsCreated && res.accountsCreated > 0)) onComplete();
    } catch (e: any) {
      setResult({ created: 0, skipped: parsedRows.length, errors: [e.message] });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setParsedRows([]);
    setFileName('');
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <p className="text-sm font-medium">Expected CSV columns:</p>
            <div className="flex flex-wrap gap-1.5">
              {expectedColumns.map(col => (
                <Badge key={col} variant="secondary" className="text-xs">{col}</Badge>
              ))}
            </div>
          </div>

          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              fileName ? 'border-primary/50 bg-primary/5' : 'hover:border-primary/50'
            }`}
            onClick={() => fileRef.current?.click()}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFile}
              data-testid="input-csv-file"
            />
            {fileName ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">{fileName}</span>
                  <Badge variant="secondary">{parsedRows.length} rows</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Click to choose a different file</p>
              </div>
            ) : (
              <div>
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm font-medium">Click to select a CSV file</p>
                <p className="text-xs text-muted-foreground mt-1">or drag and drop your file here</p>
              </div>
            )}
          </div>

          {parsedRows.length > 0 && !result && (
            <>
              <div className="bg-muted/30 rounded-lg p-3">
                <p className="text-sm font-medium mb-1">Preview (first 3 rows):</p>
                <div className="text-xs text-muted-foreground space-y-1 overflow-x-auto">
                  {parsedRows.slice(0, 3).map((row, i) => (
                    <div key={i} className="whitespace-nowrap">
                      {Object.entries(row).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                    </div>
                  ))}
                  {parsedRows.length > 3 && (
                    <div className="text-muted-foreground/70">...and {parsedRows.length - 3} more rows</div>
                  )}
                </div>
              </div>

              <Button
                onClick={handleImport}
                disabled={importing}
                className="w-full gap-2"
                size="lg"
                data-testid="button-import-confirm"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4" />
                    Import {parsedRows.length} rows
                  </>
                )}
              </Button>
            </>
          )}

          {result && (
            <div className={`rounded-lg p-4 ${result.errors.length > 0 ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200' : 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200'}`}>
              <div className="flex items-center gap-2 mb-2">
                {result.errors.length > 0 ? (
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                )}
                <span className="text-sm font-medium" data-testid="text-import-summary">
                  {result.created} imported, {result.skipped} skipped{result.colleaguesUpdated ? `, ${result.colleaguesUpdated} colleagues updated` : ''}{result.accountsCreated ? `, ${result.accountsCreated} accounts created` : ''}
                </span>
              </div>
              {result.createdAccounts && result.createdAccounts.length > 0 && (
                <div className="mt-2 mb-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md p-3" data-testid="section-created-accounts">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 mb-1.5">New accounts created — please note these temporary passwords:</p>
                  <div className="space-y-1">
                    {result.createdAccounts.map((account, i) => (
                      <div key={i} className="text-xs flex items-center gap-2" data-testid={`row-created-account-${i}`}>
                        <span className="font-medium text-blue-800 dark:text-blue-200">{account.name}</span>
                        <span className="text-blue-600 dark:text-blue-400">({account.email})</span>
                        <Badge variant="outline" className="text-xs font-mono bg-white dark:bg-blue-900" data-testid={`text-temp-password-${i}`}>{account.temporaryPassword}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {result.errors.length > 0 && (
                <div className="text-xs text-amber-700 dark:text-amber-400 space-y-0.5 max-h-32 overflow-y-auto">
                  {result.errors.map((err, i) => <div key={i}>{err}</div>)}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">
            {result ? 'Close' : 'Cancel'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
