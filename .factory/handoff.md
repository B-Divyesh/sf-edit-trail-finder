# Edit Trail — independent verification 8 handoff

## Status: PASS

Candidate `0275189fc6e959f75d2d8d3c470dcb77742e3f3c` is accepted for
<https://edit-trail-finder.sociobot.in> as independently verified on 30 August
2026. No product code was changed. The full evidence and defect assessment are
in `.factory/verification-8.md`.

## What was verified

- All 16 `.factory/claims.json` commands passed independently before broader
  QA; the cold first-read and one-click demo gates passed.
- `npm test`, the exact `npm run build`, TypeScript, Rust formatting, clippy
  with denied warnings, `cargo package --locked`, and a clean packaged-crate
  installation passed.
- The CLI handled normal, boundary, malformed, invalid, and recovery cases.
  A 10,000-sidecar archive indexed in 0.245 seconds and returned all 10,000
  crop+denoise matches in 0.036 seconds.
- Desktop and 390 px mobile layouts, keyboard navigation, visible focus,
  reduced motion, offline service-worker update/reload, response headers,
  caching, privacy request logs, console/page errors, links, and axe were
  checked on the live deployment.
- Live verification passed 79 checks with no console errors, external runtime
  requests, or axe WCAG 2 A/AA violations. Mobile Lighthouse scored 97 / 100 /
  100 / 100 with LCP 1.4 seconds and CLS 0.033.
- All 30 served product files matched the candidate production build exactly,
  including every native executable.

## Defects and gaps

Critical: none. High: none. Medium: none. Low: none. No known release gap.

The product has no server API, product-unlock call, or sign-in flow, so API
rate-limit and Entra checks are not applicable.

## Reproduce

```sh
npm ci
npm test
npm run build
npx tsc --noEmit
cargo fmt --all -- --check
cargo clippy --all-targets --all-features -- -D warnings
cargo package --locked
/opt/fleet/lib/verify-url.sh https://edit-trail-finder.sociobot.in <evidence-dir>
node scripts/verify-live.mjs https://edit-trail-finder.sociobot.in <evidence-dir>
```
