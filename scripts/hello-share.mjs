// /hello's ?contact=, ?social= and ?links=: which ways to reach Thomas, socials and work links the
// page shows, so a card, keychain or phone link can choose them. Each is a comma-separated list of
// keys, `all` or `none`; without one, or with no key it knows, the page shows that group's default
// (SHARE_DEFAULTS). The order on the page doesn't change.
//
// scripts/prerender.mjs puts this script inline in /hello's <head>, so it runs before anything is
// drawn: it names what to hide in <html data-hello-hide>, and src/styles/site.css hides each
// [data-hello-item] it names (and the whole row or section, when a group is empty). React never
// sees the setting, so hydration is untouched. The script is allowed by its hash in
// deploy/nginx.conf's policy; deploy/check-csp.mjs fails the build if the two disagree. Where it
// can't run (a server on an older nginx.conf, whose policy blocks it), the page shows everything.
//
// It also picks the version: ?about=tilde sets <html data-hello-about="tilde"> for the Tilde
// version (src/pages/Hello.tsx), which leaves out the work links unless ?links= asks for them
// (data-hello-links-set).

/** The keys, as each item's data-hello-item in src/pages/Hello.tsx. */
export const SHARE_GROUPS = {
  contact: ['email', 'card', 'whatsapp'],
  social: ['instagram', 'x', 'linkedin'],
  links: ['book', 'resume', 'github', 'site'],
}

/** Without a setting (Thomas): ways to reach him and his site; the socials and other work links when a link asks. */
export const SHARE_DEFAULTS = {
  contact: SHARE_GROUPS.contact,
  social: [],
  links: ['site'],
}

export const helloShareScript = `(function(){var q=new URLSearchParams(location.search),g=${JSON.stringify(SHARE_GROUPS)},d=${JSON.stringify(SHARE_DEFAULTS)},h=[];for(var k in g){var v=q.get(k),keep=d[k];if(v!==null){var w=v.toLowerCase().split(','),none=w.indexOf('none')>=0,named=g[k].filter(function(i){return w.indexOf(i)>=0});if(w.indexOf('all')>=0)keep=g[k];else if(none)keep=[];else if(named.length)keep=named}g[k].forEach(function(i){if(keep.indexOf(i)<0)h.push(i)});if(!keep.length)h.push(k)}var e=document.documentElement;if(h.length)e.setAttribute('data-hello-hide',h.join(' '));if(q.get('about')==='tilde')e.setAttribute('data-hello-about','tilde');if(q.has('links'))e.setAttribute('data-hello-links-set','')})()`
