import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Pill, Trash2, ChevronDown, Plus, X, Moon, Star, Heart, Droplets, UtensilsCrossed, BrainCircuit } from 'lucide-react';
import type { MigraineEpisode, PainLevel, SleepDiary, WellbeingScore } from '@/types/migraine';
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
  const [wellbeingOpen, setWellbeingOpen] = useState(false);
  const [wellbeing, setWellbeing] = useState<WellbeingScore | null>(null);

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
      setWellbeing(existing.wellbeing || null);
      setWellbeingOpen(!!existing.wellbeing);
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
      setWellbeing(null);
      setWellbeingOpen(false);
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
      sleep: sleep || undefined,
      wellbeing: wellbeing || undefined,
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

          {/* Sleep Diary (collapsible) */}
          <Collapsible open={sleepOpen} onOpenChange={setSleepOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium w-full">
              <ChevronDown className={`w-4 h-4 transition-transform ${sleepOpen ? 'rotate-180' : ''}`} />
              <Moon className="w-4 h-4" />
              Diário de Sono (opcional)
              {sleep && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto">
                  {SLEEP_QUALITY_LABELS[sleep.quality]}
                </span>
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Hora de dormir</label>
                  <Input
                    type="time"
                    value={sleep?.bedtime || ''}
                    onChange={(e) => setSleep(prev => ({
                      bedtime: e.target.value,
                      wakeTime: prev?.wakeTime || '',
                      quality: prev?.quality || 3,
                    }))}
                    className="h-9"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Hora de acordar</label>
                  <Input
                    type="time"
                    value={sleep?.wakeTime || ''}
                    onChange={(e) => setSleep(prev => ({
                      bedtime: prev?.bedtime || '',
                      wakeTime: e.target.value,
                      quality: prev?.quality || 3,
                    }))}
                    className="h-9"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">Qualidade do sono</label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(q => (
                    <button
                      key={q}
                      onClick={() => setSleep(prev => ({
                        bedtime: prev?.bedtime || '',
                        wakeTime: prev?.wakeTime || '',
                        quality: q,
                      }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-0.5 ${
                        sleep?.quality === q
                          ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${sleep?.quality === q ? 'fill-primary' : ''}`} />
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {sleep?.quality ? SLEEP_QUALITY_LABELS[sleep.quality] : '1 = Péssimo, 5 = Ótimo'}
                </p>
              </div>
              {sleep && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive"
                  onClick={() => { setSleep(null); setSleepOpen(false); }}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Limpar dados de sono
                </Button>
              )}
            </CollapsibleContent>
          </Collapsible>

          {/* Wellbeing Score (collapsible) */}
          <Collapsible open={wellbeingOpen} onOpenChange={setWellbeingOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium w-full">
              <ChevronDown className={`w-4 h-4 transition-transform ${wellbeingOpen ? 'rotate-180' : ''}`} />
              <Heart className="w-4 h-4" />
              Bem-estar do dia (opcional)
              {wellbeing && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto">
                  preenchido
                </span>
              )}
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-4">
              {/* Sleep quality */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  <Moon className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                  Como você dormiu?
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(q => (
                    <button
                      key={q}
                      onClick={() => setWellbeing(prev => ({
                        sleepQuality: q,
                        stressLevel: prev?.stressLevel || 3,
                        enoughWater: prev?.enoughWater ?? true,
                        skippedMeal: prev?.skippedMeal ?? false,
                      }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all flex flex-col items-center gap-0.5 ${
                        wellbeing?.sleepQuality === q
                          ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${wellbeing?.sleepQuality === q ? 'fill-primary' : ''}`} />
                      <span>{q}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {wellbeing?.sleepQuality ? SLEEP_QUALITY_LABELS[wellbeing.sleepQuality] : '1 = Péssimo, 5 = Ótimo'}
                </p>
              </div>

              {/* Stress level */}
              <div>
                <label className="text-xs text-muted-foreground mb-2 block">
                  <BrainCircuit className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
                  Nível de estresse hoje
                </label>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map(q => (
                    <button
                      key={q}
                      onClick={() => setWellbeing(prev => ({
                        sleepQuality: prev?.sleepQuality || 3,
                        stressLevel: q,
                        enoughWater: prev?.enoughWater ?? true,
                        skippedMeal: prev?.skippedMeal ?? false,
                      }))}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        wellbeing?.stressLevel === q
                          ? 'bg-destructive/15 text-destructive ring-1 ring-destructive/30'
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  1 = Tranquilo, 5 = Muito estressado
                </p>
              </div>

              {/* Quick yes/no checks */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setWellbeing(prev => ({
                    sleepQuality: prev?.sleepQuality || 3,
                    stressLevel: prev?.stressLevel || 3,
                    enoughWater: !(prev?.enoughWater ?? false),
                    skippedMeal: prev?.skippedMeal ?? false,
                  }))}
                  className={`flex items-center gap-2 p-3 rounded-lg text-xs font-medium transition-all ${
                    wellbeing?.enoughWater
                      ? 'bg-primary/15 text-primary ring-1 ring-primary/30'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <Droplets className="w-4 h-4" />
                  Tomou água suficiente
                </button>
                <button
                  onClick={() => setWellbeing(prev => ({
                    sleepQuality: prev?.sleepQuality || 3,
                    stressLevel: prev?.stressLevel || 3,
                    enoughWater: prev?.enoughWater ?? true,
                    skippedMeal: !(prev?.skippedMeal ?? false),
                  }))}
                  className={`flex items-center gap-2 p-3 rounded-lg text-xs font-medium transition-all ${
                    wellbeing?.skippedMeal
                      ? 'bg-destructive/15 text-destructive ring-1 ring-destructive/30'
                      : 'bg-muted text-muted-foreground hover:bg-accent'
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  Pulou refeição
                </button>
              </div>

              {wellbeing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-destructive"
                  onClick={() => { setWellbeing(null); setWellbeingOpen(false); }}
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Limpar bem-estar
                </Button>
              )}
            </CollapsibleContent>
          </Collapsible>

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
