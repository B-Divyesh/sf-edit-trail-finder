# Edit Trail — polish round 2 handoff

## Status: complete

All findings in `.factory/review-1.md` and `.factory/review-2.md` are
resolved. Product changes were pushed through commit
`1c911db63a97c8af3378df78032b22efed4c4197` and deployed to
<https://edit-trail-finder.sociobot.in> as deployment
`72703bbf-fa08-4b51-9099-8061ca069cb0`.

## What changed

- Made the isolated one-click demo fully resettable. Reset now restores its
  bundled XMP/DOP/PP3 input, file picker, match rule, selected operations,
  status, and two initial result records.
- Removed the unproved “247” count and rewrote every flagged heading or phrase
  in plain words without changing the sidecar-night-market design.
- Expanded `.factory/claims.json` from 13 to 16 claims. New executable tests
  prove the default index path, deletion behavior, exact folder-opener target,
  and static deployment artifact.
- Strengthened recipe and index-schema claims. Tests now cover all documented
  recipe lines and every named index field, including timestamps.
- Added `scripts/copy-audit.mjs`; `npm test` fails if the generated copy
  audit is stale, contains banned language, or exceeds 22 words.
- Kept real route titles, metadata, 404 behavior, shared legal navigation,
  focus restoration, offline support, and four native downloads under
  regression coverage.
- Updated the catalog line to: “Find RAW photos by active editing steps stored
  in local XMP, DOP, and PP3 sidecars.”

The full finding matrix is in `.factory/polish-2.md`.

## Verification evidence

From clean clone `/tmp/edit-trail-polish2.DD7nD5/repo`:

- Every exact command for all 16 entries in `.factory/claims.json`: passed.
- `npm test`: 5 Rust unit, 3 CLI integration, 1 doctest, 9 Vitest, and 44
  Playwright runs passed; 6 host-only CLI duplicates skipped on mobile.
- `npx tsc --noEmit`: passed.
- `cargo fmt --check`: passed.
- `cargo clippy --all-targets -- -D warnings`: passed.
- `cargo package --allow-dirty`: passed; 13 files, 63.8 KiB unpacked.
- Production build: 15.33 KB JavaScript and 19.08 KB CSS before gzip.

Live:

- `/opt/fleet/lib/verify-url.sh`: 200, correct title/lang, one h1, one main,
  complete alt text, named buttons, and zero console errors.
- `node scripts/verify-live.mjs`: 79 checks passed, with zero console errors,
  zero third-party requests, and zero axe WCAG 2 A/AA violations.
- Routes `/`, `/demo/`, `/privacy/`, and `/terms/` returned their own
  documents; an unknown route returned the designed HTTP 404.
- Root and demo SHA-256 matched the deployed files:
  `ffb833e5d88865b9c5e5398b8b9039cfcf7b3b1e88b0ac653f4c0b92baa407df`
  and
  `6ec90504e4e0258b539e314e7d82672a00a78d9321abb827f86311ee2a8740c3`.
- Lighthouse 13.0.1: performance 100, accessibility 100, best practices 100,
  SEO 100; FCP 1.1 s, LCP 1.4 s, CLS 0.033, total blocking time 0 ms.
- Screenshots and machine-readable reports are in
  `.factory/evidence/polish-2-live/`.

## Run and deploy

```sh
npm ci
npm test
npx tsc --noEmit
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo package --allow-dirty
npm run build
/opt/fleet/lib/deploy-static.sh edit-trail-finder dist/site
```

## Known gaps

None.
