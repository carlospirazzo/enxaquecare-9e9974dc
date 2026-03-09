import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { X, Pill, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MigraineEpisode, PainLevel } from '@/types/migraine';
import { COMMON_SYMPTOMS, PAIN_LABELS } from '@/types/migraine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface EpisodeFormProps {
  date: Date | null;
  existing?: MigraineEpisode;
  open: boolean;
  onClose: () => void;
  onSave: (episode: MigraineEpisode) => void;
  onDelete: (date: string) => void;
}

export function EpisodeForm({ date, existing, open, onClose, onSave, onDelete }: EpisodeFormProps) {
  const [painLevel, setPainLevel] = useState<PainLevel>('moderate');
  const [medication, setMedication] = useState('');
  const [isMenstrual, setIsMenstrual] = useState(false);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (existing) {
      setPainLevel(existing.painLevel);
      setMedication(existing.medication);
      setIsMenstrual(existing.isMenstrual);
      setSymptoms(existing.symptoms);
      setNotes(existing.notes);
    } else {
      setPainLevel('moderate');
      setMedication('');
      setIsMenstrual(false);
      setSymptoms([]);
      setNotes('');
    }
  }, [existing, date]);

  if (!date) return null;

  const dateStr = format(date, 'yyyy-MM-dd');

  const toggleSymptom = (id: string) => {
    setSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const handleSave = () => {
    onSave({
      id: existing?.id || crypto.randomUUID(),
      date: dateStr,
      painLevel,
      medication,
      isMenstrual,
      symptoms,
      notes,
    });
    onClose();
  };

  const painOptions: { level: PainLevel; color: string; activeBg: string }[] = [
    { level: 'light', color: 'bg-pain-light', activeBg: 'bg-pain-light-bg ring-2 ring-pain-light' },
    { level: 'moderate', color: 'bg-pain-moderate', activeBg: 'bg-pain-moderate-bg ring-2 ring-pain-moderate' },
    { level: 'severe', color: 'bg-pain-severe', activeBg: 'bg-pain-severe-bg ring-2 ring-pain-severe' },
  ];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl">
            {format(date, "d 'de' MMMM, yyyy", { locale: ptBR })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Pain Level */}
          <div>
            <label className="text-sm font-medium mb-2 block">Intensidade da dor</label>
            <div className="flex gap-2">
              {painOptions.map(({ level, color, activeBg }) => (
                <button
                  key={level}
                  onClick={() => setPainLevel(level)}
                  className={`flex-1 py-3 rounded-lg text-sm font-medium transition-all ${
                    painLevel === level ? activeBg : 'bg-muted hover:bg-accent'
                  }`}
                >
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${color} mr-1.5`} />
                  {PAIN_LABELS[level]}
                </button>
              ))}
            </div>
          </div>

          {/* Medication */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              <Pill className="inline w-4 h-4 mr-1 -mt-0.5" />
              Medicação
            </label>
            <Input
              value={medication}
              onChange={(e) => setMedication(e.target.value)}
              placeholder="Ex: Sumatriptano 50mg (deixe vazio se sem medicação)"
            />
          </div>

          {/* Menstrual */}
          <div className="flex items-center gap-2">
            <Checkbox
              id="menstrual"
              checked={isMenstrual}
              onCheckedChange={(v) => setIsMenstrual(!!v)}
            />
            <label htmlFor="menstrual" className="text-sm font-medium cursor-pointer">
              Período menstrual
            </label>
          </div>

          {/* Symptoms */}
          <div>
            <label className="text-sm font-medium mb-2 block">Sintomas associados</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => toggleSymptom(id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    symptoms.includes(id)
                      ? 'bg-symptom-bg text-symptom ring-1 ring-symptom/30'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium mb-2 block">Observações</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Outros detalhes..."
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1">
              Salvar
            </Button>
            {existing && (
              <Button
                variant="outline"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => { onDelete(dateStr); onClose(); }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
