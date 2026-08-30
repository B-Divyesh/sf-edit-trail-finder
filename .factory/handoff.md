# Edit Trail — polish round 3 handoff

## Status: PASS

All findings from `.factory/review-1.md`, `.factory/review-2.md`, and
`.factory/review-3.md` are resolved. The implementation repair is commit
`18e9a8c7dfe9f0da115cdc592cc86fdbfdf9af64` and is pushed to `origin/main`.

## What changed

- Added the missing mobile navigation to home, demo, Privacy, Terms, and 404.
- Kept the night-market identity with a squared cyan directory panel and pink
  offset shadow.
- Added keyboard open, Escape close, focus return, and Privacy-route h1 focus.
- Added a 390×844 browser regression test and equivalent cold-live checks.
- Bumped the service-worker cache to `edit-trail-v6`.
- Updated the catalog line to an 84-character, verb-first description.
- Rechecked every earlier finding; the full mapping is in
  `.factory/polish-3.md`.

## Local and clean-clone verification

The clean clone was `/tmp/edit-trail-polish3-clean.R3fGqL/repo`.

- Every exact command in `.factory/claims.json` passed independently: 16/16.
- `npm test` passed: 6 Rust unit tests, 3 CLI integration tests, 1 doctest, 10
  Vitest tests, and 46 Playwright passes. Six mobile duplicates of host-only
  CLI tests were intentionally skipped.
- `npx tsc --noEmit`, `cargo fmt --check`, and
  `cargo clippy --all-targets -- -D warnings` passed.
- `cargo package --allow-dirty` produced and verified the 0.1.0 crate.
- `npm run build` produced `dist/site`; initial JS is 16.50 KB and CSS is
  20.29 KB before gzip.

## Deployment and live evidence

The `dist/site` static artifact was uploaded to the existing
`sf-edit-trail-finder` production app. No DNS, shared service, database, or
unrelated resource was read or changed.

- Live URL: <https://edit-trail-finder.sociobot.in>
- `/opt/fleet/lib/verify-url.sh`: HTTP 200, correct title/lang, one h1, main
  landmark, complete image alt text, labeled buttons, and 0 console errors.
- `node scripts/verify-live.mjs`: 86/86 checks, 0 console errors, 0 external
  requests, and 0 Axe WCAG 2 A/AA violations.
- Cold `?demo=1` redirected to `/demo/`, showed the isolation banner and two
  results, reset completely, and exited to the install section.
- Home, demo, Privacy, Terms, and the designed HTTP 404 have route-specific
  metadata and working shared navigation.
- Live offline reloads passed for demo, Privacy, and Terms.
- Lighthouse 13.4.1 mobile: performance 100, accessibility 100, best
  practices 100, SEO 100, LCP 1.5 s, CLS 0.033, total blocking time 0 ms.

Evidence is under `.factory/evidence/polish-3-live/`:
`verify.json`, `live-check.json`, `lighthouse.json`, `home-desktop.png`,
`home-mobile.png`, `mobile-menu.png`, `demo-mobile.png`, and
`demo-reset-desktop.png`.

## Run and verify

```sh
npm ci
npm test
npm run build
node scripts/verify-live.mjs https://edit-trail-finder.sociobot.in .factory/evidence/polish-3-live
```

## Known gaps and next steps

None.
