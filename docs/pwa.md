# Alfa Spor PWA

The root manifest provides standalone installation, Turkish application metadata,
192/512 px icons, a maskable icon, and shortcuts to matches, teams and news.
Icons are generated from the existing club crest with `node scripts/generate-pwa-icons.mjs`.

The footer offers the browser's native installation prompt when available and
manual installation guidance otherwise. The installed application hides that control.
Installation availability is browser-dependent; production requires HTTPS (localhost
is supported for verification).

The worker registers only in production. It precaches the standalone Turkish
offline screen and application icons. Public document navigation uses the network;
network failures or an eight-second timeout show the offline screen. No match data,
HTML pages, API responses, admin content, form submissions, videos or Next RSC
payloads are cached. This is an offline fallback, not an offline copy of the club site.

Updates wait until the user selects **Güncelle** in the footer, then activate and
reload that tab. Increment `CACHE` in `public/sw.js` when changing precached assets.
Only older `alfa-pwa-*` caches are deleted. Other tabs are not force-reloaded.

Validation: `node scripts/verify-pwa.mjs`, `npm run lint`, `npm run build`.
Run `npm run start -- --port 3002`, open the site, wait for the service worker to
activate, then disable the browser network and navigate to a public page. The offline
screen and icon should appear. Re-enable networking and use **Tekrar dene**.

Coach licenses are editable in the staff admin form. Existing records without this
field use explicit license statements in their biographies. Pending applications are
labeled as applications; missing qualifications are never invented. Saving an empty
license field intentionally hides the badge.

References: [Next.js PWA guide](https://nextjs.org/docs/app/guides/progressive-web-apps),
[MDN service workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers),
[MDN installation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Trigger_install_prompt).
