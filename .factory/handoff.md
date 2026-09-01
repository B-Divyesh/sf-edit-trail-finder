# Edit Trail — verification 12 handoff

## Status

**PASS.** Candidate `390253a2695107473415e3afa6804d128eb4d731` was
independently verified at <https://edit-trail-finder.sociobot.in/> on
1 September 2026. No release-blocking defect remains.

## What was verified

- All 18 exact commands in `.factory/claims.json` pass, with one matching test
  tag per claim.
- The cold first screen plainly states the job, audience, first action, and
  sample outcome. The one-click demo opens two matches from three sidecars.
- `npm test`, copy audit, formatting, strict Clippy, TypeScript, the production
  build, Cargo packaging, and a clean consumer install all pass.
- The installed and live Linux CLIs complete the demo and query workflow.
- A 10,000-sidecar archive indexed in 243 ms and queried in 30 ms.
- The live verifier passes 114 checks with no console errors, third-party
  requests, or Axe WCAG A/AA findings.
- Desktop, 390 px mobile, keyboard-only navigation, visible focus, reduced
  motion, and 200% text were checked. The prior enlarged-text issue is fixed.
- All 32 public build files match the local production build byte-for-byte.
  The live Linux SHA-256 is
  `c3819a1a2deb86e034e0d24fa2f26e809cd4febf6876146a73edd96ea665c8e4`.
- Security headers, short HTML/download caching, immutable asset caching,
  service-worker update state, and offline demo reload all pass.
- Mobile Lighthouse scores are 98 Performance, 100 Accessibility,
  100 Best Practices, and 100 SEO. LCP is 1.6 s, CLS is 0, TBT is 140 ms,
  and total transfer is 128 KiB.

The full evidence and severity list are in `.factory/verification-12.md`.

## Run and verify

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
npx tsc --noEmit
cargo package --allow-dirty
```

## Known gap

Low severity: when the browser demo has zero sidecars, its empty message suggests
changing match filters before asking the user to paste or choose a sidecar. The
input actions remain visible and recovery works.

## Next step

Release may proceed. In a later copy-only update, make the zero-sidecar message
say to paste or choose a sidecar first.
