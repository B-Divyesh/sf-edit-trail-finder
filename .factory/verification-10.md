# Independent verification 10 — PASS

Verified candidate: `0c493b8f616ec0a9d9035010132164de013cb345`  
Live URL: <https://edit-trail-finder.sociobot.in/>  
Verification date: 1 September 2026

## Verdict

**PASS.** The static deployment byte-matches the candidate build and the product completed its required local, browser, CLI, privacy, accessibility, performance, and scale checks. No release-blocking defect was found.

## Claims preflight

`.factory/claims.json` is present and contains 16 claims. From the clean checkout, I ran every exact command in its `test` field, each through the shipped production/demo entry point. All passed.

| Claim | Result |
| --- | --- |
| sample-demo | PASS |
| linux-download | PASS |
| cross-platform-downloads | PASS |
| recipe-download | PASS |
| browser-local | PASS |
| no-runtime-third-parties | PASS |
| browser-sidecar-formats | PASS |
| offline-reload | PASS |
| local-sidecar-search | PASS |
| cli-private-read-only | PASS |
| cli-outputs | PASS |
| cli-contract | PASS |
| mit-license | PASS |
| default-index-path | PASS |
| open-folder | PASS |
| deployment-artifact | PASS |

The final Playwright result recorded no failed tests. The claims cover the one-click demo, all native binaries, browser-local parsing, no runtime third parties, three sidecar families, offline reload, CLI read-only behavior and outputs, exit-code contract, default index path, folder opening, and deployment headers/artifacts.

## First read and user journey

I opened the live home page in a new browser context. The first screen says **“Find RAW photos by editing steps”**, identifies **photographers using RAW editors**, and provides one visible **“Try it with sample data”** action with the explanation **“Open three samples and see two matches.”** It therefore answers what it does, for whom, and what to click first in plain words.

One click opened `/demo/`, showed the persistent **“Demo — sample data, nothing is saved”** banner, and returned two crop-and-denoise matches from three sample sidecars. The live browser flow also checked malformed input, empty results, Reset demo, demo exit, browser Back/focus restoration, direct `?demo=1`, all four native downloads, the twelve-command recipe download, legal/404 routes, and offline reload of demo, privacy, and terms.

## Local quality and CLI checks

- `npm ci`: passed; npm reported 0 vulnerabilities.
- `npm test`: passed. It ran 6 Rust library tests, 3 Rust CLI integration tests, 1 doctest, 11 Vitest tests, the exact production build, and the desktop/mobile Playwright suite. Final Playwright status: passed, no failures.
- `npm run build` / `npm run build:site`: passed and produced `dist/site`.
- `npx tsc --noEmit`, `cargo fmt --check`, and `cargo clippy --all-targets -- -D warnings`: passed.
- `cargo package --allow-dirty`: passed; package verification completed (16 files; 67.2 KiB unpacked, 19.7 KiB compressed).
- Clean consumer check: installed the packaged crate into a fresh temporary Cargo root. `edit-trail --help`, `edit-trail demo --output … --json`, an explicit-index crop+denoise query, and a default-index workflow all worked. The demo created three sidecars and both searches returned the expected two records.
- Brief scale check: a fresh 10,000-XMP-sidecar archive indexed in **0.257 s**; the crop+denoise query returned all 10,000 records in **0.031 s**. This is below the brief's 30-second success measure.

## Live deployment, privacy, and accessibility

`node scripts/verify-live.mjs https://edit-trail-finder.sociobot.in .factory/evidence/verification-10-live` passed **86 checks**: zero console errors, zero third-party requests, and zero Axe WCAG 2 A/AA violations. The fresh browser request log stayed same-origin during the product flow, including file selection; this confirms the local-processing and no-runtime-third-party privacy promises.

Desktop and 390×844 mobile checks passed with no horizontal overflow. Keyboard checks covered the skip link, visible focus ring, mobile menu Escape behavior, focus after route navigation, and Back restoration. Local browser tests confirmed the reduced-motion path. The live pages have one h1 and main landmark, route-specific titles and metadata, labels, alt text, legal routes, and an accessible 404 page.

The live root response returned HSTS, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, a restrictive permissions policy, and a CSP with `frame-ancestors 'none'`. The hashed JS asset is cached as `public, max-age=31536000, immutable`; the Linux executable has an attachment disposition. This static product has no server-side product API, sign-in, unlock, or other request allowance to check, so 429 behavior is not applicable.

The local and deployed copies of `index.html`, main JS, CSS, service worker, and all four native downloads have identical SHA-256 values. The home document hash is `11903cbcc002d7fec64b42a4a774b737be9c54269115b68c0d80f34274f3aadb`.

## Performance

Built main JS is 16.50 kB (6,347 bytes gzip) and CSS is 20.29 kB (5,406 bytes gzip), both within the static budget. Live mobile Lighthouse produced performance 99, accessibility 100, best practices 100, SEO 100; LCP 1.357 s, CLS 0.0326, and TBT 137 ms. Lighthouse reported a `TARGET_CRASHED` runtime error only while collecting its full-page screenshot after it had calculated those results; independent Playwright browser checks had no page or console errors, and this is not a product finding.

## Defects

None found.

## Evidence

Session evidence was saved under `.factory/evidence/verification-10-live/` (browser audit and screenshots), `.factory/evidence/verification-10-first-read.png`, and `.factory/evidence/verification-10-lighthouse.json`. Evidence files are intentionally ignored by repository policy.
