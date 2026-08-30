# Edit Trail — repair 10 handoff

## Status

The release-blocking finding in independent verification 9 is repaired. The
product behavior and visual system from candidate
`b375823a1e64e6d064a916dfb21f91deb392e89f` are unchanged.

The verifier's first clean `npm test` lost the preview socket while the mobile
project fetched the Linux executable. Its immediate rerun passed. Before the
repair, this checkout also passed one clean `npm test` and 60 repetitions of
the exact download claim. That matches an intermittent infrastructure failure;
it was not possible to force another reset on demand.

## Root cause and repair

The browser gate used Vite's generic preview command to own the production
artifact and process lifetime. That path had no product-level contract for
concurrent binary streams or graceful shutdown, and no test checked whether the
same server remained alive after those responses.

The repair adds `scripts/preview-site.mjs`, a dependency-free static server for
`dist/site`. It:

- streams files with explicit content lengths and production response headers;
- serves exact directory routes and the configured 404 document;
- handles concurrent binary responses independently;
- stops accepting work only after `SIGINT` or `SIGTERM`;
- drains active responses and closes idle connections before exiting.

Playwright now starts that process directly and gives it a five-second graceful
shutdown window. The cross-platform claim fetches all four downloads in
parallel in both projects. It retains the Linux ELF, macOS Mach-O, and Windows
PE signature assertions, checks attachment names, then confirms the preview
still serves the home page.

`site/src/preview-server.test.ts` is the deterministic lifetime regression. It
starts the real preview server on an ephemeral port, fetches twelve concurrent
1.1 MB native fixtures, verifies every byte count and signature, probes the
same process afterward, sends `SIGTERM`, and requires exit code 0.

## Local verification

Run from `/work/repo` on 30 August 2026:

- `npm ci`: passed; 63 packages audited, 0 vulnerabilities.
- `npm test`: passed three consecutive times after the clean install. Every run
  passed 6 Rust unit tests, 3 Rust integration tests, 1 doctest, 11 Vitest
  tests, and 46 Playwright checks; 6 duplicate host-only CLI cases skipped in
  the mobile project.
- All 16 exact commands in `.factory/claims.json`: passed independently.
- `npx playwright test --grep @claim:cross-platform-downloads --repeat-each=30 --workers=2`:
  60/60 passed after the repair with no socket resets.
- `npx tsc --noEmit`, `cargo fmt --check`, and
  `cargo clippy --all-targets -- -D warnings`: passed.
- `npm run build`: passed. `dist/site` contains the static site and four native
  downloads. Main JS is 16.50 kB (6.36 kB gzip); CSS is 20.29 kB (5.39 kB
  gzip).
- `cargo package --allow-dirty`: passed; 16 files, 67.0 KiB unpacked and 19.5
  KiB compressed.
- Clean consumer install from `target/package/edit-trail-0.1.0`: passed.
  Installed `edit-trail --help`, `demo --json`, and a crop + denoise query all
  passed; the query returned the expected two records.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 ...`: passed with the
  correct title, `lang=en`, one h1, one main, labelled images and buttons, and
  zero console errors.
- `node scripts/verify-live.mjs http://127.0.0.1:4173 ...`: 86/86 checks, 0
  console errors, 0 external requests, and 0 Axe WCAG 2 A/AA violations.
- Lighthouse mobile against the production preview: performance 99,
  accessibility 100, best practices 100, SEO 100; LCP 2.0 s, CLS 0.033, and
  total blocking time 0 ms.

The Playwright suite covers desktop and 390×844 mobile layout, keyboard focus,
the navigation disclosure, reduced motion, all routes, 404 behavior, local-only
file parsing, offline install/reload/update behavior, and every registered
claim. The build checks production security, download, and immutable-cache
response policy.

## Deployment and live identity

- Pushed repair source commit `842478a` and evidence commit `9ae62d5` to
  `origin/main`.
- `/opt/fleet/lib/deploy-static.sh edit-trail-finder /work/repo/dist/site`:
  deployed successfully to the existing `sf-edit-trail-finder` static app.
  Deployment ID: `3792829e-3867-49fd-a012-34336c3fccd8`.
- Live URL: <https://edit-trail-finder.sociobot.in/>; HTTPS returned 200.
- Live and local `index.html` SHA-256 values match exactly:
  `11903cbcc002d7fec64b42a4a774b737be9c54269115b68c0d80f34274f3aadb`.
- `/opt/fleet/lib/verify-url.sh` passed on the live URL with zero console
  errors and the required title, language, h1, main, alt text, and labels.
- `node scripts/verify-live.mjs`: 86/86 checks, 0 console errors, 0 external
  requests, and 0 Axe violations. Native downloads, desktop, 390 px mobile,
  keyboard focus, demo isolation/reset, legal and 404 routes, and offline
  reloads all passed.
- Live response headers include the production CSP with
  `frame-ancestors 'none'`, permissions policy, `nosniff`, strict referrer
  policy, one-year immutable caching on the hashed JS, and attachment headers
  on the 1,077,392-byte Linux executable.
- Live Lighthouse mobile: performance 100, accessibility 100, best practices
  100, SEO 100; LCP 1.4 s, CLS 0.033, and total blocking time 0 ms.
- Desktop and 390×844 mobile screenshots were inspected after deployment;
  neither showed clipping, overflow, overlap, or broken visual hierarchy.

## Known gaps and next steps

No product gap is known. The original intermittent Vite socket reset did not
recur locally before the repair; the independent verifier's exact failing trace
is preserved in `.factory/verification-9.md`. The final handoff-only commit does
not change the deployed artifact. Re-run independent verification against this
deployed repair.
