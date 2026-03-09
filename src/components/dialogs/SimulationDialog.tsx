'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Play } from 'lucide-react';
import { SimulationPanel } from '@/components/panels/SimulationPanel';

export function SimulationDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button size="sm" className="gap-1.5 h-8">
          <Play className="h-3.5 w-3.5" />
          <span className="hidden md:inline">Simulation</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[400px] sm:w-[450px] p-0">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>FFZ-Simulation</SheetTitle>
          <SheetDescription>
            Simuliere Fahrzeugbewegungen und analysiere die Effizienz.
          </SheetDescription>
        </SheetHeader>
        <div className="h-[calc(100vh-100px)]">
          <SimulationPanel />
        </div>
      </SheetContent>
    </Sheet>
  );
}
