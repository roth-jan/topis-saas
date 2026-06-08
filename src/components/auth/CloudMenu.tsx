'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AuthScreen } from './AuthScreen';
import { CloudProjekteDialog } from '@/components/dialogs/CloudProjekteDialog';
import { Cloud, LogIn, LogOut, User as UserIcon } from 'lucide-react';

export function CloudMenu() {
  const { user, configured, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [cloudOpen, setCloudOpen] = useState(false);

  // Ohne Supabase-Config gar nichts anzeigen (App bleibt localStorage-only).
  if (!configured) return null;

  return (
    <>
      {!user ? (
        <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => setAuthOpen(true)}>
          <LogIn className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Anmelden</span>
        </Button>
      ) : (
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="gap-1.5 h-8" onClick={() => setCloudOpen(true)}>
            <Cloud className="h-3.5 w-3.5" />
            <span className="hidden lg:inline">Cloud</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8"><UserIcon className="h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="truncate max-w-[200px]">
                {user.user_metadata?.display_name || user.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCloudOpen(true)}>
                <Cloud className="mr-2 h-4 w-4" /> Cloud-Projekte
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" /> Abmelden
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}

      <AuthScreen open={authOpen} onOpenChange={setAuthOpen} />
      <CloudProjekteDialog open={cloudOpen} onOpenChange={setCloudOpen} onNeedLogin={() => setAuthOpen(true)} />
    </>
  );
}
