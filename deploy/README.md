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

## /hello's ?from= links

/hello and /pt/hello say where the visitor came from: the status line, the intro's opening, the
diagram's first step and the note under it (`src/content/hello.ts`). Each printed or programmed
link carries a `from` value; the stats count each one as its own row. Values never change once
printed:

| Link | `from` | Page |
| --- | --- | --- |
| The business card's QR code | `card-qr` | you scanned my card |
| The business card's NFC sticker | `card-nfc` | you tapped my card |
| The keychain's QR tag | `key-qr` | you scanned my keychain |
| The QR tag's NFC sticker, or the round fob | `key-nfc`, `fob` | you tapped my keychain |
| Thomas's Android phone (Tilde), its tap link | `phone-android-nfc` | you tapped my phone |
| Thomas's Android phone (Tilde), its on-screen QR code | `phone-android-qr` | you scanned my phone |
| Thomas's Android phone, one link for both | `phone-android` | you tapped or scanned my phone |
| Thomas's iPhone | `phone-iphone` | you got this from my iPhone |
| Either phone | `phone` | you got this from my phone |
| Any other QR code or NFC tag | `qr-<name>`, `nfc-<name>` (lowercase, digits, `-`) | you scanned / tapped one of my codes |
| A link, or anything without a value | none | the plain page |

The build prerenders a page for each (`dist/_hello/`), and nginx serves it by the value
(`$hello_arrival` in `nginx.conf`). **That needs the new `nginx.conf` on the server** (above): until
then every visitor gets the plain page, which fits all of them. Adding a value means
`src/lib/arrival.ts`, the map, and the copy in both languages; `npm test` fails if the map and the app
disagree. Any `from` makes the link longer than 32 characters, so the keychain's QR tag grows to
29 × 29 squares (tilde-card's `docs/KEYRING.md`).

### Which socials and links /hello shows (`?social=`, `?links=`)

Each is a comma-separated list, `all` or `none`, and can go on any /hello link with or without
`from`, for example `/hello?from=phone-android-nfc&social=linkedin&links=resume,book`:

| Parameter | Keys | Without it |
| --- | --- | --- |
| `social` | `instagram`, `x`, `linkedin` | all three |
| `links` | `book` (the intro call), `resume`, `github`, `site` (the full site) | all four |

Unknown keys are ignored; a list with none it knows shows everything. `none` hides the row (socials)
or the whole "work with me" section (links). Email and "save my contact" always show. An inline
script in /hello's head reads them before the page is drawn (`scripts/hello-share.mjs`), allowed
by its hash in `nginx.conf`'s policy, so this also needs the new `nginx.conf` on the server; with
the old one, the page shows everything. Adding a key means the script's list, its rule in
`site.css` and its `data-hello-item` in `src/pages/Hello.tsx`; the script change also changes the
hash, and `deploy/check-csp.mjs` fails the build until `nginx.conf` has the new one.

## taptilde.com short links (Cloudflare, Thomas)

**Until taptilde.com goes live as its own site** (the next section). After that, these rules are disabled and the
paths are taptilde.com's own pages.

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
| Tilde note link | `(http.host in {"taptilde.com" "www.taptilde.com"} and http.request.uri.path eq "/n")` | `https://tbutman.com/tilde/n` |
| Tilde Home & desk link | `(http.host in {"taptilde.com" "www.taptilde.com"} and http.request.uri.path in {"/home" "/home/"})` | `https://tbutman.com/tilde/home` |
| Tilde Mystery link | `(http.host in {"taptilde.com" "www.taptilde.com"} and http.request.uri.path in {"/mystery" "/mystery/"})` | `https://tbutman.com/tilde?from=mystery-card` (**Preserve query string off**) |

Drag them all above the catch-all, and add them to its exclusions so the result doesn't depend on
order: `… and not http.request.uri.path in {"/c" "/w" "/card" "/card/" "/cards" "/cards/" "/fobs" "/fobs/" "/uses" "/uses/" "/app" "/app/" "/n" "/home" "/home/" "/mystery" "/mystery/"}`
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

**The note link** (N1, tilde-review/specs/notes-link.md §3.7) carries a note or a list after the
`#`, which the redirect keeps: the target has no `#` of its own. Add it **before anything writes a
note link** (the app's notes update), so no phone caches the catch-all's 301 for `/n`. A phone that
did anyway lands on `/tilde`, whose forwarder sends `#n1;…` on to `/tilde/n`. Check it with
`curl -sI "https://taptilde.com/n"`: `302` and `location: https://tbutman.com/tilde/n`.

**The Mystery link** is the code on the Mystery card, which Thomas hands to people new to Tilde
(tilde-review/briefs/mystery-card.md). It's the one rule with **Preserve query string off**: the
printed URL has no query, and its tag (`from=mystery-card`) is in the Static URL instead, so the
stats count `/tilde?from=mystery-card`. Until there's a mystery or promo page it goes to `/tilde`
(no trailing slash: `/tilde/` is a 403). To send it somewhere else later, edit only the **Tilde
Mystery link** rule's Static URL, keeping **302** and Preserve query string off, and keep a
`from=mystery-card` on the new URL, for example `https://tbutman.com/tilde/mystery?from=mystery-card`
(a page on this site has to be built and deployed first) or a promotion elsewhere with its own
tag. Add the rule before the first card is handed out: a phone that opens `taptilde.com/mystery`
while only the catch-all exists caches its 301 to `/tilde`, and never sees a later change.

Check each, then the catch-all:

```bash
for p in card cards fobs home uses app; do curl -sI "https://taptilde.com/$p?from=tag" | grep -iE '^(HTTP|location)'; done
curl -sI https://taptilde.com/mystery | grep -iE '^(HTTP|location)'   # 302 to https://tbutman.com/tilde?from=mystery-card
curl -sI https://taptilde.com/ | grep -iE '^(HTTP|location)'   # still 301 to https://tbutman.com/tilde
```

Expect `302` and `location: https://tbutman.com/tilde/card?from=tag` (and `/fobs`, `/uses`, `/app`;
after the switch, `/app` goes to `play.google.com` without `from=tag`). A phone
that opened `taptilde.com/card` before the rule existed has cached the catch-all's 301 and lands on
`/tilde`, where `#booth` links to the stations.

## taptilde.com as its own site (Thomas, October 26)

Tilde moves from `tbutman.com/tilde` to `taptilde.com`: **one repo, two builds, two hostnames, the same server.**
This reverses October 10's redirect (D1). It's ready on the `tilde-split` branch, and none of the steps below has
been done.

**How it works:**
- **The build:** `npm run build` builds tbutman.com into `dist/` (`build:main`), then taptilde.com into
  `dist-tilde/` (`build:tilde`, `SITE=tilde`). Both use the same components and stylesheet; `src/TildeApp.tsx` has
  the routes at the root, and `src/site.ts` writes the links for each site.
- **One release:** `scripts/pack-sites.mjs` copies `dist-tilde/` into `dist/_taptilde/`. So one release carries both
  sites, `deploy-site.sh` needs **no change**, and a rollback covers both.
- **nginx** (`deploy/nginx.conf`):
  - **taptilde.com:** a second server block, `server_name taptilde.com www.taptilde.com`, with
    `root /srv/tbutman-site/current/_taptilde`. It has its own CSP map (`$tilde_page_csp`, with its forwarder's
    hash), the same caching and its own log (`taptilde.log`). `www` goes to the bare domain.
  - **tbutman.com:** stays the default server. Every Tilde page 301s to its twin with `from=tbutman.com` added (see
    the comment at `$moved_args`: it stops cached-301 loops). The images under `/tilde/` stay, and `/_taptilde/` is a
    404.
- **Stats:** `site-stats.sh` writes taptilde.com's report into `taptilde/` beside tbutman.com's, and logrotate
  rotates both logs.
- **For now, tbutman.com's build still has its `/tilde` pages,** with taptilde.com as their canonical. So the order
  of the steps below never leaves a page missing. Once the redirects are live they're never served, and a later
  commit can remove them.

**Routes:**

| tbutman.com (old) | taptilde.com (new) |
| --- | --- |
| `/tilde` | `/` |
| `/pt/tilde` | `/pt` |
| `/tilde/card`, `/pt/tilde/card` | `/card`, `/pt/card` |
| `/tilde/fobs`, `/tilde/home`, `/tilde/uses`, `/tilde/app` | `/fobs`, `/home`, `/uses`, `/app` |
| `/tilde/privacy`, `/pt/tilde/privacy` | `/privacy`, `/pt/privacy` |
| `/tilde/c`, `/tilde/n` (and `/tilde/w` once W1 merges) | `/c`, `/n` (`/w`) |
| `/tilde/…` images | stay on tbutman.com (the case study uses them); taptilde.com has its own copy |
| — | `/cards` → `/card` (301), `/mystery` → `/?from=mystery-card` (302) |

Each redirect from tbutman.com is a 301 to the twin with `from=tbutman.com` added. The browser keeps any
`#fragment`, so old contact and note links still open, and the `#install`, `#faq`, `#app` and `#card` anchors of
the old `/tilde` page forward to where those sections are now.

**Preview:** `npm run build:tilde && npm run preview:tilde` serves taptilde.com's build on port 4318 (`vite preview
--outDir dist-tilde --port 4318`). Run `npm run build:main` first if `tilde-release.json` doesn't exist yet. Through
nginx, both hostnames: run the container as in CI, then `curl -H 'Host: taptilde.com' http://127.0.0.1:8080/card`.

### Going live (Thomas, in this order; none done)

1. **Release:** merge `tilde-split` into `main` and push. CI builds both sites and checks both hostnames, and
   `deploy-site.sh` installs the release.
   - Nothing changes for visitors yet: the old nginx.conf still serves tbutman.com's `/tilde` pages, and Cloudflare
     still redirects taptilde.com there.
   - Set the `TILDE_SITE_URL` repository variable only for a test origin. The default is `https://taptilde.com`.
2. **Tunnel:** in Cloudflare Zero Trust → Networks → Tunnels → this site's tunnel → Public Hostnames, add
   `taptilde.com` and `www.taptilde.com`. Point them at the same service as tbutman.com (the nginx container,
   `http://website:80` or as tbutman.com's hostname is set).
   - If the zone already has DNS records for those names (made for the redirect rules), delete them first, so the
     tunnel can create its CNAMEs.
   - The edge redirect rules still win, so visitors see no change yet.
3. **nginx:** copy the new `deploy/nginx.conf` to `/etc/tbutman-site/nginx.conf`, then run
   `sudo docker compose exec website nginx -t` and `sudo docker compose exec website nginx -s reload`.
4. **Within a minute of step 3,** in Rules → Redirect Rules on the taptilde.com zone, **disable**:
   - the catch-all (`taptilde.com/*` → `tbutman.com/tilde`);
   - the short-link rules (`/c`, and any of `/card`, `/fobs`, `/uses`, `/app`, `/home`, `/mystery`, `/w`, `/n` that
     were added).
   - **Why within a minute:** between steps 3 and 4, `tbutman.com/tilde` → taptilde.com → (the old rule) →
     `tbutman.com/tilde` loops. Doing step 4 first instead shows tbutman.com's home on `taptilde.com/` until step 3.
   - Once taptilde.com has been fine for a week, delete the disabled rules.
5. **Stats:** install the new `site-stats.sh` and `site-logs.logrotate`. Optionally, run
   `sudo mkdir -m 2750 /var/lib/tbutman-stats-json/taptilde` (same owner and group as its parent) for taptilde.com's
   JSON copy.
6. **Check:**
   - `curl -sI https://taptilde.com/card`: `200`, `content-security-policy` with `'sha256-U4N9…'`.
   - `curl -sI https://tbutman.com/tilde/card`: `301`, `location: https://taptilde.com/card?from=tbutman.com`.
   - `curl -sI https://www.taptilde.com/fobs`: `301` to `https://taptilde.com/fobs`.
   - Open `https://taptilde.com/#1;n=Jane%20Doe`: it should land on `/c`.
   - Tap a booth lid (the short links are now pages).

**Rolling back:**
1. Re-enable the redirect rules (step 4).
2. Put the previous `nginx.conf` back and reload.
3. Remove the tunnel hostnames, or leave them: the rules win.
4. If the release itself is the problem, run `sudo -u site-deploy deploy-site.sh rollback`. Its tbutman.com still has
   the `/tilde` pages, so the old setup works as before.

**After going live,** the short-link rules above are gone: taptilde.com's paths are pages (`/card`, `/fobs`, …), and
`/cards` and `/mystery` are nginx's. To change where the Mystery card lands, edit `location = /mystery` in the
taptilde.com server block (still a 302).

## Site URL

The release workflow builds with the `SITE_URL` repository variable, defaulting to
`https://home.tbutman.com`. Builds for any origin other than `https://tbutman.com` are marked
`noindex` so the test site never competes with the real one in search. To go to production, set
`SITE_URL` to `https://tbutman.com` under Settings → Secrets and variables → Actions → Variables,
and route the domain through the tunnel.
