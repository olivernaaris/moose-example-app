#!/usr/bin/env bash
set -euo pipefail

# Stages workspace package artifacts into services/analytics/.docker-deps/
# so the Dockerfile can resolve workspace:* dependencies within the
# project-scoped build context that `moose build --docker` provides.
#
# Usage: bash scripts/docker-prep.sh
# Then:  cd services/analytics && moose build --docker

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ANALYTICS_DIR="$REPO_ROOT/services/analytics"
DOCKER_DEPS="$ANALYTICS_DIR/.docker-deps"

# ── Workspace packages that services/analytics depends on ──
# Update this list when adding new workspace:* dependencies to
# services/analytics/package.json
WORKSPACE_DEPS=(
  analytics-client
  temporal-client
)

echo "==> Cleaning previous .docker-deps/"
rm -rf "$DOCKER_DEPS"
mkdir -p "$DOCKER_DEPS/packages"

echo "==> Building workspace dependencies via turbo"
FILTER_ARGS=()
for pkg in "${WORKSPACE_DEPS[@]}"; do
  FILTER_ARGS+=(--filter="@moose-example/$pkg")
done
pnpm turbo run build "${FILTER_ARGS[@]}"

echo "==> Staging workspace packages"
for pkg in "${WORKSPACE_DEPS[@]}"; do
  pkg_dir="$REPO_ROOT/packages/$pkg"
  dest="$DOCKER_DEPS/packages/$pkg"
  mkdir -p "$dest"

  # Copy only what the Docker build needs: package.json + pre-built dist/
  cp "$pkg_dir/package.json" "$dest/"
  cp -r "$pkg_dir/dist" "$dest/dist"

  echo "    Staged packages/$pkg (package.json + dist/)"
done

echo "==> Copying monorepo files for pnpm workspace resolution"
cp "$REPO_ROOT/pnpm-lock.yaml" "$DOCKER_DEPS/"
cp "$REPO_ROOT/pnpm-workspace.yaml" "$DOCKER_DEPS/"
cp "$REPO_ROOT/package.json" "$DOCKER_DEPS/root-package.json"
cp "$REPO_ROOT/.npmrc" "$DOCKER_DEPS/.npmrc"

echo "==> Done. Docker deps staged at $DOCKER_DEPS"
