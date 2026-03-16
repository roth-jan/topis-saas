#!/bin/bash
set -e

echo "=== TOPIS SaaS Deploy ==="

# Build
echo "→ Building..."
npm run build

# Prepare gh-pages
TMPDIR=$(mktemp -d)
echo "→ Copying build to $TMPDIR..."
cp -r out/* "$TMPDIR/"
touch "$TMPDIR/.nojekyll"

# Switch to gh-pages, update, switch back
CURRENT_BRANCH=$(git branch --show-current)
echo "→ Updating gh-pages branch..."
git checkout gh-pages
git rm -rf . > /dev/null 2>&1 || true
cp -r "$TMPDIR/"* .
cp "$TMPDIR/.nojekyll" .
git add -A
git commit -m "Deploy $(date '+%Y-%m-%d %H:%M')"
git push origin gh-pages

# Cleanup
git checkout "$CURRENT_BRANCH"
rm -rf "$TMPDIR"

echo "=== Deployed to https://roth-jan.github.io/topis-saas/ ==="
