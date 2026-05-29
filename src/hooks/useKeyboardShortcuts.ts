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
  const addObject = useTopisStore((s) => s.addObject);
  const undo = useTopisStore((s) => s.undo);
  const redo = useTopisStore((s) => s.redo);
  const canUndo = useTopisStore((s) => s.canUndo);
  const canRedo = useTopisStore((s) => s.canRedo);

  function duplicateSelected() {
    if (!selectedObject) {
      toast.info('Kein Objekt ausgewählt');
      return;
    }
    const { id: _id, ...rest } = selectedObject;
    void _id;
    // Bei Toren: Kopie genau eine Tor-Breite weiter — entlang der Wand, nicht
    // diagonal (Nico 22.05.). Bei Bereichen/Wänden ein paar Meter Versatz damit
    // sichtbar dass es eine Kopie ist.
    let dx = 2, dy = 2;
    if (selectedObject.type === 'tor') {
      const side = selectedObject.side;
      if (side === 'north' || side === 'south') {
        dx = selectedObject.width;
        dy = 0;
      } else if (side === 'east' || side === 'west') {
        dx = 0;
        dy = selectedObject.height;
      }
    }
    const kopie = addObject({ ...rest, x: selectedObject.x + dx, y: selectedObject.y + dy, name: selectedObject.name ? `${selectedObject.name} (Kopie)` : 'Kopie' });
    selectObject(kopie);
    toast.success('Objekt dupliziert');
  }

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
          case 'd':
            // Bei Browser-Bookmark-Konflikt (Windows: Strg+D) trotzdem versuchen
            // zu unterdrücken; alternativ greift Strg+Shift+D als Backup.
            e.preventDefault();
            e.stopPropagation();
            duplicateSelected();
            break;
          case 'z':
            e.preventDefault();
            e.stopPropagation();
            if (e.shiftKey) {
              // Strg+Shift+Z = Redo (alternative zu Strg+Y)
              if (canRedo()) { redo(); toast.success('Wiederholt'); }
              else toast.info('Nichts zum Wiederholen');
            } else {
              if (canUndo()) { undo(); toast.success('Rückgängig'); }
              else toast.info('Nichts rückgängig zu machen');
            }
            break;
          case 'y':
            e.preventDefault();
            e.stopPropagation();
            if (canRedo()) { redo(); toast.success('Wiederholt'); }
            else toast.info('Nichts zum Wiederholen');
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
  }, [setTool, toggleGrid, toggleSnap, setZoom, zoom, deleteObject, selectedObject, selectObject, addObject, undo, redo, canUndo, canRedo]);
}
