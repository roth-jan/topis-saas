# nl-to-layout — Edge Function (freie Sprache → LayoutParams)

⚠️ Noch nicht deployt. Vorbereitet, wartet auf Supabase-Deploy-Zugang.

## Deploy
```bash
supabase functions deploy nl-to-layout --project-ref febebiqrjvazjozyowdt
supabase secrets set ANTHROPIC_API_KEY=sk-ant-... --project-ref febebiqrjvazjozyowdt
```
Dann im Frontend `.env.local`:
```
NEXT_PUBLIC_NL_ENDPOINT=https://febebiqrjvazjozyowdt.supabase.co/functions/v1/nl-to-layout
```
und den KI-Textbuilder von `parseCanonical` auf `resolveLayoutParams` (src/lib/nl-llm.ts) umstellen
(async). Ohne Endpoint bleibt der deterministische Offline-Parser aktiv.

## Prinzip
LLM (Claude Haiku 4.5) liefert NUR Parameter (Tool-erzwungenes JSON = LayoutParams), nie Geometrie.
Datenschutz: nur der Eingabetext geht raus, kein Logging.
