#!/usr/bin/env bash
# Configure LaunchDarkly CLI from mobile/.env.local (LD_API_KEY, LD_PROJECT_KEY, LD_ENVIRONMENT_KEY).
# Token: https://app.launchdarkly.com/settings/authorization — use a token with Writer (or Admin) access.
#
# Important: `ldcli` uses a globally stored access token (not your shell env). If you see
# "Unknown project key" but .env.local is correct, another token was saved earlier — run this
# script so `ldcli` matches the same org as your mobile key / API token.
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MOBILE_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
ENV_FILE="${MOBILE_DIR}/.env.local"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE" >&2
  exit 1
fi
# shellcheck disable=SC1090
set -a
source "$ENV_FILE"
set +a
if [[ -z "${LD_API_KEY:-}" ]]; then
  echo "Set LD_API_KEY in .env.local" >&2
  exit 1
fi
HTTP_CODE="$(curl -sS -o /dev/null -w "%{http_code}" -H "Authorization: ${LD_API_KEY}" "https://app.launchdarkly.com/api/v2/projects?limit=1")"
if [[ "$HTTP_CODE" != "200" ]]; then
  echo "LD_API_KEY is not accepted by LaunchDarkly (HTTP $HTTP_CODE). Create a new token at https://app.launchdarkly.com/settings/authorization" >&2
  echo "If \`ldcli\` already works on this machine, remove LD_API_KEY from .env.local or fix the token, then re-run." >&2
  exit 1
fi
ldcli config --set access-token "$LD_API_KEY"
if [[ -n "${LD_PROJECT_KEY:-}" ]]; then
  # strip surrounding quotes if present
  PK="${LD_PROJECT_KEY#\"}"
  PK="${PK%\"}"
  ldcli config --set project "$PK"
fi
if [[ -n "${LD_ENVIRONMENT_KEY:-}" ]]; then
  ldcli config --set environment "$LD_ENVIRONMENT_KEY"
fi
echo "ldcli config:"
ldcli config --list
echo
PK="${LD_PROJECT_KEY#\"}"
PK="${PK%\"}"
echo "Verifying API access (project: ${PK})..."
ldcli projects get --project "$PK" -o json | head -c 400
echo
echo "OK — LaunchDarkly CLI is configured."
