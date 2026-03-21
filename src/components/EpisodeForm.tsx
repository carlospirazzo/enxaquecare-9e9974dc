import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pill, Trash2, ChevronDown, Plus, X, Moon, Star } from 'lucide-react';
import type { MigraineEpisode, PainLevel, SleepDiary } from '@/types/migraine';
import { COMMON_SYMPTOMS, COMMON_TRIGGERS, PAIN_LABELS, SLEEP_QUALITY_LABELS } from '@/types/migraine';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

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
  const [medications, setMedications] = useState<string[]>(['']);
  const [isMenstrual, setIsMenstrual] = useState(false);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [customTrigger, setCustomTrigger] = useState('');
  const [notes, setNotes] = useState('');
  const [triggersOpen, setTriggersOpen] = useState(false);
  const [sleepOpen, setSleepOpen] = useState(false);
  const [sleep, setSleep] = useState<SleepDiary | null>(null);

  useEffect(() => {
    if (existing) {
      setPainLevel(existing.painLevel);
      setMedications(existing.medications.length > 0 ? existing.medications : ['']);
      setIsMenstrual(existing.isMenstrual);
      setSymptoms(existing.symptoms);
      setTriggers(existing.triggers || []);
      setNotes(existing.notes);
      setTriggersOpen((existing.triggers || []).length > 0);
      setSleep(existing.sleep || null);
      setSleepOpen(!!existing.sleep);
    } else {
      setPainLevel('moderate');
      setMedications(['']);
      setIsMenstrual(false);
      setSymptoms([]);
      setTriggers([]);
      setCustomTrigger('');
      setNotes('');
      setTriggersOpen(false);
      setSleep(null);
      setSleepOpen(false);
    }
  }, [existing, date]);

  if (!date) return null;

  const dateStr = format(date, 'yyyy-MM-dd');

  const toggleSymptom = (id: string) => {
    setSymptoms(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleTrigger = (id: string) => {
    setTriggers(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
  };

  const handleNotesChange = (value: string) => {
    const words = value.trim().split(/\s+/).filter(Boolean);
    if (words.length <= 5 || value.length < notes.length) {
      setNotes(value);
    }
  };

  const wordCount = notes.trim() ? notes.trim().split(/\s+/).filter(Boolean).length : 0;

  const updateMedication = (index: number, value: string) => {
    setMedications(prev => prev.map((m, i) => i === index ? value : m));
  };

  const addMedicationField = () => {
    setMedications(prev => [...prev, '']);
  };

  const removeMedicationField = (index: number) => {
    setMedications(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const filteredMeds = medications.map(m => m.trim()).filter(Boolean);
    onSave({
      id: existing?.id || crypto.randomUUID(),
      date: dateStr,
      painLevel,
      medications: filteredMeds,
      isMenstrual,
      symptoms,
      triggers,
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

          {/* Medications (multiple) */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              <Pill className="inline w-4 h-4 mr-1 -mt-0.5" />
              Medicações
            </label>
            <div className="space-y-2">
              {medications.map((med, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={med}
                    onChange={(e) => updateMedication(i, e.target.value)}
                    placeholder={i === 0 ? "Ex: Sumatriptano 50mg" : "Outro medicamento..."}
                    className="flex-1"
                  />
                  {medications.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-muted-foreground hover:text-destructive"
                      onClick={() => removeMedicationField(i)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-primary"
                onClick={addMedicationField}
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Adicionar medicamento
              </Button>
            </div>
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

          {/* Triggers (collapsible) */}
          <Collapsible open={triggersOpen} onOpenChange={setTriggersOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium w-full">
              <ChevronDown className={`w-4 h-4 transition-transform ${triggersOpen ? 'rotate-180' : ''}`} />
              Gatilhos (opcional)
              {triggers.length > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto">
                  {triggers.length}
                </span>
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="flex flex-wrap gap-2">
                {COMMON_TRIGGERS.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => toggleTrigger(id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      triggers.includes(id)
                        ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                        : 'bg-muted text-muted-foreground hover:bg-accent'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                {/* Custom triggers already added */}
                {triggers
                  .filter(t => !COMMON_TRIGGERS.some(ct => ct.id === t))
                  .map(t => (
                    <button
                      key={t}
                      onClick={() => toggleTrigger(t)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all bg-primary/15 text-primary ring-1 ring-primary/30 flex items-center gap-1"
                    >
                      {t}
                      <X className="w-3 h-3" />
                    </button>
                  ))}
              </div>
              {/* Add custom trigger */}
              <div className="flex gap-2 mt-3">
                <Input
                  value={customTrigger}
                  onChange={(e) => setCustomTrigger(e.target.value)}
                  placeholder="Outro gatilho..."
                  className="flex-1 h-8 text-xs"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const val = customTrigger.trim();
                      if (val && !triggers.includes(val)) {
                        setTriggers(prev => [...prev, val]);
                        setCustomTrigger('');
                      }
                    }
                  }}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-primary h-8"
                  onClick={() => {
                    const val = customTrigger.trim();
                    if (val && !triggers.includes(val)) {
                      setTriggers(prev => [...prev, val]);
                      setCustomTrigger('');
                    }
                  }}
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Adicionar
                </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Notes */}
          <div>
            <label className="text-sm font-medium mb-2 block">Observações</label>
            <Textarea
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Até 5 palavras..."
              rows={2}
            />
            <p className={`text-xs mt-1 ${wordCount >= 5 ? 'text-destructive' : 'text-muted-foreground'}`}>
              {wordCount}/5 palavras
            </p>
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
