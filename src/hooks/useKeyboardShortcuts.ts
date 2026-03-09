'use client';

import { useEffect } from 'react';
import { useTopisStore } from '@/lib/store';
import { Tool } from '@/types/topis';
import { toast } from 'sonner';

export function useKeyboardShortcuts() {
  const setTool = useTopisStore((s) => s.setTool);
  const toggleGrid = useTopisStore((s) => s.toggleGrid);
  const toggleSnap = useTopisStore((s) => s.toggleSnap);
  const setZoom = useTopisStore((s) => s.setZoom);
  const zoom = useTopisStore((s) => s.zoom);
  const deleteObject = useTopisStore((s) => s.deleteObject);
  const selectedObject = useTopisStore((s) => s.selectedObject);
  const selectObject = useTopisStore((s) => s.selectObject);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      // Tool shortcuts (single keys)
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            setTool('select');
            toast.success('Auswahl-Werkzeug');
            break;
          case 'h':
            setTool('pan');
            toast.success('Verschieben-Werkzeug');
            break;
          case 't':
            setTool('tor');
            toast.success('Tor-Werkzeug');
            break;
          case 's':
            if (!e.shiftKey) {
              setTool('stellplatz');
              toast.success('Stellplatz-Werkzeug');
            }
            break;
          case 'b':
            setTool('bereich');
            toast.success('Bereich-Werkzeug');
            break;
          case 'p':
            setTool('path');
            toast.success('Pfad-Werkzeug');
            break;
          case 'g':
            toggleGrid();
            break;
          case 'escape':
            selectObject(null);
            setTool('select');
            break;
          case 'delete':
          case 'backspace':
            if (selectedObject) {
              deleteObject(selectedObject.id);
              toast.success('Objekt gelöscht');
            }
            break;
          case '+':
          case '=':
            setZoom(zoom * 1.2);
            break;
          case '-':
            setZoom(zoom / 1.2);
            break;
          case '0':
            setZoom(1);
            toast.success('Zoom zurückgesetzt');
            break;
        }
      }

      // Ctrl/Cmd shortcuts
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            toast.info('Projekt gespeichert');
            break;
          case 'z':
            e.preventDefault();
            toast.info('Rückgängig');
            break;
          case 'y':
            e.preventDefault();
            toast.info('Wiederholen');
            break;
          case 'a':
            e.preventDefault();
            toast.info('Alle auswählen');
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [setTool, toggleGrid, toggleSnap, setZoom, zoom, deleteObject, selectedObject, selectObject]);
}
