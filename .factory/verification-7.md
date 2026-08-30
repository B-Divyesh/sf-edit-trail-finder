# Independent verification 7 — Edit Trail

## Verdict: FAIL

Candidate commit `a463f65259ca878069bc4589611eb2674a5f86eb` is not
accepted for <https://edit-trail-finder.sociobot.in> as checked on 30 August
2026. The deployed files match the candidate and the declared test suite
passes, but the CLI silently accepts malformed PP3 files. This contradicts a
public product promise and can hide incomplete edit metadata without warning.

## Release-blocking defect

### High — malformed PP3 files are reported as successfully parsed

The landing page says, “Malformed sidecars are recorded as warnings, and
scanning continues.” README says, “Malformed sidecars become warnings.” The
CLI does not uphold that promise for the advertised PP3 format.

Fresh reproduction with the candidate release binary:

```sh
mkdir archive
touch archive/empty.pp3
cp README.md archive/not-a-sidecar.pp3
edit-trail index archive --output index.json --json
```

Observed summary:

```json
{"sidecars": 2, "parsed": 2, "warnings": 0}
```

Both records were labelled `RawTherapee`, had no operations, and had empty
warning lists. An empty file and arbitrary README text are not valid PP3
sidecars. Treating them as successful records creates silent false negatives,
which undermines an audit tool whose job is to find every matching image.

The existing `local-sidecar-search` claim test covers malformed XML only. It
does not exercise malformed PP3 even though the same claim and page advertise
PP3 support. Add PP3 structural validation consistent with the browser demo,
record a warning for invalid or empty PP3 data, and extend the claim test with
an invalid PP3 fixture.

## Claims gate

`.factory/claims.json` exists with 16 entries. After `npm ci`, I ran every
listed command exactly as written, in file order, before broader QA. All 16
commands passed:

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

The candidate still fails the claims contract on independent cross-check: the
broader malformed-sidecar promise is false for PP3 and is not covered by the
declared malformed-XML assertion.

## First-read test

The cold live first screen passes. It says “Find RAW photos by editing steps,”
identifies “photographers using RAW editors,” and presents **Try it with sample
data** with the result “Open three samples and see two matches.” The action is
visible without scrolling. One click opened `/demo/`, displayed the persistent
“Demo — sample data, nothing is saved” banner, and showed two of three sample
sidecars.

## Clean checkout and package evidence

- Checkout started clean at the exact candidate SHA. `npm ci` installed 62
  packages and reported zero vulnerabilities.
- `npm test` passed: 5 Rust unit tests, 3 CLI integration tests, 1 doctest, 9
  Vitest tests, and 44 Playwright runs. Six duplicate CLI runs were
  intentionally skipped by the mobile Playwright project.
- `npx tsc --noEmit`, `cargo fmt --check`, and
  `cargo clippy --all-targets -- -D warnings` passed.
- `npm run build` produced `dist/site`. JavaScript is 15,330 bytes (6,050
  gzip); CSS is 19,083 bytes (5,160 gzip). The loaded WOFF2 fonts total 21,472
  bytes and the mobile hero is 43,790 bytes.
- `cargo package --allow-dirty` passed: 13 files, 63.8 KiB unpacked and 18.8
  KiB compressed.
- I unpacked the `.crate` into a fresh temporary consumer and installed it
  with `cargo install --path <unpacked-crate> --root <fresh-prefix> --locked`.
  `--version`, `--help`, `demo --json`, `operations --json`, JSON and CSV find
  flows all worked. The demo created 3 sidecars and returned 2 crop+denoise
  matches. Exit codes were 3 for no matches, 1 for a missing index, and 2 for
  invalid usage.
- A generated offline report had one h1/main, `lang=en`, two rows, no mobile
  overflow, no external requests, no console errors, and zero axe violations.
  A filename containing `<script>` was HTML-escaped. The CLI also refused to
  open more than 10 matching folders and gave the `--limit 10` recovery.

## Performance and product behavior

- A fresh archive containing 10,000 representative XMP, DOP, and PP3
  sidecars indexed in 0.218 seconds. All 10,000 parsed with zero warnings.
- A crop+denoise query returned all 6,667 expected matches in 0.034 seconds.
  This passes the brief's under-30-second target by a wide margin.
- Unicode, spaces, and uppercase `.XMP` filenames indexed correctly. Hidden
  sidecars were excluded by default and included with `--include-hidden`.
- Normal sample, empty archive, malformed XML, invalid arguments, missing
  index, no-match, reset, and report/export paths otherwise behaved as
  documented.

## Live deployment, accessibility, privacy, and PWA

- `/opt/fleet/lib/verify-url.sh` passed: HTTP 200, useful title, `lang=en`, one
  h1, one main, complete image alt text, named buttons, and no console errors.
- `node scripts/verify-live.mjs` passed 79 checks with zero console errors,
  zero external requests, and zero axe WCAG 2 A/AA violations across home,
  demo, privacy, terms, and the designed 404.
- Keyboard order begins with the skip link. Tab focus is a visible 3px cyan
  outline, Enter activates the demo, command tabs support arrow keys, and
  browser Back restores focus. At 390×844 there was no horizontal overflow;
  native radio and checkbox inputs sit inside labelled 44px interaction rows.
- Under `prefers-reduced-motion: reduce`, transitions resolve to 0.000001
  seconds and smooth scrolling is disabled.
- The complete live demo flow made only same-origin requests. Selecting a
  local sidecar caused no request and left localStorage, sessionStorage, and
  IndexedDB unused. No analytics, ad, account, payment, CDN, or image-upload
  request was observed.
- The live CSP restricts scripts, styles, connections, forms, and frames to
  the product origin as appropriate. HSTS, nosniff, referrer, DNS prefetch,
  and permissions headers are present. Hashed assets use one-year immutable
  caching; HTML, downloads, and the service worker revalidate after 30 seconds.
- `registration.update()` completed with `/sw.js` active, no waiting worker,
  and cache `edit-trail-v5`. Offline reload retained the demo and its two
  results; demo, privacy, and terms each reopened with their own document.
- Lighthouse 13.0.1 mobile: performance 94, accessibility 100, best practices
  100, SEO 100; FCP 1.05 s, LCP 1.50 s, CLS 0.033, TBT 278 ms, and 127,875
  transferred bytes. Desktop scores were 100 in all four categories.

## Deployment identity

Live and local SHA-256 bytes matched exactly for `/`, `/demo/`, `/privacy/`,
`/terms/`, `assets/main-VXOULHDC.js`, `assets/style-ENONAmtV.css`, `sw.js`, and
the Linux executable. Representative hashes:

- `/`: `ffb833e5d88865b9c5e5398b8b9039cfcf7b3b1e88b0ac653f4c0b92baa407df`
- `/demo/`: `6ec90504e4e0258b539e314e7d82672a00a78d9321abb827f86311ee2a8740c3`
- Linux executable:
  `49928afd8ad1b4bda3b80f77c603fd714751ed891a4149f7005751bc20222652`

The site is static and contains no server endpoint, unlock call, or sign-in.
Rate-limit/429 and Entra authority checks are therefore not applicable. The
deterministic sidecar parsing job does not benefit from an AI runtime feature.

## Defects by severity

- Critical: none.
- High: malformed PP3 files are silently accepted, contradicting the public
  warning promise and leaving that claim under-tested.
- Medium: none.
- Low: none.

## Evidence and repeat commands

Temporary evidence from this run is under
`/tmp/edit-trail-live-verify.GVDsFm`,
`/tmp/edit-trail-consumer.IS6wKm`,
`/tmp/edit-trail-10k.G1B3Pn`, and
`/tmp/edit-trail-adversarial.Vaq7aH`. Lighthouse JSON is at
`/tmp/edit-trail-lighthouse-mobile.json` and
`/tmp/edit-trail-lighthouse.json`.

```sh
npm ci
npm test
npx tsc --noEmit
cargo fmt --check
cargo clippy --all-targets -- -D warnings
npm run build
cargo package --allow-dirty
/opt/fleet/lib/verify-url.sh https://edit-trail-finder.sociobot.in <evidence-dir>
node scripts/verify-live.mjs https://edit-trail-finder.sociobot.in <evidence-dir>
```
