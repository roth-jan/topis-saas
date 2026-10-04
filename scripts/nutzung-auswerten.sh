#!/usr/bin/env bash
# Nutzungsprotokoll auswerten: Zeitachse je Nutzer und Sitzung (deutsche Zeit).
#
#   SUPABASE_PAT=sbp_... ./scripts/nutzung-auswerten.sh                     # alle, letzte 14 Tage, nur prod
#   SUPABASE_PAT=sbp_... ./scripts/nutzung-auswerten.sh mlaufenburg 30       # ein Nutzer (E-Mail-Teil), 30 Tage
#   SUPABASE_PAT=sbp_... UMGEBUNG=test ./scripts/nutzung-auswerten.sh        # Test-Umgebung
#
# Liest über die Management-API (es gibt bewusst keine Lese-Policy in der Tabelle).
# Was protokolliert wird und was nie: src/lib/nutzung.ts
set -euo pipefail

REF="${SUPABASE_PROJECT_REF:-febebiqrjvazjozyowdt}"
PAT="${SUPABASE_PAT:?SUPABASE_PAT setzen (supabase.com → Account → Access Tokens)}"
WER="${1:-}"
TAGE="${2:-14}"
UMG="${UMGEBUNG:-prod}"

[[ "$TAGE" =~ ^[0-9]+$ ]] || { echo "Tage muss eine Zahl sein" >&2; exit 1; }
[[ "$UMG" =~ ^(prod|test)$ ]] || { echo "UMGEBUNG = prod oder test" >&2; exit 1; }
[[ "$WER" =~ ^[A-Za-z0-9._@-]*$ ]] || { echo "Nutzer-Filter: nur Buchstaben, Ziffern, . _ @ -" >&2; exit 1; }

SQL="select u.email, e.sitzung, to_char(e.created_at at time zone 'Europe/Berlin', 'DD.MM. HH24:MI:SS') as zeit,
            e.ereignis, coalesce(e.detail::text, '') as detail, coalesce(e.pfad, '') as pfad
     from nutzungsereignisse e join auth.users u on u.id = e.user_id
     where e.created_at > now() - interval '$TAGE days' and e.umgebung = '$UMG'
       and u.email ilike '%$WER%'
     order by u.email, e.created_at"

python3 -c 'import json,sys; print(json.dumps({"query": sys.argv[1]}))' "$SQL" \
| curl -s --max-time 60 -X POST -H "Authorization: Bearer $PAT" -H "Content-Type: application/json" \
    "https://api.supabase.com/v1/projects/$REF/database/query" -d @- \
| python3 -c '
import json, sys
d = json.load(sys.stdin)
if isinstance(d, dict):
    sys.exit("API-Fehler: " + str(d.get("message", d)))
if not d:
    print("Keine Ereignisse im Zeitraum."); sys.exit(0)
nutzer = sitzung = None
for r in d:
    if r["email"] != nutzer:
        nutzer = r["email"]; sitzung = None
        print(f"\n=== {nutzer} ===")
    if r["sitzung"] != sitzung:
        sitzung = r["sitzung"]
        print(f"  -- Sitzung {sitzung[:8]} --")
    print("  %s  %-10s %-26s %s" % (r["zeit"], r["pfad"], r["ereignis"], r["detail"]))
'
