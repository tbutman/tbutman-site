#!/usr/bin/env bash
# Checks a running copy of the site behind deploy/nginx.conf: status codes, content types and
# cache headers, including that a 404 is never cacheable. CI runs it against every build.
# Usage: deploy/check-nginx.sh http://127.0.0.1:8080
set -uo pipefail
BASE="${1:?usage: check-nginx.sh <base-url>}"
failures=0

# check <path> <expected status> <header pattern>... : each pattern must match a response header line
check() {
  local path="$1" want="$2"; shift 2
  local headers status before=$failures
  headers="$(curl -s -o /dev/null -D - "$BASE$path" | tr -d '\r')"
  status="$(head -n1 <<<"$headers" | awk '{print $2}')"
  if [[ "$status" != "$want" ]]; then
    echo "FAIL $path: status $status, expected $want"; failures=$((failures + 1)); return
  fi
  for pattern in "$@"; do
    if [[ "$pattern" == !* ]]; then
      grep -qiE "${pattern:1}" <<<"$headers" && { echo "FAIL $path: unexpected header matching ${pattern:1}"; failures=$((failures + 1)); }
    else
      grep -qiE "$pattern" <<<"$headers" || { echo "FAIL $path: no header matching $pattern"; failures=$((failures + 1)); }
    fi
  done
  (( failures == before )) && echo "ok   $path ($status)"
}

asset="$(curl -s "$BASE/" | grep -oE '/assets/[^"]+\.js' | head -n1)"
[[ -n "$asset" ]] || { echo "FAIL could not find a script asset on the home page"; exit 1; }

security=('^x-content-type-options: nosniff' '^x-frame-options: deny' '^referrer-policy: ')

check /                       200 '^content-type: text/html' '^cache-control: no-cache' "${security[@]}"
check /cv                     200 '^content-type: text/html' '^cache-control: no-cache'
check "$asset"                200 '^content-type: application/javascript' '^cache-control: public, max-age=31536000, immutable'
check /assets/missing-check.js 404 '^content-type: text/html' '^cache-control: no-store' '!immutable' '!max-age' "${security[@]}"
check /no-such-page           404 '^cache-control: no-store' '!max-age' "${security[@]}"
check /404.html               404 '^cache-control: no-store'

if (( failures > 0 )); then echo "$failures check(s) failed"; exit 1; fi
echo "all nginx checks passed"
