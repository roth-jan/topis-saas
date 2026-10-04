#!/usr/bin/env bash
# TOPIS → Hetzner (https://topis.ntc.software)
#
# Statischer Next-Export ohne basePath, per rsync auf den Jobbi-Server
# (46.224.185.100, /opt/topis/www). Ausgeliefert von nginx (topis-web),
# HTTPS macht der gemeinsame jobbi-Caddy (vhost in /opt/jobbi-schultool/Caddyfile).
# Kein Docker-Build, kein RAM-Bedarf — reine Dateien.
#
# Nutzung:  ./scripts/deploy-hetzner.sh
set -euo pipefail
cd "$(dirname "$0")/.."

# Fehlerüberwachung: Der DSN ist NICHT geheim (er steckt im ausgelieferten
# Bundle, so ist er gedacht) — er steht hier, damit ein Deploy ihn nicht vergisst.
# Ohne ihn meldet die Seite still gar nichts. Die Kennung des Standes kommt aus
# git, damit man am Fehler sieht, aus welchem Deploy er stammt.
SENTRY_DSN_TOPIS="${NEXT_PUBLIC_SENTRY_DSN:-https://f5b3935d45767a049198c49a78b09a70@o4512157918363648.ingest.de.sentry.io/4512157961551952}"
RELEASE="topis@$(git rev-parse --short HEAD)"

echo "→ Build (basePath='', Fehlerüberwachung an, Stand $RELEASE)"
TOPIS_BASE_PATH="" \
  NEXT_PUBLIC_SENTRY_DSN="$SENTRY_DSN_TOPIS" \
  NEXT_PUBLIC_SENTRY_RELEASE="$RELEASE" \
  NEXT_PUBLIC_TOPIS_UMGEBUNG=prod \
  npm run build

echo "→ Upload nach /opt/topis/www"
rsync -az --delete -e "ssh -i ${TOPIS_SSH_KEY:-$HOME/.ssh/jobbi_hetzner}" out/ root@46.224.185.100:/opt/topis/www/

echo "→ Live-Check"
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 https://topis.ntc.software/cockpit/)
echo "https://topis.ntc.software/cockpit/ → $code"
[ "$code" = "200" ] || { echo "FEHLER: unerwarteter Status"; exit 1; }
echo "OK"
