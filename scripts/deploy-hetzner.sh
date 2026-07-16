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

echo "→ Build (basePath='')"
TOPIS_BASE_PATH="" npm run build

echo "→ Upload nach /opt/topis/www"
rsync -az --delete -e "ssh -i $HOME/.ssh/jobbi_hetzner" out/ root@46.224.185.100:/opt/topis/www/

echo "→ Live-Check"
code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 https://topis.ntc.software/cockpit/)
echo "https://topis.ntc.software/cockpit/ → $code"
[ "$code" = "200" ] || { echo "FEHLER: unerwarteter Status"; exit 1; }
echo "OK"
