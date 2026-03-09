'use client';

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
import { LayoutGrid, Truck, BarChart3, Settings, Route } from 'lucide-react';

export default function EditorPage() {
  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Command Palette (Cmd+K) */}
      <CommandPalette />

      {/* Top Toolbar */}
      <Toolbar />

      {/* Main Content */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left Sidebar - Object List & Gänge */}
        <ResizablePanel defaultSize={18} minSize={15} maxSize={30}>
          <div className="h-full border-r bg-card flex flex-col">
            <Tabs defaultValue="objects" className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b h-10 px-2">
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
        <ResizablePanel defaultSize={62}>
          <HallCanvas />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Sidebar - Properties & Analytics */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <div className="h-full border-l bg-card flex flex-col">
            <Tabs defaultValue="properties" className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b h-10 px-2">
                <TabsTrigger value="properties" className="text-xs gap-1.5">
                  <Settings className="h-3.5 w-3.5" />
                  Eigenschaften
                </TabsTrigger>
                <TabsTrigger value="analytics" className="text-xs gap-1.5">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Analyse
                </TabsTrigger>
              </TabsList>
              <TabsContent value="properties" className="flex-1 mt-0">
                <PropertiesPanel />
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
