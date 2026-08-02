#!/bin/bash
# TEST-Deploy → GitHub Pages (https://roth-jan.github.io/topis-saas/).
# DAS IST DAS TESTSYSTEM. Hier landen unfertige/WIP-Stände zum Anschauen & Testen,
# OHNE Michaels Produktion (Hetzner, topis.ntc.software) anzufassen.
#
# Produktion (Michael) NUR über scripts/deploy-hetzner.sh — und NUR wenn ein Feature
# fertig + freigegeben ist.
#
# Nutzung: scripts/deploy-test.sh   (deployt den aktuellen Working-Tree-Stand)

set -e
REPO="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO"
WT="$(mktemp -d)/gh-pages-wt"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"

echo "→ TEST-Deploy von Branch '$BRANCH' nach GitHub Pages …"
echo "→ Build (Default-basePath /topis-saas) …"
npm run build

echo "→ gh-pages-Worktree + rsync …"
rm -rf "$WT"
git worktree add -q "$WT" gh-pages
rsync -a --delete --exclude='.git' out/ "$WT"/
touch "$WT/.nojekyll"
git -C "$WT" add -A
git -C "$WT" commit -q -m "test-deploy: $BRANCH $(git rev-parse --short HEAD)" || echo "  (nichts zu committen)"
git -C "$WT" push -q origin gh-pages
git worktree remove "$WT" --force
rm -rf "$(dirname "$WT")"

echo "→ Live-Check …"
sleep 2
CODE=$(curl -s -o /dev/null -w "%{http_code}" https://roth-jan.github.io/topis-saas/projekt/ || echo "?")
echo "TEST live: https://roth-jan.github.io/topis-saas/projekt/ → $CODE"
echo "OK — Produktion (topis.ntc.software) wurde NICHT verändert."
