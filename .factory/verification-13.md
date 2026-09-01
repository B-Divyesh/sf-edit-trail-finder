# Independent verification 13 — PASS

Verified candidate: `2c32f77621a4fc16597e8c9c0d52f7983adae142`  
Live URL: <https://edit-trail-finder.sociobot.in/>  
Verification date: 1 September 2026

## Verdict

**PASS.** This candidate meets the researched brief: it is a private, local CLI
and static companion that finds RAW sidecars by active editing operations. The
deployed site is the candidate build, the shipped Linux executable is the
candidate executable, and no release-blocking defect was found.

## Mandatory claim preflight

The clean checkout contains `.factory/claims.json` with 18 entries. After
`npm ci`, I ran every exact command in that file against the production build
and demo entry point. All passed. Each tag occurs exactly once in the test
sources.

| Claims | Result |
| --- | --- |
| `sample-demo`, `linux-download`, `cross-platform-downloads`, `recipe-download` | PASS |
| `browser-local`, `no-runtime-third-parties`, `browser-sidecar-formats`, `offline-reload` | PASS |
| `local-sidecar-search`, `cli-private-read-only`, `cli-outputs`, `cli-contract` | PASS |
| `mit-license`, `cli-demo-recording`, `local-only-boundary`, `default-index-path` | PASS |
| `open-folder`, `deployment-artifact` | PASS |

## First-read gate

Cold-opening the live home page answers all three required questions in plain
words. The headline is **“Find RAW photos by editing steps”**; the next sentence
names photographers using RAW editors and masking, denoise, crop, or other
active edits; and the primary action is **“Try it with sample data.”** Its
adjacent outcome says it opens three samples and shows two matches. One click
opens `/demo/` with two crop-and-denoise results and the persistent
“Demo — sample data, nothing is saved” banner. **PASS.**

## Local candidate verification

- Clean checkout started at the stated SHA with no tracked changes.
- `npm ci` passed (62 packages, zero reported vulnerabilities).
- `npm test` passed: Rust unit/integration/doctests, copy audit, Vitest,
  production build, and Playwright suite.
- `npm run build` passed and created `dist/site`; production assets are 6.39
  kB gzip JavaScript and 5.72 kB gzip CSS.
- `cargo fmt --check`, `cargo clippy --all-targets --all-features -- -D warnings`,
  and `npx tsc --noEmit` passed.
- `cargo package --allow-dirty` passed (16 files; 68.2 KiB unpacked, 19.8 KiB
  compressed). I installed the packaged crate into a fresh temporary Cargo
  root, ran its public `--help`, `demo --json`, and a crop-plus-denoise query;
  the demo made three sidecars and the query returned two matches.

Representative CLI checks passed: normal JSON query returned the expected DxO
and darktable records; blank `--operation` returned exit 2 with recovery
guidance; an absent operation returned exit 3 with the operations suggestion;
and reusing a demo directory failed safely. A generated 10,000-sidecar archive
indexed in 0.251 s; a full CSV crop query completed in 0.026 s, well inside the
brief's 30-second measure.

## Live deployment, privacy, accessibility, and performance

- `node scripts/verify-live.mjs https://edit-trail-finder.sociobot.in
  .factory/evidence/verification-13-live` passed **117** checks: zero console
  errors, zero third-party requests, and zero Axe WCAG 2 A/AA findings across
  home, demo, privacy, terms, and 404.
- Desktop and 390 px mobile checks passed. The mobile document has no horizontal
  overflow; keyboard Tab reaches the skip link first; the tested focus ring is
  a visible 3 px cyan outline; mobile menu Escape restores focus; and
  `prefers-reduced-motion: reduce` is active without page errors.
- The service worker activated. After a first visit, `/demo/`, `/privacy/`, and
  `/terms/` each opened and reloaded offline with their own documents.
- Browser request logging for the full demo flow recorded only the product
  origin. The static product has no account, sign-in, payment, analytics, or
  server-side API endpoints, so a 429 allowance and identity-provider check are
  not applicable.
- Live HTML has a restrictive same-origin CSP with `frame-ancestors 'none'`,
  HSTS, `nosniff`, strict-origin referrer policy, and permissions policy.
  Hashed assets use one-year immutable caching; HTML and downloads revalidate
  after 30 seconds; downloads are attachments. Unknown routes return HTTP 404.
- All **32** publicly served files matched `dist/site` byte-for-byte. The live
  Linux download and the local release executable share SHA-256
  `c3819a1a2deb86e034e0d24fa2f26e809cd4febf6876146a73edd96ea665c8e4`.
  The downloaded binary ran `demo --json` successfully and reported three
  sidecars and two matches.
- Lighthouse's completed category audits reported Performance 100,
  Accessibility 100, Best Practices 100, and SEO 100. This container's browser
  crashed while collecting Lighthouse's final full-page screenshot *after* the
  audits, so the JSON carries `TARGET_CRASHED`; the independent Playwright and
  Axe checks above completed without a browser/page error.

## Findings by severity

### Critical

None.

### High

None.

### Medium

None.

### Low

None.

## Evidence locations

- Live browser report: `.factory/evidence/verification-13-live/live-check.json`
- Lighthouse JSON (verification container): `/tmp/edit-trail-lighthouse-13.json`
- Packaged consumer root (verification container): `/tmp/tmp.7IYMlPBCPh`
- Live downloaded binary/demo evidence (verification container):
  `/tmp/tmp.8SCUc0pRP3`
