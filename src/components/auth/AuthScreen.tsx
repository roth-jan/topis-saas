'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { X, ArrowRight, Loader2, Mail } from 'lucide-react';

type Tab = 'login' | 'signup' | 'magic';

export function AuthScreen({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { signInPassword, signUpPassword, signInMagicLink } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);

  // Esc schließt; Body-Scroll sperren solange offen.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onOpenChange(false); };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onOpenChange]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!open || !mounted) return null;

  const submit = async () => {
    if (!email) { toast.error('Bitte E-Mail eingeben'); return; }
    setBusy(true);
    try {
      if (tab === 'login') {
        const r = await signInPassword(email, password);
        if (r.error) toast.error(r.error); else { toast.success('Eingeloggt'); onOpenChange(false); }
      } else if (tab === 'signup') {
        const r = await signUpPassword(email, password, displayName || undefined);
        if (r.error) toast.error(r.error);
        else if (r.needsConfirm) toast.success('Bestätigungs-Mail gesendet — bitte Link klicken');
        else { toast.success('Konto erstellt & eingeloggt'); onOpenChange(false); }
      } else {
        const r = await signInMagicLink(email);
        if (r.error) toast.error(r.error); else toast.success('Login-Link gesendet — bitte E-Mail prüfen');
      }
    } finally { setBusy(false); }
  };

  return createPortal((
    <div className="fixed inset-0 z-[100] overflow-y-auto animate-[ts-fade_.25s_ease-out]">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative flex min-h-full items-center justify-center p-4 sm:p-6">

      {/* Karte */}
      <div className="relative my-auto grid w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 shadow-2xl lg:grid-cols-[1.1fr_1fr] animate-[ts-rise_.4s_cubic-bezier(.2,.8,.2,1)]"
           style={{ backgroundColor: 'oklch(0.16 0 0)' }}>

        {/* ============ LINKS: Blueprint-Konsole ============ */}
        <div className="relative hidden flex-col justify-between overflow-hidden p-8 lg:flex"
             style={{ backgroundColor: 'oklch(0.13 0 0)' }}>
          {/* Blueprint-Raster */}
          <div className="pointer-events-none absolute inset-0 opacity-60" style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,.045) 1px, transparent 1px),' +
              'linear-gradient(to bottom, rgba(255,255,255,.045) 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }} />
          {/* Akzent-Grobraster */}
          <div className="pointer-events-none absolute inset-0" style={{
            backgroundImage:
              'linear-gradient(to right, color-mix(in oklch, var(--primary) 22%, transparent) 1px, transparent 1px),' +
              'linear-gradient(to bottom, color-mix(in oklch, var(--primary) 22%, transparent) 1px, transparent 1px)',
            backgroundSize: '140px 140px',
          }} />
          {/* Eck-Marken (wie Canvas-Auswahl) */}
          <CornerTicks />

          {/* Kopf: Wortmarke */}
          <div className="relative animate-[ts-up_.5s_.05s_both]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground"
                   style={{ fontFamily: 'var(--font-archivo)', fontWeight: 900 }}>T</div>
              <span className="text-[11px] uppercase tracking-[0.35em] text-white/40"
                    style={{ fontFamily: 'var(--font-plex-mono)' }}>Planungs-Konsole</span>
            </div>
            <h1 className="mt-6 text-5xl leading-[0.95] text-white"
                style={{ fontFamily: 'var(--font-archivo)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              TOPIS<span className="text-primary">.</span>
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/55">
              Tool für Operative Planung und Interaktive Simulation. Umschlaghallen entwerfen,
              Wege berechnen, Prozesse optimieren.
            </p>
          </div>

          {/* Hallen-Strichzeichnung (echo des Canvas) */}
          <div className="relative my-4 animate-[ts-up_.5s_.15s_both]">
            <HallSketch />
          </div>

          {/* Fuß: Spec-Readout in Mono */}
          <div className="relative flex items-center justify-between text-[10.5px] text-white/35 animate-[ts-up_.5s_.25s_both]"
               style={{ fontFamily: 'var(--font-plex-mono)' }}>
            <span>150.8m × 42.0m · 85 TORE · A*-WEGENETZ</span>
            <span>REGION eu-central-1</span>
          </div>
        </div>

        {/* ============ RECHTS: Formular ============ */}
        <div className="relative p-8 sm:p-10">
          <button onClick={() => onOpenChange(false)}
                  className="absolute right-4 top-4 rounded-md p-1.5 text-white/40 transition-colors hover:bg-white/5 hover:text-white/80">
            <X className="h-4 w-4" />
          </button>

          <div className="animate-[ts-up_.5s_.1s_both]">
            {/* Mobile-Wortmarke */}
            <div className="mb-6 flex items-center gap-2 lg:hidden">
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground"
                   style={{ fontFamily: 'var(--font-archivo)', fontWeight: 900 }}>T</div>
              <span style={{ fontFamily: 'var(--font-archivo)', fontWeight: 800 }} className="text-lg">TOPIS</span>
            </div>

            <h2 className="text-2xl text-foreground" style={{ fontFamily: 'var(--font-archivo)', fontWeight: 700, letterSpacing: '-0.01em' }}>
              {tab === 'signup' ? 'Konto erstellen' : tab === 'magic' ? 'Login-Link' : 'Willkommen zurück'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tab === 'signup' ? 'Lege dein Konto an, um Layouts zu speichern & zu teilen.'
                : tab === 'magic' ? 'Wir senden dir einen Login-Link — ohne Passwort.'
                : 'Melde dich an, um deine Cloud-Layouts zu laden.'}
            </p>

            {/* Segmented Tabs */}
            <div className="mt-6 grid grid-cols-3 gap-1 rounded-lg border border-border bg-muted/40 p-1"
                 style={{ fontFamily: 'var(--font-plex-mono)' }}>
              {([['login', 'Login'], ['signup', 'Registr.'], ['magic', 'Magic']] as [Tab, string][]).map(([id, lbl]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={`rounded-md px-2 py-1.5 text-xs uppercase tracking-wider transition-all ${
                    tab === id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                  }`}>{lbl}</button>
              ))}
            </div>

            {/* Felder */}
            <div className="mt-6 space-y-4">
              <Field label="E-Mail">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@firma.de" autoFocus
                  onKeyDown={(e) => { if (e.key === 'Enter' && tab === 'magic') submit(); }} />
              </Field>

              {tab === 'signup' && (
                <Field label="Anzeigename (optional)">
                  <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="z.B. Nico" />
                </Field>
              )}

              {tab !== 'magic' && (
                <Field label="Passwort">
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder={tab === 'signup' ? 'min. 6 Zeichen' : '••••••••'}
                    onKeyDown={(e) => { if (e.key === 'Enter') submit(); }} />
                </Field>
              )}

              <Button onClick={submit} disabled={busy}
                className="group h-11 w-full gap-2 text-sm" style={{ fontFamily: 'var(--font-archivo)', fontWeight: 600 }}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" />
                  : tab === 'magic' ? <Mail className="h-4 w-4" /> : null}
                {tab === 'signup' ? 'Konto erstellen' : tab === 'magic' ? 'Login-Link senden' : 'Einloggen'}
                {!busy && tab !== 'magic' && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
              </Button>
            </div>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              {tab === 'login' ? (
                <>Noch kein Konto?{' '}
                  <button onClick={() => setTab('signup')} className="text-primary underline-offset-2 hover:underline">Registrieren</button></>
              ) : (
                <>Schon registriert?{' '}
                  <button onClick={() => setTab('login')} className="text-primary underline-offset-2 hover:underline">Einloggen</button></>
              )}
            </p>
          </div>
        </div>
      </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes ts-fade { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ts-rise { from { opacity: 0; transform: translateY(12px) scale(.99) } to { opacity: 1; transform: none } }
        @keyframes ts-up   { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: none } }
      `}</style>
    </div>
  ), document.body);
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-plex-mono)' }}>{label}</Label>
      {children}
    </div>
  );
}

function CornerTicks() {
  const base = 'absolute h-4 w-4 border-primary/50';
  return (
    <div className="pointer-events-none absolute inset-5">
      <div className={`${base} left-0 top-0 border-l-2 border-t-2`} />
      <div className={`${base} right-0 top-0 border-r-2 border-t-2`} />
      <div className={`${base} bottom-0 left-0 border-b-2 border-l-2`} />
      <div className={`${base} bottom-0 right-0 border-b-2 border-r-2`} />
    </div>
  );
}

// Schematische Draufsicht einer Umschlaghalle: Außenwände + Tore (Striche) + ein Weg.
function HallSketch() {
  const tore = Array.from({ length: 9 }, (_, i) => 30 + i * 30);
  return (
    <svg viewBox="0 0 300 120" className="w-full" fill="none" style={{ maxHeight: 150 }}>
      {/* Außenwände */}
      <rect x="16" y="16" width="268" height="88" stroke="white" strokeOpacity="0.25" strokeWidth="1.5" rx="2" />
      {/* Tore Nord + Süd */}
      {tore.map((x) => (
        <g key={x}>
          <rect x={x} y="11" width="16" height="6" fill="var(--primary)" fillOpacity="0.85" rx="1" />
          <rect x={x} y="103" width="16" height="6" fill="white" fillOpacity="0.2" rx="1" />
        </g>
      ))}
      {/* Stellplätze (innen) */}
      {[40, 90, 140, 190, 240].map((x) => (
        <rect key={x} x={x} y="44" width="34" height="32" stroke="white" strokeOpacity="0.14" strokeWidth="1" rx="1.5" />
      ))}
      {/* Verteilweg (A*-Pfad) */}
      <path d="M38 14 L38 60 L130 60 L130 94" stroke="var(--primary)" strokeOpacity="0.7" strokeWidth="1.5" strokeDasharray="4 3" />
      <circle cx="38" cy="14" r="2.5" fill="var(--primary)" />
      <circle cx="130" cy="94" r="2.5" fill="var(--primary)" />
    </svg>
  );
}
