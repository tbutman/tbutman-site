#!/usr/bin/env bash
# Installs the newest GitHub release of the site, if it is not already live.
# Runs on the home server from a systemd timer as the unprivileged `site-deploy` user.
#
#   /srv/tbutman-site/releases/<tag>/   unpacked releases (the newest few are kept)
#   /srv/tbutman-site/current           symlink to the live release
#   /srv/tbutman-site/pinned            present after a rollback; blocks automatic deploys
#
# Usage:
#   deploy-site.sh             install the newest release (what the timer runs)
#   deploy-site.sh rollback    switch to the previous release and pin it
#   deploy-site.sh unpin       resume automatic deploys
#
# It talks only to github.com, never to GitHub's REST API: see the release check below.
set -euo pipefail

REPO="${SITE_REPO:-tbutman/tbutman-site}"
ROOT="${SITE_ROOT:-/srv/tbutman-site}"
KEEP="${SITE_KEEP:-5}"
RELEASES="$ROOT/releases"
CURRENT="$ROOT/current"
PINNED="$ROOT/pinned"

log() { echo "deploy-site: $*"; }

live_tag() { if [[ -L "$CURRENT" ]]; then basename "$(readlink "$CURRENT")"; fi; }

activate() {
  # Create the new symlink beside the old one, then rename over it: a single atomic step.
  ln -sfn "releases/$1" "$ROOT/.current.tmp"
  mv -T "$ROOT/.current.tmp" "$CURRENT"
  log "live release is now $1"
}

case "${1:-}" in
  rollback)
    live="$(live_tag)"
    previous="$(ls -1t "$RELEASES" | grep -vx -- "$live" | head -n1 || true)"
    [[ -n "$previous" ]] || { log "no earlier release to roll back to"; exit 1; }
    activate "$previous"
    echo "$previous" > "$PINNED"
    log "pinned to $previous; run 'deploy-site.sh unpin' to resume automatic deploys"
    exit 0
    ;;
  unpin)
    rm -f "$PINNED"
    log "automatic deploys resumed"
    exit 0
    ;;
  "") ;;
  *) echo "usage: $0 [rollback|unpin]" >&2; exit 2 ;;
esac

if [[ -f "$PINNED" ]]; then
  exit 0
fi

mkdir -p "$RELEASES"
# Left behind by versions that used GitHub's API with ETags.
rm -f "$ROOT/.latest-etag"

# Which release is newest? Ask the website, not the REST API: github.com/<repo>/releases/latest
# redirects to /releases/tag/<tag>. The API allows 60 unauthenticated requests an hour per
# address, 304 responses included, and this timer plus the other apps' deploy timers on the same
# server need about 90, so API checks failed with HTTP 403 until the hour reset.
response="$(curl -sS --max-time 20 -o /dev/null -w '%{http_code} %{redirect_url}' \
  "https://github.com/$REPO/releases/latest")"
status="${response%% *}"
location="${response#* }"
[[ "$status" == 302 ]] || { log "github.com answered HTTP $status for the latest release"; exit 1; }
tag="${location##*/releases/tag/}"
[[ "$tag" =~ ^site-[0-9]+-[0-9a-f]{7}$ ]] || { log "unexpected release tag: $tag"; exit 1; }

if [[ "$(live_tag)" != "$tag" ]]; then
  work="$(mktemp -d)"
  trap 'rm -rf "$work"' EXIT
  base="https://github.com/$REPO/releases/download/$tag"
  curl -fsSL --max-time 120 -o "$work/site.tar.gz" "$base/site.tar.gz"
  curl -fsSL --max-time 20 -o "$work/site.tar.gz.sha256" "$base/site.tar.gz.sha256"
  (cd "$work" && sha256sum --check --quiet site.tar.gz.sha256)

  target="$RELEASES/$tag"
  rm -rf "$target.partial"
  mkdir -p "$target.partial"
  tar -xzf "$work/site.tar.gz" -C "$target.partial" --no-same-owner
  [[ -f "$target.partial/index.html" ]] || { log "release $tag has no index.html"; exit 1; }
  chmod -R a+rX "$target.partial"
  rm -rf "$target"
  mv "$target.partial" "$target"
  activate "$tag"

  # Prune old releases, never touching the live one.
  ls -1t "$RELEASES" | { grep -vx -- "$tag" || true; } | tail -n +"$KEEP" | while read -r old; do
    rm -rf "${RELEASES:?}/$old"
  done
fi
