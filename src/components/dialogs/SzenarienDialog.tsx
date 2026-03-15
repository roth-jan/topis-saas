'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useBetriebsdatenStore, Szenario } from '@/lib/betriebsdaten-store';
import { useTopisStore } from '@/lib/store';
import { FlaskConical, Plus, Trash2, Play, Check } from 'lucide-react';
import { toast } from 'sonner';

export function SzenarienDialog() {
  const [open, setOpen] = useState(false);
  const [neuerName, setNeuerName] = useState('');
  const [neueBeschreibung, setNeueBeschreibung] = useState('');

  const szenarien = useBetriebsdatenStore((s) => s.szenarien);
  const aktivSzenario = useBetriebsdatenStore((s) => s.aktivSzenario);
  const addSzenario = useBetriebsdatenStore((s) => s.addSzenario);
  const removeSzenario = useBetriebsdatenStore((s) => s.removeSzenario);
  const setAktivSzenario = useBetriebsdatenStore((s) => s.setAktivSzenario);
  const analyse = useBetriebsdatenStore((s) => s.analyse);

  const handleAdd = () => {
    if (!neuerName.trim()) {
      toast.error('Name erforderlich');
      return;
    }

    const szenario: Szenario = {
      id: `sz-${Date.now()}`,
      name: neuerName.trim(),
      beschreibung: neueBeschreibung.trim(),
      aenderungen: [],
      ergebnis: analyse ? { ...analyse } : undefined,
    };

    addSzenario(szenario);
    setNeuerName('');
    setNeueBeschreibung('');
    toast.success(`Szenario "${szenario.name}" erstellt`);
  };

  const handleActivate = (id: string) => {
    setAktivSzenario(aktivSzenario === id ? null : id);
    const sz = szenarien.find((s) => s.id === id);
    if (sz && aktivSzenario !== id) {
      toast.info(`Szenario "${sz.name}" aktiviert`);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 text-xs">
          <FlaskConical className="h-3.5 w-3.5" />
          Szenarien
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Szenarien-Vergleich
          </DialogTitle>
          <DialogDescription>
            Erstelle verschiedene Layout-Szenarien und vergleiche ihre Auswirkung auf die Effizienz.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Neues Szenario */}
          <div className="rounded-lg border p-3 space-y-2">
            <Label className="text-sm font-medium">Neues Szenario</Label>
            <Input
              placeholder="Name (z.B. 'Variante mit Tor-Umzug')"
              value={neuerName}
              onChange={(e) => setNeuerName(e.target.value)}
              className="h-8 text-sm"
            />
            <Input
              placeholder="Beschreibung (optional)"
              value={neueBeschreibung}
              onChange={(e) => setNeueBeschreibung(e.target.value)}
              className="h-8 text-sm"
            />
            <Button size="sm" onClick={handleAdd} className="w-full">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Szenario erstellen (aktuelles Layout speichern)
            </Button>
          </div>

          {/* Liste */}
          {szenarien.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-6">
              Noch keine Szenarien erstellt. Importiere zuerst Betriebsdaten und erstelle dann verschiedene Layout-Varianten.
            </div>
          ) : (
            <div className="space-y-2">
              {szenarien.map((sz) => (
                <div
                  key={sz.id}
                  className={`rounded-lg border p-3 ${
                    aktivSzenario === sz.id ? 'border-primary bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{sz.name}</div>
                      {sz.beschreibung && (
                        <div className="text-xs text-muted-foreground">{sz.beschreibung}</div>
                      )}
                      {sz.ergebnis && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {sz.ergebnis.objektMetriken.length} Objekte |{' '}
                          {Math.round(sz.ergebnis.gesamtSendungen).toLocaleString('de-DE')} Sendungen
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant={aktivSzenario === sz.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleActivate(sz.id)}
                      >
                        {aktivSzenario === sz.id ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Play className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          removeSzenario(sz.id);
                          toast.info(`Szenario "${sz.name}" gelöscht`);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
