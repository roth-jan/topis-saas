'use client';

import { useEffect, useId, useState } from 'react';
import type { TopisObject } from '@/types/topis';

/**
 * Native datalist-basierte Combobox für Tor-/Bereichs-Auswahl.
 * Tippt der User "47", filtert der Browser die Optionen automatisch.
 * Pfeiltasten + Enter funktionieren wie gewohnt.
 *
 * Gibt beim Commit (Enter / Blur / Klick auf eine Option) die Object-ID zurück.
 */
export function TorComboBox({
  value,
  options,
  onChange,
  placeholder,
  width = 140,
  allowNone = false,
  noneLabel = '— keine —',
}: {
  value: number | null;
  options: TopisObject[];
  onChange: (id: number | null) => void;
  placeholder?: string;
  width?: number;
  allowNone?: boolean;
  noneLabel?: string;
}) {
  const listId = useId();
  const selectedObj = options.find((o) => o.id === value);
  const [text, setText] = useState(selectedObj?.name ?? '');

  // Wenn das value von außen wechselt (z.B. forkSimAuftragAsSim), Text mit ziehen
  useEffect(() => {
    setText(selectedObj?.name ?? '');
  }, [selectedObj?.name]);

  function commit(raw: string) {
    const trimmed = raw.trim();
    if (allowNone && trimmed === '') {
      onChange(null);
      setText('');
      return;
    }
    // Exakter Match (case-insensitiv)
    let found = options.find((o) => (o.name ?? '').toLowerCase() === trimmed.toLowerCase());
    if (!found) {
      // Substring-Match — User hat z.B. "47" eingetippt
      const matches = options.filter((o) => (o.name ?? '').toLowerCase().includes(trimmed.toLowerCase()));
      if (matches.length === 1) {
        found = matches[0];
      } else if (matches.length > 1) {
        // Bevorzuge exaktes "Tor N"-Match
        const torNum = trimmed.match(/^(\d+)$/);
        if (torNum) {
          const exact = matches.find((o) => o.name === `Tor ${torNum[1]}`);
          if (exact) found = exact;
        }
      }
    }
    if (found) {
      onChange(found.id);
      setText(found.name ?? '');
    } else {
      // ungültig → auf vorigen Wert zurück
      setText(selectedObj?.name ?? '');
    }
  }

  return (
    <>
      <input
        list={listId}
        value={text}
        placeholder={placeholder}
        onChange={(e) => setText(e.target.value)}
        onBlur={(e) => commit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            commit((e.target as HTMLInputElement).value);
            (e.target as HTMLInputElement).blur();
          }
          if (e.key === 'Escape') {
            setText(selectedObj?.name ?? '');
            (e.target as HTMLInputElement).blur();
          }
        }}
        className="h-7 text-xs bg-background border rounded px-1.5 focus:outline-none focus:ring-1 focus:ring-primary"
        style={{ width }}
      />
      <datalist id={listId}>
        {allowNone && <option value="" label={noneLabel} />}
        {options.map((o) => (
          <option key={o.id} value={o.name ?? ''} />
        ))}
      </datalist>
    </>
  );
}
