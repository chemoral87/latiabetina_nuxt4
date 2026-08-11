#!/bin/bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

LOCKFILE="/tmp/latiabetina_nuxt4_deployment.lock"

# Acquire exclusive lock
exec 200>"$LOCKFILE"
if ! flock -n 200; then
  echo -e "${RED}❌ Error: Another deployment or rollback is already in progress.${NC}"
  exit 1
fi

APP_DIR="/var/www/admin_nuxt4"
RELEASES_DIR="$APP_DIR/releases"
CURRENT_LINK="$APP_DIR/current"

error_exit() {
  echo -e "${RED}❌ Error: $1${NC}"
  exit 1
}

# List releases if no argument given
if [ -z "${1:-}" ]; then
  echo -e "${YELLOW}📋 Available releases:${NC}"
  ls -1t "$RELEASES_DIR"
  echo -e "${YELLOW}=== Current release ===${NC}"
  readlink "$CURRENT_LINK"
  error_exit "Usage: $0 <release_name>"
fi

RELEASE_NAME="$1"
RELEASE_PATH="$RELEASES_DIR/$RELEASE_NAME"

if [ ! -d "$RELEASE_PATH" ]; then
  echo -e "${RED}❌ Release '$RELEASE_NAME' not found.${NC}"
  echo -e "${YELLOW}📋 Available releases:${NC}"
  ls -1t "$RELEASES_DIR"
  exit 1
fi

echo -e "${YELLOW}⏪ Rolling back to: $RELEASE_NAME${NC}"

if [ -f "$APP_DIR/.env.production" ]; then
  echo -e "${YELLOW}📄 Copying .env.production file...${NC}"
  cp -f "$APP_DIR/.env.production" "$RELEASE_PATH/.env.production" || error_exit "Failed to copy .env.production"
else
  echo -e "${YELLOW}⚠️ No .env.production file found at $APP_DIR/.env.production${NC}"
fi

# Update symlink atomically (zero downtime)
ln -sfn "$RELEASE_PATH" "$CURRENT_LINK" || error_exit "Symlink update failed"

# Restart app using ecosystem config
pm2 delete admin_nuxt4 || true
pm2 start "$CURRENT_LINK/ecosystem.config.cjs" --update-env || error_exit "pm2 start failed"
pm2 save

# Reload nginx so it follows the rollback symlink for static files
echo -e "${YELLOW}🔄 Reloading nginx...${NC}"
nginx -t && systemctl reload nginx || error_exit "nginx reload failed"

echo -e "${GREEN}✅ Rollback to $RELEASE_NAME completed successfully!${NC}"
