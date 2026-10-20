# Deploying

The site is self-hosted on a home server. Deploys are pull-based: nothing on the internet can reach
the server, and no workflow holds credentials for it.

```
push to main ─▶ GitHub Actions: lint, test, build, nginx check, package ─▶ GitHub release
                                                              │
home server: systemd timer, every ~2 min ◀───────────────────┘
  deploy-site.sh: download, verify checksum, unpack to releases/<tag>, swap the `current` symlink
  nginx (Docker) serves /srv/tbutman-site/current; Cloudflare Tunnel publishes it
```

A new version is live a couple of minutes after the release workflow finishes.

The timer finds the newest release from the redirect of `github.com/<repo>/releases/latest`, not
from GitHub's REST API. The API allows only 60 unauthenticated requests an hour per address, 304s
included, and this timer and the other apps' deploy timers on the same server would exceed it.

CI serves every build through `deploy/nginx.conf` in the server's pinned nginx image and runs
`deploy/check-nginx.sh`: status codes, content types, the long cache on hashed assets, and
`no-store` on every 404, so a not-yet-installed file can never be cached as missing.

**Content Security Policy:** `deploy/nginx.conf` sends one on every HTML page (only the site's own
scripts, styles, fonts and images, plus `/tilde`'s inline forwarder by hash; `/tilde/c` keeps its
own meta policy). `deploy/check-csp.mjs` fails the build if a page has anything the policy would
block, and `deploy/check-csp-browser.mjs` opens every page through nginx in Chromium and fails on
any CSP report. It takes effect once the new `nginx.conf` is installed on the server.

## What runs where

| File | Installed on the server as |
| --- | --- |
| `deploy/deploy-site.sh` | `/usr/local/bin/deploy-site.sh` |
| `deploy/site-deploy.service`, `deploy/site-deploy.timer` | `/etc/systemd/system/` |
| `deploy/nginx.conf` | `/etc/tbutman-site/nginx.conf`; the directory is mounted as the container's `/etc/nginx/conf.d` |
| `deploy/site-stats.sh` | `/usr/local/bin/site-stats.sh`: rebuilds the private visitor report with GoAccess |
| `deploy/site-stats.service`, `deploy/site-stats.timer` | `/etc/systemd/system/`: the report rebuilds every 15 minutes |
| `deploy/site-logs.logrotate` | `/etc/logrotate.d/tbutman-site`: the access log rotates weekly and is kept four weeks |

### Visitor statistics

There are no analytics scripts, cookies or third parties. nginx writes an access log (with the
visitor's address from Cloudflare's `CF-Connecting-IP` header), and GoAccess turns it into a report
of visitors, pages and referring sites. It anonymizes IP addresses and leaves out crawlers. The
report is served only inside the owner's private network, never publicly. A second, smaller JSON
copy (requested pages and referring sites only) is written to a folder that is not served
anywhere, for the owner's private posting assistant.

The script runs as the unprivileged `site-deploy` user, which owns `/srv/tbutman-site`. The nginx
container mounts that directory read-only. It mounts the directory rather than the `current`
symlink itself, because Docker resolves a symlink once when the container starts and would never
see later swaps.

## Operations (on the Ubuntu server)

```bash
systemctl list-timers site-deploy.timer             # when the next check runs
journalctl -u site-deploy.service -n 20 --no-pager  # recent deploy output
readlink /srv/tbutman-site/current                  # the live release
sudo systemctl start site-deploy.service            # check for a release right now

sudo -u site-deploy deploy-site.sh rollback         # go back one release and pin it
sudo -u site-deploy deploy-site.sh unpin            # resume automatic deploys
```

A rollback pins the previous release so the timer does not immediately reinstall the newer one.

## Changing the nginx config

`deploy/nginx.conf` is not part of the release. After changing it, copy it to the server, then
validate and reload:

```bash
sudo docker compose exec website nginx -t
sudo docker compose exec website nginx -s reload
```

## taptilde.com short links (Cloudflare, Thomas)

The booth's lids and printed material carry short links that never change. Each is a Cloudflare
Redirect Rule on taptilde.com, above the catch-all (`taptilde.com/*` → `https://tbutman.com/tilde`,
301), made like the contact link's (tilde-review/specs/x1-contact-link.md, section 3): Rules →
Redirect Rules → Create rule; type **Static**; status **302**, so a target can still change;
**Preserve query string on**, so `?from=tag` reaches the stats.

| Rule name | When the expression matches | Static URL |
| --- | --- | --- |
| Tilde Cards link | `(http.host in {"taptilde.com" "www.taptilde.com"} and http.request.uri.path in {"/card" "/card/" "/cards" "/cards/"})` | `https://tbutman.com/tilde/card` |
| Tilde Fobs link | `(http.host in {"taptilde.com" "www.taptilde.com"} and http.request.uri.path in {"/fobs" "/fobs/"})` | `https://tbutman.com/tilde/fobs` |
| Tilde Uses link | `(http.host in {"taptilde.com" "www.taptilde.com"} and http.request.uri.path in {"/uses" "/uses/"})` | `https://tbutman.com/tilde/uses` |
| Tilde App link | `(http.host in {"taptilde.com" "www.taptilde.com"} and http.request.uri.path in {"/app" "/app/"})` | `https://tbutman.com/tilde/app` |

Drag all four above the catch-all, and add them to its exclusions so the result doesn't depend on
order: `… and not http.request.uri.path in {"/c" "/w" "/card" "/card/" "/cards" "/cards/" "/fobs" "/fobs/" "/uses" "/uses/" "/app" "/app/"}`
(keep `/c`, and `/w` once the Wi-Fi rule exists). `taptilde.com` itself stays on the catch-all: the
hub is `/tilde`, whose `#booth` section leads to the four stations.

**The App link moves later.** Every printed app link (the phone plate, the app sheet) is
`taptilde.com/app`, so it can change target without a reprint. Until the Google Play listing is
live it goes to the App page. Once it's live, edit only the **Tilde App link** rule: Static URL
`https://play.google.com/store/apps/details?id=com.tbutman.tilde`, still **302**, and turn
**Preserve query string off**: the listing's URL has its own query (`?id=`), and Play ignores
`from=`. (To keep the booth's count, use
`https://play.google.com/store/apps/details?id=com.tbutman.tilde&referrer=utm_source%3Dbooth`
instead: Play Console then shows the installs from it.) The App page stays at `/tilde/app` for
links from the other pages.

Check each, then the catch-all:

```bash
for p in card cards fobs uses app; do curl -sI "https://taptilde.com/$p?from=tag" | grep -iE '^(HTTP|location)'; done
curl -sI https://taptilde.com/ | grep -iE '^(HTTP|location)'   # still 301 to https://tbutman.com/tilde
```

Expect `302` and `location: https://tbutman.com/tilde/card?from=tag` (and `/fobs`, `/uses`, `/app`;
after the switch, `/app` goes to `play.google.com` without `from=tag`). A phone
that opened `taptilde.com/card` before the rule existed has cached the catch-all's 301 and lands on
`/tilde`, where `#booth` links to the stations.

## Site URL

The release workflow builds with the `SITE_URL` repository variable, defaulting to
`https://home.tbutman.com`. Builds for any origin other than `https://tbutman.com` are marked
`noindex` so the test site never competes with the real one in search. To go to production, set
`SITE_URL` to `https://tbutman.com` under Settings → Secrets and variables → Actions → Variables,
and route the domain through the tunnel.
