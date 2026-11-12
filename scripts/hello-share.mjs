// /hello's ?contact=, ?social= and ?links=: which ways to reach Thomas, socials and work links the
// page shows, so a card, keychain or phone link can share fewer of them. Each is a comma-separated
// list of keys, `all` or `none`; without one, or with no key it knows, the page shows them all. The
// order on the page doesn't change.
//
// scripts/prerender.mjs puts this script inline in /hello's <head>, so it runs before anything is
// drawn: it names what to hide in <html data-hello-hide>, and src/styles/site.css hides each
// [data-hello-item] it names (and the whole row or section, when a group is empty). React never
// sees the setting, so hydration is untouched. The script is allowed by its hash in
// deploy/nginx.conf's policy; deploy/check-csp.mjs fails the build if the two disagree.

/** The keys, as each item's data-hello-item in src/pages/Hello.tsx. */
export const SHARE_GROUPS = {
  contact: ['email', 'card', 'whatsapp'],
  social: ['instagram', 'x', 'linkedin'],
  links: ['book', 'resume', 'github', 'site'],
}

export const helloShareScript = `(function(){var q=new URLSearchParams(location.search),g=${JSON.stringify(SHARE_GROUPS)},h=[];for(var k in g){var v=q.get(k);if(v===null)continue;var w=v.toLowerCase().split(',');if(w.indexOf('all')>=0)continue;var none=w.indexOf('none')>=0,keep=none?[]:g[k].filter(function(i){return w.indexOf(i)>=0});if(!keep.length&&!none)continue;g[k].forEach(function(i){if(keep.indexOf(i)<0)h.push(i)});if(!keep.length)h.push(k)}if(h.length)document.documentElement.setAttribute('data-hello-hide',h.join(' '))})()`
