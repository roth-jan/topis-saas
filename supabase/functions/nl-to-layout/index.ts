// Supabase Edge Function: nl-to-layout
// Freie Sprache → strukturierte LayoutParams (JSON). Das LLM extrahiert NUR Parameter,
// NIE Geometrie/Koordinaten (Council-Beschluss). Die Geometrie baut der Client
// deterministisch (src/lib/nl-layout.ts paramsToLayout).
//
// Provider: OpenAI gpt-4o-mini (Function-Calling erzwingt gültiges JSON). Umstellbar auf
// Claude Haiku, sobald ein ANTHROPIC_API_KEY vorliegt.
//
// Deploy:  supabase functions deploy nl-to-layout --project-ref febebiqrjvazjozyowdt
// Secret:  supabase secrets set OPENAI_API_KEY=sk-... --project-ref febebiqrjvazjozyowdt
// Datenschutz: nur der Eingabetext geht ans LLM, kein Logging.

const ALLOWED_ORIGINS = [
  'https://topis.ntc.software',
  'https://roth-jan.github.io',
  'http://localhost:3000',
  'http://localhost:3100',
];

const MODEL = 'gpt-4o-mini';

const PARAMS_SCHEMA = {
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
          firstOffsetM: { type: 'number', description: 'Abstand erstes Tor von der Ecke, optional' },
        },
        required: ['count', 'side'],
      },
    },
    unit: { type: 'string', enum: ['m', 'ft'] },
    unresolved: { type: 'array', items: { type: 'string' } },
    ignored: { type: 'array', items: { type: 'string' } },
  },
  required: ['hall'],
};

const SYSTEM = [
  'Du extrahierst aus einer deutschen Beschreibung NUR strukturierte Parameter für ein',
  'Logistik-Hallenlayout und rufst dafür die Funktion set_layout_params auf.',
  'REGELN: Gib NIEMALS Koordinaten/Geometrie aus, nur Parameter (Maße, Toranzahl, Seite, Abstand).',
  'Erfinde keine Werte; Unklares → "unresolved". Alles, was das Schema nicht abbildet',
  '(Stellplätze, Bereiche, Regale, Gänge/Fahrgänge, Wege, Sicherheitsabstände, Büros …)',
  'NICHT ignorieren, sondern in "ignored" auflisten. Mehrere Torreihen/Seiten erlaubt.',
  'Das erste genannte Maß ist die Halle; weitere Maße gehören zu "ignored".',
].join(' ');

function cors(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey',
    'Content-Type': 'application/json',
  };
}

// @ts-expect-error Deno global im Supabase-Edge-Runtime
Deno.serve(async (req: Request) => {
  const headers = cors(req.headers.get('origin'));
  if (req.method === 'OPTIONS') return new Response('ok', { headers });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'POST erwartet' }), { status: 405, headers });

  try {
    const { text, unit } = await req.json();
    if (!text || typeof text !== 'string' || text.length > 2000) {
      return new Response(JSON.stringify({ error: 'Ungültiger Text' }), { status: 400, headers });
    }
    // @ts-expect-error Deno global
    const apiKey = Deno.env.get('OPENAI_API_KEY');
    if (!apiKey) return new Response(JSON.stringify({ error: 'Kein API-Key konfiguriert' }), { status: 500, headers });

    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0,
        max_tokens: 700, // Kostendeckel — Ausgabe ist klein (nur Parameter-JSON)
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: `Einheit-Voreinstellung: ${unit ?? 'm'}. Beschreibung: ${text}` },
        ],
        tools: [{ type: 'function', function: { name: 'set_layout_params', description: 'Extrahierte Hallen-Layout-Parameter', parameters: PARAMS_SCHEMA } }],
        tool_choice: { type: 'function', function: { name: 'set_layout_params' } },
      }),
    });
    if (!resp.ok) {
      const t = await resp.text();
      return new Response(JSON.stringify({ error: `LLM-Fehler ${resp.status}`, detail: t.slice(0, 300) }), { status: 502, headers });
    }
    const data = await resp.json();
    const args = data?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) return new Response(JSON.stringify({ error: 'Keine Parameter extrahiert' }), { status: 422, headers });
    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(args); } catch { return new Response(JSON.stringify({ error: 'Ungültiges JSON vom LLM' }), { status: 502, headers }); }

    const params = { action: 'createHall', ...parsed, unit: parsed.unit ?? unit ?? 'm' };
    return new Response(JSON.stringify(params), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers });
  }
});
