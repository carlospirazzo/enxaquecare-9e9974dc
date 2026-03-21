import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import type { MigraineEpisode } from '@/types/migraine';

interface DataMigrationProps {
  open: boolean;
  onClose: () => void;
  episodes: MigraineEpisode[];
  onImport: (episodes: MigraineEpisode[]) => void;
}

export function DataMigration({ open, onClose, episodes, onImport }: DataMigrationProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = JSON.stringify(episodes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enxaqueca-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Dados exportados!', description: `${episodes.length} episódios salvos no arquivo.` });
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const imported = JSON.parse(ev.target?.result as string);
        if (!Array.isArray(imported)) throw new Error('Formato inválido');
        // Basic validation
        const valid = imported.every((ep: any) => ep.date && ep.painLevel);
        if (!valid) throw new Error('Dados incompletos');
        onImport(imported);
        toast({ title: 'Dados importados!', description: `${imported.length} episódios restaurados.` });
        onClose();
      } catch {
        toast({ title: 'Erro na importação', description: 'O arquivo não contém dados válidos.', variant: 'destructive' });
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">Migrar Dados</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Exporte seus dados para um arquivo e importe em outro dispositivo.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          <Button onClick={handleExport} className="w-full gap-2" variant="default">
            <Download className="w-4 h-4" />
            Exportar dados ({episodes.length} episódios)
          </Button>

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full gap-2"
            variant="outline"
          >
            <Upload className="w-4 h-4" />
            Importar dados de arquivo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />

          <p className="text-xs text-muted-foreground text-center pt-1">
            A importação substituirá todos os dados atuais.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
