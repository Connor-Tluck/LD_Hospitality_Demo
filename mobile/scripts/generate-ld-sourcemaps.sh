#!/usr/bin/env bash
# Generate JavaScript source maps for LaunchDarkly Observability (`ldcli sourcemaps upload`).
# Requires: `ldcli` looks for files named *.js.map (not plain .map).
#
# Usage (from mobile/):
#   bash scripts/generate-ld-sourcemaps.sh
# Then upload (replace PROJECT and VERSION):
#   ldcli sourcemaps upload --project YOUR_PROJECT_KEY --app-version "$(node -p "require('./app.json').expo.version")" --path .ld-sourcemaps
#
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
OUT="${ROOT}/.ld-sourcemaps"
mkdir -p "$OUT"

echo "Generating iOS bundle + source map..."
npx expo export:embed \
  --platform ios \
  --dev false \
  --bundle-output "${OUT}/main.ios.bundle" \
  --sourcemap-output "${OUT}/main.ios.js.map"

echo "Generating Android bundle + source map..."
npx expo export:embed \
  --platform android \
  --dev false \
  --bundle-output "${OUT}/main.android.bundle" \
  --sourcemap-output "${OUT}/main.android.js.map"

echo
echo "Done. Maps are in: ${OUT}"
echo "Upload to LaunchDarkly (match app version to Observability serviceVersion, usually app.json expo.version):"
VER="$(node -p "require('./app.json').expo.version")"
PK=""
API_KEY=""
if [[ -f "${ROOT}/.env.local" ]]; then
  # shellcheck disable=SC1090
  set -a && source "${ROOT}/.env.local" && set +a || true
  PK="${LD_PROJECT_KEY#\"}"
  PK="${PK%\"}"
  API_KEY="${LD_API_KEY:-}"
fi
if [[ -n "${PK}" ]]; then
  echo
  echo "  1) Sync ldcli to this repo’s org (fixes \"Unknown project key\" if another token was saved globally):"
  echo "       bash scripts/ld-cli-config.sh"
  echo
  echo "  2) Upload:"
  echo "       ldcli sourcemaps upload --project \"${PK}\" --app-version \"${VER}\" --path \"${OUT}\""
  echo
  echo "  Or one-shot without changing global ldcli (uses LD_API_KEY from .env.local):"
  if [[ -n "${API_KEY}" ]]; then
    echo "       set -a && source .env.local && set +a && ldcli sourcemaps upload --access-token \"\$LD_API_KEY\" --project \"${PK}\" --app-version \"${VER}\" --path \"${OUT}\""
  fi
else
  echo "  ldcli sourcemaps upload --project <PROJECT_KEY> --app-version \"${VER}\" --path \"${OUT}\""
  echo "(Set LD_PROJECT_KEY in .env.local to print the full command with your project key.)"
fi
echo
echo "If stack frames still look wrong, try --base-path (see: https://docs.launchdarkly.com/home/getting-started/ldcli-commands#use-ldcli-for-uploading-sourcemaps)"
