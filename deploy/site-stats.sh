#!/usr/bin/env bash
# Rebuilds the private visitor report from nginx's access log with GoAccess. Run by
# site-stats.timer every 15 minutes as root (it starts a container).
#
# Nothing runs in visitors' browsers: the report comes from the server's own log, so the site's
# "0 cookies, 0 trackers" stays true. GoAccess anonymises IP addresses before storing them, keeps
# running totals in DB_DIR (so history outlives the rotated logs) and skips crawlers. The report
# is served only inside the tailnet, never publicly.
#
# A second, smaller JSON copy goes to JSON_DIR, which is not served anywhere, for the owner's
# private posting assistant: only the requested pages (query strings kept, so short ?p= link tags
# show which post sent a visit) and the referring sites, plus overall totals. Every other panel,
# including the visitor list and browsers, is left out of it. Totals are cumulative.
set -euo pipefail

IMAGE="allinurl/goaccess:1.12"
LOG_DIR=/var/log/tbutman-site
DB_DIR=/var/lib/tbutman-stats
OUT_DIR=/srv/tbutman-stats
JSON_DIR=/var/lib/tbutman-stats-json

[[ -s "$LOG_DIR/access.log" ]] || exit 0

# GoAccess picks the output format from the file extension, so write to another .html file and
# swap it in, so the report is never seen half-written.
docker run --rm --network none \
  -v "$LOG_DIR:/logs:ro" -v "$DB_DIR:/db" -v "$OUT_DIR:/out" \
  "$IMAGE" /logs/access.log \
  --no-global-config --log-format=COMBINED \
  --persist --restore --db-path=/db \
  --anonymize-ip --ignore-crawlers \
  --html-report-title="tbutman.com visitors" \
  -o /out/next.html
mv -f "$OUT_DIR/next.html" "$OUT_DIR/index.html"

# The JSON copy: a second pass over the totals just stored (read-only, no --persist, so it can't
# change them), with every panel except requested pages and referring sites switched off. Skipped
# until the folder exists. Its group (set by the folder's setgid bit) may read it; nobody else.
if [[ -d "$JSON_DIR" ]]; then
  ignore=()
  for panel in VISITORS REQUESTS_STATIC NOT_FOUND HOSTS OS BROWSERS VISIT_TIMES VIRTUAL_HOSTS \
               REFERRERS KEYPHRASES STATUS_CODES REMOTE_USER CACHE_STATUS GEO_LOCATION ASN \
               MIME_TYPE TLS_TYPE UTM_CAMPAIGNS; do
    ignore+=(--ignore-panel="$panel")
  done
  docker run --rm --network none \
    -v "$LOG_DIR:/logs:ro" -v "$DB_DIR:/db:ro" -v "$JSON_DIR:/json" \
    "$IMAGE" /logs/access.log \
    --no-global-config --log-format=COMBINED \
    --restore --db-path=/db \
    --anonymize-ip --ignore-crawlers \
    "${ignore[@]}" \
    -o /json/next.json
  chmod 640 "$JSON_DIR/next.json"
  mv -f "$JSON_DIR/next.json" "$JSON_DIR/report.json"
fi
