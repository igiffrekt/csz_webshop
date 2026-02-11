#!/usr/bin/env bash
set -euo pipefail

# ─────────────────────────────────────────────
# CSZ Webshop – Deployment Script
# ─────────────────────────────────────────────
# Usage:
#   ./scripts/deploy.sh --initial   First-time setup
#   ./scripts/deploy.sh             Update & rebuild
# ─────────────────────────────────────────────

APP_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WEB_DIR="$APP_DIR/apps/web"
STANDALONE_DIR="$WEB_DIR/.next/standalone"

cd "$APP_DIR"

# ── Load production env ──────────────────────

if [ -f "$WEB_DIR/.env.production" ]; then
  set -a
  source "$WEB_DIR/.env.production"
  set +a
fi

# ── Helpers ──────────────────────────────────

log()  { echo -e "\n\033[1;34m▶ $*\033[0m"; }
ok()   { echo -e "\033[1;32m✓ $*\033[0m"; }
fail() { echo -e "\033[1;31m✗ $*\033[0m"; exit 1; }

copy_standalone_assets() {
  log "Copying static assets into standalone output…"
  cp -r "$WEB_DIR/public" "$STANDALONE_DIR/apps/web/public"
  cp -r "$WEB_DIR/.next/static" "$STANDALONE_DIR/apps/web/.next/static"

  if [ -f "$WEB_DIR/.env.production" ]; then
    cp "$WEB_DIR/.env.production" "$STANDALONE_DIR/apps/web/.env.production"
  fi
  ok "Assets copied"
}

# ── Initial setup ────────────────────────────

if [[ "${1:-}" == "--initial" ]]; then
  log "Initial deployment"

  log "Installing dependencies…"
  pnpm install --frozen-lockfile

  log "Running database migrations…"
  cd "$WEB_DIR"
  pnpm exec prisma migrate deploy
  cd "$APP_DIR"

  log "Building Next.js…"
  pnpm --filter web build || fail "Build failed"

  copy_standalone_assets

  ok "Initial deployment complete!"
  echo "Start the Node.js app via OpenLiteSpeed pointing to:"
  echo "  $STANDALONE_DIR/apps/web/server.js"
  exit 0
fi

# ── Update deploy ────────────────────────────

PREV_COMMIT=$(git rev-parse HEAD)
log "Current commit: $PREV_COMMIT"

log "Pulling latest changes…"
git pull --ff-only || fail "git pull failed — resolve conflicts manually"

NEW_COMMIT=$(git rev-parse HEAD)
if [[ "$PREV_COMMIT" == "$NEW_COMMIT" ]]; then
  ok "Already up to date — nothing to deploy"
  exit 0
fi
log "Updating from ${PREV_COMMIT:0:7} → ${NEW_COMMIT:0:7}"

log "Installing dependencies…"
pnpm install --frozen-lockfile

log "Running database migrations…"
cd "$WEB_DIR"
pnpm exec prisma migrate deploy
cd "$APP_DIR"

log "Building Next.js…"
if ! pnpm --filter web build; then
  echo ""
  fail "Build failed — rolling back to $PREV_COMMIT"
  git checkout "$PREV_COMMIT"
  pnpm install --frozen-lockfile
  cd "$WEB_DIR" && pnpm exec prisma migrate deploy && cd "$APP_DIR"
  pnpm --filter web build
  copy_standalone_assets
  fail "Rolled back to ${PREV_COMMIT:0:7} after build failure"
fi

copy_standalone_assets

ok "Build complete! ${PREV_COMMIT:0:7} → ${NEW_COMMIT:0:7}"
echo "Restart the Node.js app in OpenLiteSpeed to pick up changes."
