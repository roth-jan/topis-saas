'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth';
import {
  listLayouts, loadLayout, createLayout, saveLayout, renameLayout, deleteLayout,
  applyLayoutData, findProfileByEmail, listShares, shareLayout, unshareLayout,
  type CloudLayout,
} from '@/lib/cloud-layouts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cloud, Download, Save, Trash2, Share2, Plus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function CloudProjekteDialog({
  open, onOpenChange, onNeedLogin,
}: { open: boolean; onOpenChange: (o: boolean) => void; onNeedLogin: () => void }) {
  const { user } = useAuth();
  const [layouts, setLayouts] = useState<CloudLayout[]>([]);
  const [loading, setLoading] = useState(false);
  const [newName, setNewName] = useState('');
  const [shareFor, setShareFor] = useState<CloudLayout | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try { setLayouts(await listLayouts()); }
    catch (e) { toast.error('Laden fehlgeschlagen: ' + (e as Error).message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (open && user) refresh();
  }, [open, user, refresh]);

  if (open && !user) {
    // Nicht eingeloggt → Login anstoßen
    onOpenChange(false);
    onNeedLogin();
    return null;
  }

  const handleNew = async () => {
    const name = newName.trim() || 'Neues Layout';
    try {
      await createLayout(name);
      setNewName('');
      toast.success(`„${name}" in Cloud gespeichert`);
      refresh();
    } catch (e) { toast.error('Speichern fehlgeschlagen: ' + (e as Error).message); }
  };

  const handleLoad = async (l: CloudLayout) => {
    try {
      const data = await loadLayout(l.id);
      toast.success(`„${l.name}" wird geladen…`);
      applyLayoutData(data); // reloaded die Seite
    } catch (e) { toast.error('Laden fehlgeschlagen: ' + (e as Error).message); }
  };

  const handleSave = async (l: CloudLayout) => {
    try { await saveLayout(l.id); toast.success(`„${l.name}" aktualisiert`); refresh(); }
    catch (e) { toast.error('Speichern fehlgeschlagen: ' + (e as Error).message); }
  };

  const handleRename = async (l: CloudLayout) => {
    const name = prompt('Neuer Name', l.name);
    if (!name) return;
    try { await renameLayout(l.id, name); refresh(); }
    catch (e) { toast.error((e as Error).message); }
  };

  const handleDelete = async (l: CloudLayout) => {
    if (!confirm(`„${l.name}" wirklich löschen?`)) return;
    try { await deleteLayout(l.id); toast.success('Gelöscht'); refresh(); }
    catch (e) { toast.error((e as Error).message); }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Cloud className="h-4 w-4" /> Cloud-Projekte</DialogTitle>
            <DialogDescription>Layouts in der Cloud speichern, laden und gezielt mit anderen teilen.</DialogDescription>
          </DialogHeader>

          {/* Neu speichern */}
          <div className="flex items-center gap-2 py-2">
            <Input placeholder="Name für aktuelles Layout…" value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleNew(); }} />
            <Button onClick={handleNew} className="gap-1.5 shrink-0"><Plus className="h-4 w-4" /> Als neu speichern</Button>
          </div>

          {/* Liste */}
          <div className="max-h-[50vh] overflow-y-auto space-y-2">
            {loading && <div className="flex items-center gap-2 text-sm text-muted-foreground py-4"><Loader2 className="h-4 w-4 animate-spin" /> Lädt…</div>}
            {!loading && layouts.length === 0 && <p className="text-sm text-muted-foreground py-4">Noch keine Cloud-Layouts. Oben eins anlegen.</p>}
            {layouts.map((l) => {
              const mine = l.owner === user?.id;
              return (
                <div key={l.id} className="flex items-center justify-between gap-2 rounded-md border p-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{l.name}</span>
                      {!mine && <Badge variant="secondary" className="text-[10px]">geteilt</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">Aktualisiert {new Date(l.updated_at).toLocaleString('de-DE')}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button size="sm" variant="ghost" title="Laden" onClick={() => handleLoad(l)}><Download className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" title="Aktuellen Stand hier speichern" onClick={() => handleSave(l)}><Save className="h-4 w-4" /></Button>
                    {mine && <Button size="sm" variant="ghost" title="Teilen" onClick={() => setShareFor(l)}><Share2 className="h-4 w-4" /></Button>}
                    {mine && <Button size="sm" variant="ghost" title="Umbenennen" onClick={() => handleRename(l)}>✎</Button>}
                    {mine && <Button size="sm" variant="ghost" title="Löschen" onClick={() => handleDelete(l)}><Trash2 className="h-4 w-4 text-destructive" /></Button>}
                  </div>
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {shareFor && <SharePanel layout={shareFor} onClose={() => setShareFor(null)} />}
    </>
  );
}

function SharePanel({ layout, onClose }: { layout: CloudLayout; onClose: () => void }) {
  const [shares, setShares] = useState<Awaited<ReturnType<typeof listShares>>>([]);
  const [email, setEmail] = useState('');
  const [perm, setPerm] = useState<'view' | 'edit'>('view');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    try { setShares(await listShares(layout.id)); } catch (e) { toast.error((e as Error).message); }
  }, [layout.id]);
  useEffect(() => { refresh(); }, [refresh]);

  const add = async () => {
    if (!email.trim()) return;
    setBusy(true);
    try {
      const prof = await findProfileByEmail(email);
      if (!prof) { toast.error('Kein Nutzer mit dieser E-Mail gefunden (muss sich erst registriert haben)'); return; }
      await shareLayout(layout.id, prof.id, perm);
      toast.success(`Geteilt mit ${prof.display_name || prof.email}`);
      setEmail('');
      refresh();
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  };

  const remove = async (userId: string) => {
    try { await unshareLayout(layout.id, userId); refresh(); } catch (e) { toast.error((e as Error).message); }
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Share2 className="h-4 w-4" /> „{layout.name}" teilen</DialogTitle>
          <DialogDescription>Gib die E-Mail einer registrierten Person ein und wähle die Berechtigung.</DialogDescription>
        </DialogHeader>

        <div className="flex items-end gap-2 py-2">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">E-Mail</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') add(); }} placeholder="name@firma.de" />
          </div>
          <Select value={perm} onValueChange={(v) => setPerm(v as 'view' | 'edit')}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="view">Ansehen</SelectItem>
              <SelectItem value="edit">Bearbeiten</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={add} disabled={busy} className="shrink-0">Teilen</Button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {shares.length === 0 && <p className="text-sm text-muted-foreground">Noch mit niemandem geteilt.</p>}
          {shares.map((s) => (
            <div key={s.shared_with} className="flex items-center justify-between gap-2 rounded-md border p-2">
              <div className="min-w-0">
                <div className="font-medium truncate text-sm">{s.profile?.display_name || s.profile?.email || s.shared_with}</div>
                <div className="text-xs text-muted-foreground">{s.permission === 'edit' ? 'Bearbeiten' : 'Ansehen'}</div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => remove(s.shared_with)}><X className="h-4 w-4" /></Button>
            </div>
          ))}
        </div>

        <DialogFooter><Button variant="outline" onClick={onClose}>Schließen</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
