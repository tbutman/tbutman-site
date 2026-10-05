#!/usr/bin/env bash
# Rebuilds the private visitor report from nginx's access log with GoAccess. Run by
# site-stats.timer every 15 minutes as root (it starts a container).
#
# Nothing runs in visitors' browsers: the report comes from the server's own log, so the site's
# "0 cookies, 0 trackers" stays true. GoAccess anonymises IP addresses before storing them, keeps
# running totals in DB_DIR (so history outlives the rotated logs) and skips crawlers. The report
# is served only inside the tailnet, never publicly.
set -euo pipefail

IMAGE="allinurl/goaccess:1.12"
LOG_DIR=/var/log/tbutman-site
DB_DIR=/var/lib/tbutman-stats
OUT_DIR=/srv/tbutman-stats

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
