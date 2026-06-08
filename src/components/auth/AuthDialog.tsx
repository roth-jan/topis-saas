'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export function AuthDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { signInPassword, signUpPassword, signInMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);

  const wrap = (fn: () => Promise<{ error?: string } | void>, success?: string) => async () => {
    if (!email) { toast.error('E-Mail fehlt'); return; }
    setBusy(true);
    try {
      const res = await fn();
      if (res && 'error' in res && res.error) { toast.error(res.error); return; }
      if (success) toast.success(success);
      if (!success) onOpenChange(false);
    } finally { setBusy(false); }
  };

  const doLogin = wrap(async () => {
    const r = await signInPassword(email, password);
    if (!r.error) { toast.success('Eingeloggt'); onOpenChange(false); }
    return r;
  });

  const doSignup = wrap(async () => {
    const r = await signUpPassword(email, password, displayName || undefined);
    if (r.error) return r;
    if (r.needsConfirm) { toast.success('Bestätigungs-Mail gesendet — bitte Link klicken'); }
    else { toast.success('Konto erstellt & eingeloggt'); onOpenChange(false); }
    return {};
  });

  const doMagic = wrap(async () => {
    const r = await signInMagicLink(email);
    if (!r.error) toast.success('Login-Link gesendet — bitte E-Mail prüfen');
    return r;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Anmelden</DialogTitle>
          <DialogDescription>Logge dich ein, um Layouts in der Cloud zu speichern und zu teilen.</DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="mt-2">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Registrieren</TabsTrigger>
            <TabsTrigger value="magic">Magic Link</TabsTrigger>
          </TabsList>

          <div className="space-y-3 py-4">
            <div className="space-y-1">
              <Label className="text-xs">E-Mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@firma.de" />
            </div>

            <TabsContent value="login" className="space-y-3 mt-0">
              <div className="space-y-1">
                <Label className="text-xs">Passwort</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') doLogin(); }} />
              </div>
              <Button className="w-full" onClick={doLogin} disabled={busy}>Einloggen</Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-3 mt-0">
              <div className="space-y-1">
                <Label className="text-xs">Anzeigename (optional)</Label>
                <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="z.B. Niko" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Passwort</Label>
                <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="min. 6 Zeichen" />
              </div>
              <Button className="w-full" onClick={doSignup} disabled={busy}>Konto erstellen</Button>
            </TabsContent>

            <TabsContent value="magic" className="space-y-3 mt-0">
              <p className="text-xs text-muted-foreground">Wir senden dir einen Login-Link per E-Mail — kein Passwort nötig.</p>
              <Button className="w-full" onClick={doMagic} disabled={busy}>Login-Link senden</Button>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
