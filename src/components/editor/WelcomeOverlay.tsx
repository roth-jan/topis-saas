'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'sonner';
import { Warehouse, Wand2, PlusSquare, ArrowRight, X } from 'lucide-react';
import { LogoMark } from '@/components/Logo';
import { useObjects, useTopisStore } from '@/lib/store';
import { ladeProjektVorlage } from '@/lib/projekt-vorlagen';

const SEEN_KEY = 'topis-welcome-seen';

/**
 * Erstkontakt-Overlay: zeigt sich beim ersten Öffnen des leeren Editors und
 * bietet drei Einstiege (Demo / Hallen-Assistent / Leer). Dismissbar, per
 * localStorage gemerkt — stört Wiederkehrer und befüllte Editoren nicht.
 * Hydration-gated, damit es nie kurz über einem geladenen Layout aufblitzt.
 */
export function WelcomeOverlay() {
  const objects = useObjects();
  const [mounted, setMounted] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    setMounted(true);
    try {
      setDismissed(localStorage.getItem(SEEN_KEY) === '1');
    } catch {
      setDismissed(false);
    }
    const persist = useTopisStore.persist;
    if (persist?.hasHydrated?.()) setHydrated(true);
    const unsub = persist?.onFinishHydration?.(() => setHydrated(true));
    return () => { unsub?.(); };
  }, []);

  if (!mounted || !hydrated || dismissed) return null;
  if (objects.length > 0) return null; // befüllter Editor → kein Overlay

  const close = () => {
    try { localStorage.setItem(SEEN_KEY, '1'); } catch { /* ignore */ }
    setDismissed(true);
  };

  const loadDemo = () => {
    ladeProjektVorlage('as_gersthofen_2026');
    toast.success('Demo-Halle geladen');
    close();
  };

  const openAssistent = () => {
    close();
    // Hallen-Assistent öffnen (folgt der data-*-trigger-Konvention).
    setTimeout(() => {
      const btn = document.querySelector('[data-hallen-assistent-trigger]') as HTMLButtonElement | null;
      btn?.click();
    }, 60);
  };

  const options = [
    {
      key: 'demo',
      icon: Warehouse,
      title: 'Demo-Halle ansehen',
      desc: 'Reale Umschlaghalle — 115 Tore, Wege & Heatmap fertig geladen.',
      onClick: loadDemo,
      primary: true,
    },
    {
      key: 'assistent',
      icon: Wand2,
      title: 'Eigene Halle planen',
      desc: 'Maße und Tore Schritt für Schritt über den Hallen-Assistenten.',
      onClick: openAssistent,
      primary: false,
    },
    {
      key: 'leer',
      icon: PlusSquare,
      title: 'Leer starten',
      desc: 'Mit leerem Grundriss beginnen und frei platzieren.',
      onClick: close,
      primary: false,
    },
  ];

  return createPortal((
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 animate-[ts-w-fade_.25s_ease-out]">
      <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={close} />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl animate-[ts-w-rise_.4s_cubic-bezier(.2,.8,.2,1)]">
        <button onClick={close} aria-label="Schließen"
                className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
          <X className="h-4 w-4" />
        </button>

        <div className="px-8 pt-8">
          <div className="flex items-center gap-2.5">
            <LogoMark size={32} className="shadow-sm rounded-[9px]" />
            <span className="text-sm tracking-tight text-foreground/90"
                  style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>TOPIS</span>
          </div>
          <h2 className="mt-5 text-2xl text-foreground"
              style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.015em' }}>
            Willkommen bei TOPIS
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Womit möchten Sie starten?
          </p>
        </div>

        <div className="grid gap-3 px-8 pb-7 pt-6 sm:grid-cols-3">
          {options.map(({ key, icon: Icon, title, desc, onClick, primary }) => (
            <button
              key={key}
              onClick={onClick}
              className={`group flex flex-col items-start gap-3 rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${
                primary
                  ? 'border-primary/60 bg-primary/5 ring-1 ring-primary/30 hover:border-primary'
                  : 'border-border bg-muted/30 hover:border-foreground/20 hover:bg-muted/50'
              }`}
            >
              <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                primary ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground'
              }`}>
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-sm text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                {title}
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">{desc}</span>
              {primary && (
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary">
                  Empfohlen <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="border-t border-border bg-muted/20 px-8 py-3">
          <p className="text-[11px] text-muted-foreground">
            Sie können Hallen jederzeit über <span className="text-foreground/70">Daten → Halle laden</span> wechseln.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes ts-w-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ts-w-rise { from { opacity: 0; transform: translateY(12px) scale(.99) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  ), document.body);
}
