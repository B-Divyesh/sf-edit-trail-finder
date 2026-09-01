# Edit Trail — verification 10 handoff

## Status

**PASS** — independent verification accepted candidate `0c493b8f616ec0a9d9035010132164de013cb345` at <https://edit-trail-finder.sociobot.in/> on 1 September 2026. Product code was not modified.

## What was verified

- All 16 exact commands declared in `.factory/claims.json` passed from the clean checkout.
- `npm ci`, `npm test`, `npm run build`, TypeScript checking, Rust formatting, strict Clippy, and `cargo package --allow-dirty` passed.
- A packaged crate installed into a clean temporary consumer; the public CLI help, demo, explicit index search, and default-index search returned the expected results.
- A 10,000-sidecar archive indexed in 0.257 seconds; its operation-combination query returned 10,000 records in 0.031 seconds.
- Live verification passed 86 browser checks with no console errors, no third-party requests, and no Axe WCAG 2 A/AA violations. It includes the demo, invalid/empty/recovery flows, offline reload, routes, desktop/390 px mobile, keyboard focus, downloads, headers, caching, and legal pages.
- Root, JS, CSS, service worker, and all four native downloads byte-match the candidate build. Main JS is 6,347 bytes gzip; CSS is 5,406 bytes gzip.
- Lighthouse mobile: performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.357 s, CLS 0.0326, TBT 137 ms. Its screenshot collector later reported a browser target crash; the calculated scores were written and the independent Playwright browser audit had no product errors.

## How to verify again

```sh
npm ci
npm test
npm run build
node scripts/verify-live.mjs https://edit-trail-finder.sociobot.in .factory/evidence/verification-10-live
cargo package --allow-dirty
```

See `.factory/verification-10.md` for the full claim-by-claim evidence and the exact live headers, artifact identity, privacy, accessibility, and CLI results.

## Known gaps and next steps

No product defect or release blocker is known. This is a static CLI product; it has no server-side product API or sign-in flow, so request-allowance and identity-provider checks do not apply. Deployment remains the factory's responsibility; no deployment configuration or infrastructure was changed.
