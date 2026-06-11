'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { X, ArrowRight, Loader2, Mail, CheckCircle2 } from 'lucide-react';
import { LogoMark } from '@/components/Logo';

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
      <div className="relative my-auto grid w-full max-w-5xl overflow-hidden rounded-xl border border-border bg-card shadow-2xl lg:grid-cols-[1.1fr_1fr] animate-[ts-rise_.4s_cubic-bezier(.2,.8,.2,1)]">

        {/* ============ LINKS: Markenpanel (warm, themefolgend) ============ */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-muted p-10 text-foreground lg:flex">
          {/* sehr dezenter Akzent-Schimmer */}
          <div className="pointer-events-none absolute -left-28 -top-28 h-80 w-80 rounded-full"
               style={{ background: 'radial-gradient(closest-side, color-mix(in oklch, var(--primary) 14%, transparent), transparent)' }} />

          {/* Kopf: Wortmarke + Headline (Echo des Landing-Hero) */}
          <div className="relative animate-[ts-up_.5s_.05s_both]">
            <div className="flex items-center gap-2.5">
              <LogoMark size={36} className="shadow-sm rounded-[10px]" />
              <span className="font-display text-[15px] tracking-tight text-foreground/90"
                    style={{ fontWeight: 700 }}>TOPIS</span>
            </div>
            <h1 className="mt-8 font-display text-[2.6rem] leading-[1.05] text-foreground"
                style={{ fontWeight: 700, letterSpacing: '-0.025em' }}>
              Hallenplanung,<br /><span className="text-primary">intelligent optimiert.</span>
            </h1>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-muted-foreground">
              Umschlaghallen entwerfen, Wege berechnen, Prozesse simulieren — direkt im Browser.
            </p>
          </div>

          {/* Hallen-Strichzeichnung (echo des Canvas) */}
          <div className="relative my-6 text-foreground/70 animate-[ts-up_.5s_.15s_both]">
            <HallSketch />
          </div>

          {/* Fuß: Value-Punkte */}
          <ul className="relative space-y-2.5 animate-[ts-up_.5s_.25s_both]">
            {['Wege & Verteilweg automatisch berechnen', 'Szenarien vergleichen, Δ in Prozent', 'Cloud-Layouts sicher teilen'].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-sm text-foreground/70">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />{t}
              </li>
            ))}
          </ul>
        </div>

        {/* ============ RECHTS: Formular ============ */}
        <div className="relative p-8 sm:p-10">
          <button onClick={() => onOpenChange(false)}
                  className="absolute right-4 top-4 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <X className="h-4 w-4" />
          </button>

          <div className="animate-[ts-up_.5s_.1s_both]">
            {/* Mobile-Wortmarke */}
            <div className="mb-6 flex items-center gap-2 lg:hidden">
              <LogoMark size={32} />
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }} className="text-lg">TOPIS</span>
            </div>

            <h2 className="text-2xl text-foreground" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, letterSpacing: '-0.01em' }}>
              {tab === 'signup' ? 'Konto erstellen' : tab === 'magic' ? 'Login-Link' : 'Willkommen zurück'}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {tab === 'signup' ? 'Lege dein Konto an, um Layouts zu speichern & zu teilen.'
                : tab === 'magic' ? 'Wir senden dir einen Login-Link — ohne Passwort.'
                : 'Melde dich an, um deine Cloud-Layouts zu laden.'}
            </p>

            {/* Segmented Tabs */}
            <div className="mt-6 grid grid-cols-3 gap-1 rounded-lg border border-border bg-muted/40 p-1"
                 style={{ fontFamily: 'var(--font-mono)' }}>
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
                className="group h-11 w-full gap-2 text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>
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
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground" style={{ fontFamily: 'var(--font-mono)' }}>{label}</Label>
      {children}
    </div>
  );
}

// Schematische Draufsicht einer Umschlaghalle: Außenwände + Tore (Striche) + ein Weg.
function HallSketch() {
  const tore = Array.from({ length: 9 }, (_, i) => 30 + i * 30);
  return (
    <svg viewBox="0 0 300 120" className="w-full" fill="none" style={{ maxHeight: 150 }}>
      {/* Außenwände */}
      <rect x="16" y="16" width="268" height="88" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.5" rx="2" />
      {/* Tore Nord + Süd */}
      {tore.map((x) => (
        <g key={x}>
          <rect x={x} y="11" width="16" height="6" fill="var(--primary)" fillOpacity="0.85" rx="1" />
          <rect x={x} y="103" width="16" height="6" fill="currentColor" fillOpacity="0.35" rx="1" />
        </g>
      ))}
      {/* Stellplätze (innen) */}
      {[40, 90, 140, 190, 240].map((x) => (
        <rect key={x} x={x} y="44" width="34" height="32" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1" rx="1.5" />
      ))}
      {/* Verteilweg (A*-Pfad) */}
      <path d="M38 14 L38 60 L130 60 L130 94" stroke="var(--primary)" strokeOpacity="0.7" strokeWidth="1.5" strokeDasharray="4 3" />
      <circle cx="38" cy="14" r="2.5" fill="var(--primary)" />
      <circle cx="130" cy="94" r="2.5" fill="var(--primary)" />
    </svg>
  );
}
