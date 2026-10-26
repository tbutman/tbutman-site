#!/usr/bin/env bash
# Rebuilds the private visitor report from nginx's access log with GoAccess. Run by
# site-stats.timer every 15 minutes as root (it starts a container).
#
# Nothing runs in visitors' browsers: the report comes from the server's own log, so the site's
# "0 cookies, 0 trackers" stays true. GoAccess anonymizes IP addresses before storing them, keeps
# running totals in DB_DIR (so history outlives the rotated logs) and skips crawlers. The report
# is served only inside the tailnet, never publicly.
#
# A second, smaller JSON copy goes to JSON_DIR, which is not served anywhere, for the owner's
# private posting assistant: only the requested pages (query strings kept, so short ?p= link tags
# show which post sent a visit, and /tilde?from=card counts scans of the sample Tilde Card, whose QR
# code opens taptilde.com/?from=card) and the referring sites, plus overall totals. Every other panel,
# including the visitor list and browsers, is left out of it. Totals are cumulative.
set -euo pipefail

IMAGE="allinurl/goaccess:1.12"
LOG_DIR=/var/log/tbutman-site
DB_DIR=/var/lib/tbutman-stats
OUT_DIR=/srv/tbutman-stats
JSON_DIR=/var/lib/tbutman-stats-json

# One report per site (Thomas, October 26: taptilde.com has its own log, deploy/nginx.conf): tbutman.com
# in the folders above as before, taptilde.com in a taptilde/ folder beside each, with its own totals.
report() {
  local site="$1" log="$2" db="$3" out="$4" json="$5"
  [[ -s "$LOG_DIR/$log" ]] || return 0
  mkdir -p "$db" "$out"

  # GoAccess picks the output format from the file extension, so write to another .html file and
  # swap it in, so the report is never seen half-written.
  docker run --rm --network none \
    -v "$LOG_DIR:/logs:ro" -v "$db:/db" -v "$out:/out" \
    "$IMAGE" "/logs/$log" \
    --no-global-config --log-format=COMBINED \
    --persist --restore --db-path=/db \
    --anonymize-ip --ignore-crawlers \
    --html-report-title="$site visitors" \
    -o /out/next.html
  mv -f "$out/next.html" "$out/index.html"

  # The JSON copy: a second pass over the totals just stored (read-only, no --persist, so it can't
  # change them), with every panel except requested pages and referring sites switched off. Skipped
  # until the folder exists. Its group (set by the folder's setgid bit) may read it; nobody else.
  if [[ -d "$json" ]]; then
    ignore=()
    for panel in VISITORS REQUESTS_STATIC NOT_FOUND HOSTS OS BROWSERS VISIT_TIMES VIRTUAL_HOSTS \
                 REFERRERS KEYPHRASES STATUS_CODES REMOTE_USER CACHE_STATUS GEO_LOCATION ASN \
                 MIME_TYPE TLS_TYPE UTM_CAMPAIGNS; do
      ignore+=(--ignore-panel="$panel")
    done
    docker run --rm --network none \
      -v "$LOG_DIR:/logs:ro" -v "$db:/db:ro" -v "$json:/json" \
      "$IMAGE" "/logs/$log" \
      --no-global-config --log-format=COMBINED \
      --restore --db-path=/db \
      --anonymize-ip --ignore-crawlers \
      "${ignore[@]}" \
      -o /json/next.json
    chmod 640 "$json/next.json"
    mv -f "$json/next.json" "$json/report.json"
  fi
}

report tbutman.com access.log "$DB_DIR" "$OUT_DIR" "$JSON_DIR"
# Its JSON copy only once the owner has made the folder, as for tbutman.com's.
report taptilde.com taptilde.log "$DB_DIR/taptilde" "$OUT_DIR/taptilde" "$JSON_DIR/taptilde"
