# Deploying

The site is self-hosted on a home server. Deploys are pull-based: nothing on the internet can reach
the server, and no workflow holds credentials for it.

```
push to main ─▶ GitHub Actions: lint, build, package ─▶ GitHub release (site.tar.gz + sha256)
                                                              │
home server: systemd timer, every ~2 min ◀───────────────────┘
  deploy-site.sh: download, verify checksum, unpack to releases/<tag>, swap the `current` symlink
  nginx (Docker) serves /srv/tbutman-site/current; Cloudflare Tunnel publishes it
```

A new version is live a couple of minutes after the release workflow finishes.

## What runs where

| File | Installed on the server as |
| --- | --- |
| `deploy/deploy-site.sh` | `/usr/local/bin/deploy-site.sh` |
| `deploy/site-deploy.service`, `deploy/site-deploy.timer` | `/etc/systemd/system/` |
| `deploy/nginx.conf` | the website container's `/etc/nginx/conf.d/default.conf` |

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

## Site URL

The release workflow builds with the `SITE_URL` repository variable, defaulting to
`https://home.tbutman.com`. Builds for any origin other than `https://tbutman.com` are marked
`noindex` so the test site never competes with the real one in search. To go to production, set
`SITE_URL` to `https://tbutman.com` under Settings → Secrets and variables → Actions → Variables,
and route the domain through the tunnel.
