# Independent verification 8 — Edit Trail

## Verdict: PASS

Candidate commit `0275189fc6e959f75d2d8d3c470dcb77742e3f3c` is accepted for
<https://edit-trail-finder.sociobot.in> as independently verified on 30 August
2026. The checkout started clean at the requested commit. The live deployment
matches the candidate production build byte for byte, and no release-blocking
defect was found.

## Mandatory claims and first-read gates

`.factory/claims.json` exists and contains 16 claims. After `npm ci`, every
listed `test` command was run independently, in manifest order, before broader
QA. All returned exit code 0:

- `sample-demo`
- `linux-download`
- `cross-platform-downloads`
- `recipe-download`
- `browser-local`
- `no-runtime-third-parties`
- `browser-sidecar-formats`
- `offline-reload`
- `local-sidecar-search`
- `cli-private-read-only`
- `cli-outputs`
- `cli-contract`
- `mit-license`
- `default-index-path`
- `open-folder`
- `deployment-artifact`

The cold first screen passes. It says “Find RAW photos by editing steps,” names
photographers using RAW editors, and shows **Try it with sample data** with the
plain outcome “Open three samples and see two matches.” The action is visible
without scrolling at desktop and 390 px widths. One keyboard-activated click
opened `/demo/`, showed the persistent “Demo — sample data, nothing is saved”
banner, and immediately displayed two of three sample sidecars.

The landing page, legal pages, README, and CLI promises were cross-checked
against the claims manifest. No unlisted product claim or unsupported claim was
found.

## Clean checkout, build, tests, and packaged consumer

- `npm ci`: passed; 62 packages installed, zero reported vulnerabilities.
- `npm test`: passed 6 Rust library tests, 3 CLI integration tests, 1 doctest,
  10 Vitest tests, and 44 Playwright desktop/mobile runs. Six duplicate CLI
  runs were intentionally skipped in the mobile project.
- `npm run build`: passed and produced `dist/site` with the static site and all
  four native executables.
- `npx tsc --noEmit`: passed. No separate ESLint script exists.
- `cargo fmt --all -- --check`: passed.
- `cargo clippy --all-targets --all-features -- -D warnings`: passed.
- `cargo package --locked`: passed with 16 files, 67.0 KiB unpacked and 19.5
  KiB compressed; Cargo's packaged-source verification also passed.
- The packaged crate was installed with `cargo install --path
  target/package/edit-trail-0.1.0 --root <fresh-directory> --locked`.
  `--version`, `--help`, and `demo --json` worked. The clean consumer demo
  created three sidecars, an index, and an offline report, with two matches.
- The Linux executable downloaded from the live site ran independently and
  produced the same three-sidecar/two-match demo result.

## CLI product behavior and scale

Normal XMP, DxO PhotoLab DOP, and RawTherapee PP3 indexing, all/any operation
queries, JSON, CSV, the offline report, operation aliases, malformed-file
warnings, and the four documented exit-code paths worked end to end.

A fresh archive with 10,000 representative XMP sidecars was measured with the
release binary:

- Index: 10,000 sidecars, 10,000 parsed, zero warnings in 0.245 seconds.
- Crop + denoise query: all 10,000 matches, 10,001 CSV rows including the
  header, in 0.036 seconds.

This passes the brief's under-30-second success target. The 5.59 MB reusable
index and 1.51 MB CSV were valid outputs.

Boundary and recovery checks also passed:

- Uppercase extensions, spaces, and Unicode paths indexed correctly.
- Hidden sidecars were excluded by default and included with
  `--include-hidden`.
- `--follow-links` detected a symlink cycle as a scan warning and continued.
- `--limit 0` returned an empty JSON array and exit code 3.
- Missing input and a malformed index returned exit code 1 with recovery
  guidance; invalid usage returned 2; rebuilding the index restored searches.
- `--open` refused more than 10 matching folders with “add `--limit 10`.”
- An HTML-like adversarial filename was escaped in the report. The report had
  no external resources, no mobile overflow, no console errors, and no axe
  violations.

## Live deployment, accessibility, privacy, and PWA

- `/opt/fleet/lib/verify-url.sh` returned HTTP 200 with the useful title,
  `lang=en`, one `h1`, one `main`, complete image alt text, named buttons, and
  zero console errors.
- `node scripts/verify-live.mjs` passed 79 checks: zero console errors, zero
  third-party requests, and zero axe WCAG 2 A/AA violations on home, demo,
  privacy, terms, and the designed 404.
- A separate mobile keyboard pass reached the skip link, wordmark, Install,
  and sample action in logical order. Each had a visible 3 px cyan focus ring;
  Enter opened the demo. Effective labelled form targets were at least 44 px.
- At 390×844, the body text is 17 px, the page has no horizontal overflow,
  and all three first-screen facts end at 785 px. Desktop and mobile screenshots
  preserve the product-specific sidecar-night-market layout and hierarchy.
- With `prefers-reduced-motion: reduce`, smooth scrolling was disabled, no
  element remained animated, and transitions resolved to 0.001 ms.
- The complete live browser flow used only
  `https://edit-trail-finder.sociobot.in`. Selected sidecars caused no request;
  the claims test also found no localStorage, sessionStorage, or IndexedDB
  writes. No analytics, ad, account, payment, font-CDN, or upload request was
  observed.
- All 17 unique links and fragments across the five routes resolved; the
  external source link returned 200. Unknown routes returned the designed page
  with HTTP 404.
- CSP, HSTS, nosniff, referrer, and permissions headers were present. CSP
  restricts scripts, styles, and connections to self and prevents framing.
  Hashed assets and hero images use one-year immutable caching; HTML,
  downloads, and `sw.js` use 30-second revalidation. The download response has
  the expected attachment filename and octet-stream type.
- Service-worker update and offline reload passed. Cache `edit-trail-v5`
  contained the shell; demo, privacy, and terms each reloaded offline with
  their own content.
- Lighthouse 13.0.1 mobile: performance 97, accessibility 100, best practices
  100, SEO 100; FCP 1.0 s, LCP 1.4 s, TBT 190 ms, CLS 0.033, and 127,973 total
  transferred bytes.
- Build sizes: JavaScript 15,525 bytes (6.08 KB gzip), CSS 19,083 bytes (5.16
  KB gzip), loaded WOFF2 fonts 21,472 bytes, and mobile hero 43,790 bytes. All
  are inside the supplied budgets.

## Deployment identity and endpoint applicability

All 30 served production files, excluding deployment-only configuration, were
compared with `dist/site`; all SHA-256 values matched. Representative hashes:

- `/`: `e363cefc8e6f67b7bcd18cf43ba14f58b0fab7fb3b8811d32398fb73b82e50a2`
- `/demo/`: `363abe3019a58279e77b1048da9dd9a873a3872de8563aa2e50c89f43ade4e20`
- Linux executable:
  `2e7eac299870c3ce22c92f1373080df13377b3cad0d00bf42038875de7ead98e`

This is a static site plus a local CLI. Source and runtime inspection found no
server endpoint, product-unlock call, payment integration, or sign-in flow.
The 429/`Retry-After` and Entra checks therefore do not apply. Deterministic
sidecar parsing does not need an AI runtime feature and adding one would weaken
the local privacy model.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Evidence and repeat commands

Temporary evidence is under `/tmp/edit-trail-live-verify.B1hcQT`,
`/tmp/edit-trail-consumer.YVUKnI`, `/tmp/edit-trail-bench.BDK7wF`,
`/tmp/edit-trail-boundary.efd2RZ`, `/tmp/edit-trail-invalid.FV6Bi0`, and
`/tmp/edit-trail-adversarial.tMzi2v`. Lighthouse JSON is at
`/tmp/edit-trail-lighthouse-mobile.json`.

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
