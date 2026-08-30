# Edit Trail — polish round 1 handoff

## Status: complete

Repaired the full adversarial review against base
`63d20458787e0b11760f69c76219009d16350ade`. Repair commit:
`2dcd6a2c541596277e9ab5543fdbfc5014bbe1bc`. Production was deployed as Static Web Apps
deployment `24cbbb2d-1bfe-448a-a0a5-a898448b519c` to
<https://edit-trail-finder.sociobot.in>.

## What changed

- A one-click, isolated `/demo/` route now has sample XMP, DOP, and PP3 data,
  an always-visible demo banner, automatic crop-and-denoise results, reset,
  and a real exit to install options. `?demo=1` redirects there.
- Added browser PP3 parsing, history focus restoration, complete routing,
  response CSP framing protection, metadata, social card, touch icon,
  sitemap, 404 shell, and consistent navigation/footer.
- Rewrote all flagged first-screen, README, heading, control, and terminology
  copy. The audit is in `.factory/copy-audit.md`.
- Added claims and observable tests for MIT licensing, browser formats,
  no third-party runtime requests, and native platform downloads. Removed
  every untestable quantitative or unsupported promise.
- Shipped macOS arm64/x64 and Windows x64 native binaries alongside Linux,
  with a native GitHub Actions verification matrix.
- Kept the sidecar-night-market identity. The share and touch assets are
  documented deterministic derivatives of its original artwork.

## Verification

- Clean clone: `npm ci`, then `npm test` passed (4 Rust unit, 3 Rust CLI,
  1 doctest, 7 Vitest, 41 Playwright passes; 3 intentional duplicate CLI
  mobile skips).
- Each command in `.factory/claims.json` was run independently in that clean
  clone. All 12 claims passed.
- Local package check: `cargo package --allow-dirty` created
  `target/package/edit-trail-0.1.0.crate`.
- Production cold check: `/opt/fleet/lib/verify-url.sh` passed with 679 ms
  load, no console errors, title/lang/main/alt/button checks all clean.
- Production axe via Playwright returned zero violations on `/`, `/demo/`,
  `/privacy/`, `/terms/`, and the designed 404. The standalone axe CLI could
  not locate its Selenium Chrome binary, so the installed Playwright axe
  integration was used instead.
- Live mobile cold run confirmed `/demo/`, banner, both result records, no
  external request, no console error, and third fact at 785.4 px in an 844 px
  viewport. CSP live response includes `frame-ancestors 'none'`; missing route
  returns 404.

Evidence: `/tmp/edit-trail-live-evidence/live-check.json`,
`/tmp/edit-trail-live-evidence/live-axe.json`,
`/tmp/edit-trail-live-evidence/verify.json`, and
`/tmp/edit-trail-live-evidence/final-demo-mobile.png`.

## Run and deploy

```sh
npm ci
npm test
npm run build
/opt/fleet/lib/deploy-static.sh edit-trail-finder dist/site
```

No known gaps remain.
