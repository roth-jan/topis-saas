'use client';

import { useRef, useState, useEffect } from 'react';
import type { ImperativePanelHandle } from 'react-resizable-panels';
import { HallCanvas } from '@/components/canvas/HallCanvas';
import { Toolbar } from '@/components/editor/Toolbar';
import { ObjectList } from '@/components/editor/ObjectList';
import { PropertiesPanel } from '@/components/editor/PropertiesPanel';
import { CommandPalette } from '@/components/editor/CommandPalette';
import { GangPanel } from '@/components/panels/GangPanel';
import { PathPanel } from '@/components/panels/PathPanel';
import { AnalyticsPanel } from '@/components/panels/AnalyticsPanel';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Truck, BarChart3, Settings, Route, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';

export default function EditorPage() {
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  // Panel-Refs für collapse/expand
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const toggleLeft = () => {
    const p = leftPanelRef.current;
    if (!p) return;
    if (p.isCollapsed()) p.expand(); else p.collapse();
  };
  const toggleRight = () => {
    const p = rightPanelRef.current;
    if (!p) return;
    if (p.isCollapsed()) p.expand(); else p.collapse();
  };

  // Keyboard shortcuts: [ für links, ] für rechts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
      if (e.key === '[') { toggleLeft(); e.preventDefault(); }
      else if (e.key === ']') { toggleRight(); e.preventDefault(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Tablet-Default: auf Touch-Geraeten mit Viewport < 1024px beide Sidebars
  // initial einmal pro Session einklappen, damit das Canvas Platz hat.
  // sessionStorage-Flag merkt sich dass wir das schon gemacht haben, damit
  // der User die Sidebars wieder ausklappen kann ohne dass sie sofort
  // wieder zugehen. Auf Laptop (pointer:fine ODER >=1024px) wird hier
  // nichts angefasst.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const isTablet = window.matchMedia('(pointer: coarse)').matches && window.innerWidth < 1024;
    if (!isTablet) return;
    try {
      if (sessionStorage.getItem('topis-tablet-sidebars-collapsed') === '1') return;
      sessionStorage.setItem('topis-tablet-sidebars-collapsed', '1');
    } catch {
      // sessionStorage nicht verfuegbar — dann eben jedes Mal collapsen
    }
    const t = setTimeout(() => {
      leftPanelRef.current?.collapse();
      rightPanelRef.current?.collapse();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Command Palette (Cmd+K) */}
      <CommandPalette />

      {/* Guided Tour komplett entfernt — alte Schritte verwiesen auf Elemente
          die in der neuen Workflow-Phasen-Toolbar fehlen → driver.js-Overlay
          blockierte alle Klicks. Bleibt als Code-Datei für späteren Wieder-
          aufbau. */}

      {/* Top Toolbar — mit Schatten + dickerer Trennlinie, damit Canvas optisch klar darunter sitzt */}
      <div className="shadow-md shadow-black/20 border-b-2 border-border z-30 relative">
        <Toolbar />
      </div>

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0" autoSaveId="topis-editor-layout-v2">
        {/* Left Sidebar - Object List & Gänge */}
        <ResizablePanel
          id="left-panel"
          ref={leftPanelRef}
          defaultSize={18}
          minSize={12}
          maxSize={30}
          collapsible
          collapsedSize={0}
          onCollapse={() => setLeftCollapsed(true)}
          onExpand={() => setLeftCollapsed(false)}
          order={1}
        >
          <div className="h-full border-r bg-card flex flex-col min-h-0">
            <Tabs defaultValue="objects" className="flex-1 flex flex-col min-h-0">
              <TabsList className="w-full justify-start rounded-none border-b-2 h-11 px-2 pr-1 shrink-0 bg-muted/40">
                <TabsTrigger value="objects" className="text-sm gap-1.5 px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <LayoutGrid className="h-4 w-4" />
                  Objekte
                </TabsTrigger>
                <TabsTrigger value="wege" className="text-sm gap-1.5 px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Route className="h-4 w-4" />
                  Wege
                </TabsTrigger>
                <TabsTrigger value="gaenge" className="text-sm gap-1.5 px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Truck className="h-4 w-4" />
                  Gänge
                </TabsTrigger>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto h-7 w-7"
                  onClick={toggleLeft}
                  title="Linkes Panel einklappen ([)"
                >
                  <PanelLeftClose className="h-4 w-4" />
                </Button>
              </TabsList>
              <TabsContent value="objects" className="flex-1 mt-0 min-h-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <ObjectList />
                </ScrollArea>
              </TabsContent>
              <TabsContent value="wege" className="flex-1 mt-0 p-3 min-h-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <PathPanel />
                </ScrollArea>
              </TabsContent>
              <TabsContent value="gaenge" className="flex-1 mt-0 p-3 min-h-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <GangPanel />
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Canvas Area */}
        <ResizablePanel id="canvas-panel" order={2} defaultSize={62}>
          <div className="relative h-full">
            {/* Seitenleiste links: breiter Reiter mit Beschriftung wenn Panel collapsed */}
            {leftCollapsed && (
              <button
                type="button"
                onClick={toggleLeft}
                title="Linkes Panel öffnen ([)"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center gap-2 py-[7px] h-44 w-10 bg-primary text-primary-foreground rounded-r-md shadow-lg hover:bg-primary/90 hover:shadow-xl transition-[background-color,box-shadow] duration-200 border border-l-0 border-primary-foreground/30"
                aria-label="Linkes Panel öffnen — Objekte, Wege, Gänge"
              >
                <PanelLeftOpen className="h-5 w-5" />
                <span className="text-[10px] font-medium tracking-wider rotate-180 [writing-mode:vertical-rl]">
                  OBJEKTE · WEGE · GÄNGE
                </span>
              </button>
            )}
            {/* Seitenleiste rechts: breiter Reiter mit Beschriftung wenn Panel collapsed */}
            {rightCollapsed && (
              <button
                type="button"
                onClick={toggleRight}
                title="Rechtes Panel öffnen (])"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center justify-center gap-2 py-[7px] h-44 w-10 bg-primary text-primary-foreground rounded-l-md shadow-lg hover:bg-primary/90 hover:shadow-xl transition-[background-color,box-shadow] duration-200 border border-r-0 border-primary-foreground/30"
                aria-label="Rechtes Panel öffnen — Eigenschaften, Analyse"
              >
                <PanelRightOpen className="h-5 w-5" />
                <span className="text-[10px] font-medium tracking-wider [writing-mode:vertical-rl]">
                  EIGENSCHAFTEN · ANALYSE
                </span>
              </button>
            )}
            <HallCanvas />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Sidebar - Properties & Analytics */}
        <ResizablePanel
          id="right-panel"
          order={3}
          ref={rightPanelRef}
          defaultSize={20}
          minSize={15}
          maxSize={30}
          collapsible
          collapsedSize={0}
          onCollapse={() => setRightCollapsed(true)}
          onExpand={() => setRightCollapsed(false)}
        >
          <div className="h-full border-l bg-card flex flex-col min-h-0">
            <Tabs defaultValue="properties" className="flex-1 flex flex-col min-h-0">
              <TabsList className="w-full justify-start rounded-none border-b-2 h-11 px-2 pr-1 shrink-0 bg-muted/40">
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-1 h-7 w-7"
                  onClick={toggleRight}
                  title="Rechtes Panel einklappen (])"
                >
                  <PanelRightClose className="h-4 w-4" />
                </Button>
                <TabsTrigger value="properties" className="text-sm gap-1.5 px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <Settings className="h-4 w-4" />
                  Eigenschaften
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-sm gap-1.5 px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                  <BarChart3 className="h-4 w-4" />
                  Analyse
                </TabsTrigger>
              </TabsList>
              <TabsContent value="properties" className="flex-1 mt-0 min-h-0 overflow-hidden">
                <PropertiesPanel />
              </TabsContent>
              <TabsContent value="analytics" className="flex-1 mt-0 min-h-0 overflow-hidden">
                <AnalyticsPanel />
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
