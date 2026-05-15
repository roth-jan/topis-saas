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
import { CockpitPanel } from '@/components/panels/CockpitPanel';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { GuidedTour } from '@/components/editor/GuidedTour';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LayoutGrid, Truck, BarChart3, Settings, Route, Activity, PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from 'lucide-react';

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

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Command Palette (Cmd+K) */}
      <CommandPalette />

      {/* Guided Tour (auto-start beim ersten Besuch) */}
      <GuidedTour />

      {/* Top Toolbar */}
      <Toolbar />

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1" autoSaveId="topis-editor-layout-v2">
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
          <div className="h-full border-r bg-card flex flex-col">
            <Tabs defaultValue="objects" className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b h-10 px-2 pr-1">
                <TabsTrigger value="objects" className="text-xs gap-1.5">
                  <LayoutGrid className="h-3.5 w-3.5" />
                  Objekte
                </TabsTrigger>
                <TabsTrigger value="wege" className="text-xs gap-1.5">
                  <Route className="h-3.5 w-3.5" />
                  Wege
                </TabsTrigger>
                <TabsTrigger value="gaenge" className="text-xs gap-1.5">
                  <Truck className="h-3.5 w-3.5" />
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
              <TabsContent value="objects" className="flex-1 mt-0">
                <ScrollArea className="h-full">
                  <ObjectList />
                </ScrollArea>
              </TabsContent>
              <TabsContent value="wege" className="flex-1 mt-0 p-3">
                <ScrollArea className="h-full">
                  <PathPanel />
                </ScrollArea>
              </TabsContent>
              <TabsContent value="gaenge" className="flex-1 mt-0 p-3">
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
            {/* Seitenleiste links: vertikaler Reiter wenn Panel collapsed */}
            {leftCollapsed && (
              <button
                type="button"
                onClick={toggleLeft}
                title="Linkes Panel öffnen ([)"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1 h-32 w-7 bg-primary text-primary-foreground rounded-r-md shadow-lg hover:w-9 transition-all border-y border-r border-primary/30"
                aria-label="Linkes Panel öffnen"
              >
                <PanelLeftOpen className="h-4 w-4 mx-auto" />
                <span className="sr-only">Objekte / Wege / Gänge öffnen</span>
              </button>
            )}
            {/* Seitenleiste rechts: vertikaler Reiter wenn Panel collapsed */}
            {rightCollapsed && (
              <button
                type="button"
                onClick={toggleRight}
                title="Rechtes Panel öffnen (])"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 flex items-center gap-1 h-32 w-7 bg-primary text-primary-foreground rounded-l-md shadow-lg hover:w-9 transition-all border-y border-l border-primary/30"
                aria-label="Rechtes Panel öffnen"
              >
                <PanelRightOpen className="h-4 w-4 mx-auto" />
                <span className="sr-only">Eigenschaften / Analyse öffnen</span>
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
          <div className="h-full border-l bg-card flex flex-col">
            <Tabs defaultValue="properties" className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b h-10 px-2 pr-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-1 h-7 w-7"
                  onClick={toggleRight}
                  title="Rechtes Panel einklappen (])"
                >
                  <PanelRightClose className="h-4 w-4" />
                </Button>
                <TabsTrigger value="properties" className="text-xs gap-1.5">
                  <Settings className="h-3.5 w-3.5" />
                  Eigensch.
                </TabsTrigger>
                <TabsTrigger value="cockpit" className="text-xs gap-1.5">
                  <Activity className="h-3.5 w-3.5" />
                  Cockpit
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Analyse
                </TabsTrigger>
              </TabsList>
              <TabsContent value="properties" className="flex-1 mt-0">
                <PropertiesPanel />
              </TabsContent>
              <TabsContent value="cockpit" className="flex-1 mt-0">
                <CockpitPanel />
              </TabsContent>
              <TabsContent value="analytics" className="flex-1 mt-0">
                <AnalyticsPanel />
              </TabsContent>
            </Tabs>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
