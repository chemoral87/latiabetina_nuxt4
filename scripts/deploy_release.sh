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
TARBALL="$APP_DIR/release.tar.gz"
RELEASE_NAME="${1:-$(date +%Y%m%d%H%M%S)}"
RELEASE_PATH="$RELEASES_DIR/$RELEASE_NAME"
KEEP_RELEASES=5

error_exit() {
  echo -e "${RED}❌ Error: $1${NC}"
  exit 1
}

echo -e "${YELLOW}🚀 Starting deployment: $RELEASE_NAME${NC}"

if [ ! -f "$TARBALL" ]; then
  error_exit "Release tarball not found at $TARBALL"
fi

mkdir -p "$RELEASES_DIR"

if [ -e "$RELEASE_PATH" ]; then
  error_exit "Release path already exists: $RELEASE_PATH"
fi

mkdir "$RELEASE_PATH"

# Extract release tarball into release folder
echo -e "${YELLOW}📦 Extracting release tarball...${NC}"
tar -xzf "$TARBALL" -C "$RELEASE_PATH" || error_exit "Tar extraction failed"

cd "$RELEASE_PATH" || error_exit "Cannot enter release directory"

if [ ! -f ecosystem.config.cjs ] || [ ! -f .output/server/index.mjs ]; then
  error_exit "Release archive must contain ecosystem.config.cjs and .output/server/index.mjs"
fi

if [ -f "$APP_DIR/.env.production" ]; then
  echo -e "${YELLOW}📄 Copying .env.production file...${NC}"
  cp -f "$APP_DIR/.env.production" "$RELEASE_PATH/.env.production" || error_exit "Failed to copy .env.production"
else
  echo -e "${YELLOW}⚠️ No .env.production file found at $APP_DIR/.env.production${NC}"
fi

# Update current symlink atomically (zero downtime)
echo -e "${YELLOW}🔗 Updating current symlink...${NC}"
ln -sfn "$RELEASE_PATH" "$CURRENT_LINK" || error_exit "Symlink update failed"

# Recreate the PM2 process so it runs from the new release directory.
echo -e "${YELLOW}🔄 Restarting app...${NC}"
pm2 delete admin_nuxt4 || true
pm2 start "$CURRENT_LINK/ecosystem.config.cjs" --update-env || error_exit "pm2 start failed"
pm2 save

# Reload nginx so it follows the new symlink for static files
echo -e "${YELLOW}🔄 Reloading nginx...${NC}"
nginx -t && systemctl reload nginx || error_exit "nginx reload failed"

# Keep only last $KEEP_RELEASES
echo -e "${YELLOW}🧹 Cleaning old releases (keeping last $KEEP_RELEASES)...${NC}"
cd "$RELEASES_DIR"
ls -1dt */ | tail -n +$((KEEP_RELEASES + 1)) | xargs -r rm -rf

# Remove the uploaded tarball to free space
echo -e "${YELLOW}🧹 Removing release tarball...${NC}"
rm -f "$TARBALL"

echo -e "${GREEN}✅ Deployment $RELEASE_NAME completed successfully!${NC}"
