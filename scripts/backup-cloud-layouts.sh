#!/usr/bin/env bash
# Sichert ALLE Cloud-Layouts (inkl. data-Blobs) als JSON-Datei.
# Vor jedem riskanten Deploy (Datenform-/Migrations-Änderung) ausführen.
#
# Nutzung:
#   SUPABASE_PAT=sbp_... ./scripts/backup-cloud-layouts.sh
# (Token: supabase.com → Account → Access Tokens. Project-Ref s.u.)
set -euo pipefail

REF="${SUPABASE_PROJECT_REF:-febebiqrjvazjozyowdt}"   # TOPIS-Projekt
PAT="${SUPABASE_PAT:-}"
OUTDIR="${TOPIS_BACKUP_DIR:-$HOME/topis-backups}"

if [ -z "$PAT" ]; then
  echo "FEHLER: SUPABASE_PAT nicht gesetzt. Beispiel:" >&2
  echo "  SUPABASE_PAT=sbp_xxx ./scripts/backup-cloud-layouts.sh" >&2
  exit 1
fi

mkdir -p "$OUTDIR"
TS="$(date +%Y%m%d-%H%M%S)"
OUT="$OUTDIR/topis-layouts-$TS.json"

echo "Sichere Cloud-Layouts von Projekt $REF ..."
# Vollständige Zeilen inkl. data-Blob + Shares als ein JSON-Objekt holen.
RESP="$(curl -s --max-time 60 -X POST \
  -H "Authorization: Bearer $PAT" -H "Content-Type: application/json" \
  "https://api.supabase.com/v1/projects/$REF/database/query" \
  -d '{"query":"select json_build_object('"'"'layouts'"'"', (select coalesce(json_agg(l),'"'"'[]'"'"'::json) from layouts l), '"'"'shares'"'"', (select coalesce(json_agg(s),'"'"'[]'"'"'::json) from layout_shares s), '"'"'profiles'"'"', (select coalesce(json_agg(p),'"'"'[]'"'"'::json) from profiles p)) as dump"}')"

echo "$RESP" | python3 -c '
import sys, json
d = json.load(sys.stdin)
if isinstance(d, dict) and d.get("message"):
    sys.stderr.write("API-Fehler: " + d["message"] + "\n"); sys.exit(1)
dump = d[0]["dump"]
json.dump(dump, open(sys.argv[1], "w"), ensure_ascii=False, indent=2)
n = len(dump.get("layouts", []))
print(f"OK: {n} Layout(s) gesichert nach {sys.argv[1]}")
' "$OUT"
