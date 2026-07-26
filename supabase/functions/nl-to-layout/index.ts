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
    bereiche: { type: 'integer', description: 'Anzahl UNBENANNTER Lagerbereiche (nur wenn keine benannten Zonen genannt sind)' },
    zonen: {
      type: 'array',
      description: 'BENANNTE Zonen wie "Wareneingang West", "Warenausgang Ost", "WE", "WA". Himmelsrichtung → side.',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string', description: 'Name der Zone, z.B. "Wareneingang"' },
          side: { type: 'string', enum: ['north', 'south', 'east', 'west'], description: 'Himmelsrichtung der Zone, falls genannt' },
        },
        required: ['name'],
      },
    },
    stellplaetze: { type: 'integer', description: 'Anzahl Stellplätze im Innenraum (nur im Grid-Modus, NICHT wenn je Tor)' },
    stellplaetzeJeTor: { type: 'boolean', description: 'true wenn ein Stellplatz VOR JEDEM Tor gewünscht ist ("je Tor", "pro Tor", "vor jedem Tor")' },
    stellplatzLaengeM: { type: 'number', description: 'Stellplatz-Tiefe in die Halle, z.B. 12 bei "12x3"' },
    stellplatzBreiteM: { type: 'number', description: 'Stellplatz-Breite entlang der Wand, z.B. 3 bei "12x3"' },
    mittelgangM: { type: 'number', description: 'Breite des zentralen Längsgangs/Mittelgangs in Metern' },
    flaechen: {
      type: 'array',
      description: 'Sonderflächen im Innenraum (Anzahl je Art)',
      items: {
        type: 'object',
        properties: {
          art: { type: 'string', enum: ['kommissionierflaeche', 'av_platz', 'uz_platz', 'wertverschlag', 'palettenlager', 'sperrplatz', 'klaerplatz', 'gefahrgut', 'ladestation', 'hallenterminal'] },
          count: { type: 'integer' },
        },
        required: ['art', 'count'],
      },
    },
    nummerierung: { type: 'string', enum: ['fortlaufend', 'seite', 'alpha'], description: 'Tor-Nummerierung: fortlaufend (1,2,3), seite (N1,S1…), alpha (A,B,C)' },
    startNr: { type: 'integer', description: 'Startwert bei fortlaufender Nummerierung' },
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
  'Erfinde keine Werte; Unklares → "unresolved". Unbenannte Lagerbereiche → "bereiche" (Anzahl).',
  'BENANNTE Zonen ("Wareneingang West", "Warenausgang Ost", "WE", "WA", "Kommissionierzone Nord") →',
  '"zonen" [{name, side}] mit Himmelsrichtung als side — NICHT in "ignored" und NICHT als "bereiche".',
  'Stellplätze: "ein Stellplatz je/pro/vor jedem Tor" → stellplaetzeJeTor=true (NICHT stellplaetze setzen);',
  'eine feste Gesamtzahl im Innenraum → "stellplaetze". Stellplatz-Maße wie "12x3" → stellplatzLaengeM',
  '(Tiefe, größerer/erster Wert) + stellplatzBreiteM (Wand, zweiter Wert). Mittelgang/Längsgang-Breite',
  '"6 m Mittelgang" → mittelgangM. Sonderflächen (Kommissionierfläche, AV/Annahme-',
  'verweigerung, ÜZ/Überzähligkeit, Wertverschlag/Käfig, Palettenlager, Sperrplatz, Klärplatz,',
  'Gefahrgut, Ladestation, Hallenterminal) → "flaechen" [{art,count}]. Tor-Nummerierung →',
  '"nummerierung" (fortlaufend/seite/alpha) + ggf. "startNr". Alles Übrige, was das Schema',
  'nicht abbildet (Regale, Gänge/Fahrgänge, Wege, Sicherheitsabstände, Büros …) NICHT',
  'ignorieren, sondern in "ignored" auflisten. Mehrere Torreihen/Seiten erlaubt.',
  'Das erste genannte Maß ist die Halle. Ein weiteres Maß neben "Stellplatz/Stellplätze"',
  'ist das Stellplatz-Maß (stellplatzLaengeM/BreiteM); sonstige weitere Maße → "ignored".',
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
