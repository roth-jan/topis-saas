// Supabase Edge Function: nl-to-layout
// ⚠️ NOCH NICHT DEPLOYT — wartet auf Supabase-Deploy-Zugang (siehe README.md).
//
// Zweck: freie Sprache → strukturierte LayoutParams (JSON). Das LLM extrahiert NUR
// Parameter, NIE Geometrie/Koordinaten (Council-Beschluss). Die Geometrie baut der
// Client deterministisch aus diesen Parametern (src/lib/nl-layout.ts paramsToLayout).
//
// Deploy:  supabase functions deploy nl-to-layout --project-ref febebiqrjvazjozyowdt
// Secret:  supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref febebiqrjvazjozyowdt
//
// Datenschutz: nur der Eingabetext geht ans LLM, keine Kundendaten/Geometrie. Kein Logging.

const ALLOWED_ORIGINS = [
  'https://topis.ntc.software',
  'https://roth-jan.github.io',
  'http://localhost:3000',
  'http://localhost:3100',
];

const MODEL = 'claude-haiku-4-5-20251001';

// JSON-Schema für die erzwungene Tool-Ausgabe (= LayoutParams in src/lib/nl-layout.ts).
const LAYOUT_TOOL = {
  name: 'set_layout_params',
  description: 'Gibt die aus der Beschreibung extrahierten Hallen-Layout-Parameter zurück.',
  input_schema: {
    type: 'object',
    properties: {
      hall: {
        type: 'object',
        properties: {
          lengthM: { type: 'number', description: 'Hallenlänge in der angegebenen Einheit' },
          widthM: { type: 'number', description: 'Hallenbreite/-tiefe' },
          name: { type: 'string' },
        },
        required: ['lengthM', 'widthM'],
      },
      gates: {
        type: 'array',
        description: 'Eine Gruppe pro Torreihe/Wandseite',
        items: {
          type: 'object',
          properties: {
            count: { type: 'integer' },
            side: { type: 'string', enum: ['north', 'south', 'east', 'west'] },
            spacingM: { type: 'number', description: 'Achsabstand Mitte-zu-Mitte, optional' },
            firstOffsetM: { type: 'number', description: 'Abstand des ersten Tors von der Ecke, optional' },
          },
          required: ['count', 'side'],
        },
      },
      unit: { type: 'string', enum: ['m', 'ft'] },
      unresolved: { type: 'array', items: { type: 'string' }, description: 'Nicht sicher ableitbare Felder' },
      ignored: { type: 'array', items: { type: 'string' }, description: 'Erkannte, aber nicht unterstützte Angaben (Stellplätze, Bereiche, Gänge, Wege, Sicherheitsabstände …)' },
    },
    required: ['hall'],
  },
} as const;

const SYSTEM = [
  'Du extrahierst aus einer deutschen Beschreibung NUR strukturierte Parameter für ein',
  'Logistik-Hallenlayout und rufst dafür das Tool set_layout_params auf.',
  'REGELN:',
  '- Gib NIEMALS Koordinaten oder Geometrie aus, nur Parameter (Maße, Toranzahl, Seite, Abstand).',
  '- Erfinde keine Werte. Was nicht klar ist → in "unresolved".',
  '- Alles, was das Schema nicht abbildet (Stellplätze, Bereiche, Regale, Gänge/Fahrgänge,',
  '  Wege, Sicherheitsabstände, Büros …) NICHT ignorieren, sondern in "ignored" auflisten.',
  '- Mehrere Torreihen/Seiten sind erlaubt (ein Eintrag pro Reihe in "gates").',
  '- Das erste genannte Maß ist die Halle; weitere Maße gehören zu "ignored".',
].join(' ');

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };
}

// @ts-expect-error Deno global im Supabase-Edge-Runtime
Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');
  const headers = corsHeaders(origin);
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'POST erwartet' }), { status: 405, headers });

  try {
    const { text, unit } = await req.json();
    if (!text || typeof text !== 'string' || text.length > 2000) {
      return new Response(JSON.stringify({ error: 'Ungültiger Text' }), { status: 400, headers });
    }
    // @ts-expect-error Deno global
    const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
    if (!apiKey) return new Response(JSON.stringify({ error: 'Kein API-Key konfiguriert' }), { status: 500, headers });

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM,
        tools: [LAYOUT_TOOL],
        tool_choice: { type: 'tool', name: 'set_layout_params' },
        messages: [{ role: 'user', content: `Einheit-Voreinstellung: ${unit ?? 'm'}. Beschreibung: ${text}` }],
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: `LLM-Fehler ${resp.status}`, detail: t.slice(0, 300) }), { status: 502, headers });
    }
    const data = await resp.json();
    const toolUse = (data.content ?? []).find((c: { type: string }) => c.type === 'tool_use');
    if (!toolUse) return new Response(JSON.stringify({ error: 'Keine Parameter extrahiert' }), { status: 422, headers });

    const params = { action: 'createHall', ...toolUse.input, unit: toolUse.input.unit ?? unit ?? 'm' };
    return new Response(JSON.stringify(params), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers });
  }
});
