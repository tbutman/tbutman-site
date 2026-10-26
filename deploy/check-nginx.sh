#!/usr/bin/env bash
# Checks a running copy of the site behind deploy/nginx.conf: status codes, content types and
# cache headers, including that a 404 is never cacheable, for both hostnames: tbutman.com (the
# default server) and taptilde.com (sent as the Host header). CI runs it against every build.
# Usage: deploy/check-nginx.sh http://127.0.0.1:8080
set -uo pipefail
BASE="${1:?usage: check-nginx.sh <base-url>}"
failures=0

# check <path> <expected status> <header pattern>... : each pattern must match a response header line
check() {
  local path="$1" want="$2"; shift 2
  local headers status before=$failures
  headers="$(curl -s -o /dev/null -D - ${HOST:+-H "Host: $HOST"} "$BASE$path" | tr -d '\r')"
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
  (( failures == before )) && echo "ok   ${HOST:+$HOST }$path ($status)"
}

HOST=""
asset="$(curl -s "$BASE/" | grep -oE '/assets/[^"]+\.js' | head -n1)"
[[ -n "$asset" ]] || { echo "FAIL could not find a script asset on the home page"; exit 1; }

security=('^x-content-type-options: nosniff' '^x-frame-options: deny' '^referrer-policy: ')
# HTML pages get the site's Content Security Policy; files that aren't pages get none.
csp="^content-security-policy: default-src 'self'; script-src 'self' 'sha256-"

check /                       200 '^content-type: text/html' '^cache-control: no-cache' "${security[@]}" "$csp"
check /resume                 200 '^content-type: text/html' '^cache-control: no-cache'
check /cv                     301 '^location: /resume$'
check /Thomas_Butman_Resume.pdf 200 '^content-type: application/pdf' '!content-security-policy'
check /Thomas_Butman_CV.pdf   301 '^location: /Thomas_Butman_Resume.pdf$'
# The Tilde pages moved to taptilde.com (Thomas, October 26): each one 301s to its twin, with the
# query; the images under /tilde/ stay (the case study uses them); the Tilde release folder is hidden.
check /tilde                  301 '^location: https://taptilde.com/\?from=tbutman\.com$'
check '/tilde?from=card'      301 '^location: https://taptilde.com/\?from=card&from=tbutman\.com$'
check /pt/tilde               301 '^location: https://taptilde.com/pt\?from=tbutman\.com$'
check /tilde/card             301 '^location: https://taptilde.com/card\?from=tbutman\.com$'
check /pt/tilde/card          301 '^location: https://taptilde.com/pt/card\?from=tbutman\.com$'
check /tilde/privacy          301 '^location: https://taptilde.com/privacy\?from=tbutman\.com$'
check /tilde/c                301 '^location: https://taptilde.com/c\?from=tbutman\.com$'
check /tilde/n                301 '^location: https://taptilde.com/n\?from=tbutman\.com$'
check /tilde/home             301 '^location: https://taptilde.com/home\?from=tbutman\.com$'
check /tilde/share.webp       200 '^content-type: image/webp'
check /_taptilde/index.html   404
check "$asset"                200 '^content-type: application/javascript' '^cache-control: public, max-age=31536000, immutable' '!content-security-policy'
check /assets/missing-check.js 404 '^content-type: text/html' '^cache-control: no-store' '!immutable' '!max-age' "${security[@]}"
check /no-such-page           404 '^cache-control: no-store' '!max-age' "${security[@]}" "$csp"
check /404.html               404 '^cache-control: no-store'

# taptilde.com: the Tilde build at the root, its own policy, the same caching rules.
HOST=taptilde.com
tilde_asset="$(curl -s -H "Host: $HOST" "$BASE/" | grep -oE '/assets/[^"]+\.js' | head -n1)"
[[ -n "$tilde_asset" ]] || { echo "FAIL could not find a script asset on taptilde.com's home page"; failures=$((failures + 1)); }
tilde_csp="^content-security-policy: default-src 'self'; script-src 'self' 'sha256-"
check /                       200 '^content-type: text/html' '^cache-control: no-cache' "${security[@]}" "$tilde_csp"
check /card                   200 '^content-type: text/html' "$tilde_csp"
check /pt                     200 '^content-type: text/html'
check /pt/card                200 '^content-type: text/html'
check /fobs                   200 '^content-type: text/html'
check /home                   200 '^content-type: text/html'
check /uses                   200 '^content-type: text/html'
check /app                    200 '^content-type: text/html'
check /privacy                200 '^content-type: text/html'
check /pt/privacy             200 '^content-type: text/html'
check /c                      200 '^content-type: text/html' '^cache-control: public, max-age=86400, stale-while-revalidate=604800' '^referrer-policy: no-referrer' "${security[@]}" "^content-security-policy: frame-ancestors 'none'; base-uri 'none'; object-src 'none'$"
check /n                      200 '^content-type: text/html' '^cache-control: public, max-age=86400, stale-while-revalidate=604800' '^referrer-policy: no-referrer' "${security[@]}" "^content-security-policy: frame-ancestors 'none'; base-uri 'none'; object-src 'none'$"
check /cards                  301 '^location: /card$'
check /mystery                302 '^location: /\?from=mystery-card$'
check /tilde                  301 '^location: /$'
check /tilde/booth/fobs--fob-base-coin-tilde-360.webp 200 '^content-type: image/webp'
check /resume                 404 '^cache-control: no-store'
check "$tilde_asset"          200 '^content-type: application/javascript' '^cache-control: public, max-age=31536000, immutable' '!content-security-policy'
check /no-such-page           404 '^cache-control: no-store' '!max-age' "${security[@]}" "$tilde_csp"
HOST=www.taptilde.com
check /card                   301 '^location: https://taptilde.com/card$'

if (( failures > 0 )); then echo "$failures check(s) failed"; exit 1; fi
echo "all nginx checks passed"
