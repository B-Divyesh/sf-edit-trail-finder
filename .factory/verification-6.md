# Independent verification 6 — Edit Trail

## Verdict: PASS

Candidate commit `4987f141ebaa6e35be52c9374d0a12625cf9657a` is accepted for
`https://edit-trail-finder.sociobot.in` as checked on 30 August 2026. The live
deployment matches the candidate: all 30 publicly served files from
`dist/site` (route documents, worker, assets, artwork, manifest, and native
downloads) matched the live bytes by SHA-256.

## Mandatory gate evidence

- The checkout was clean at the candidate SHA. `npm ci` installed 62 packages
  and reported zero vulnerabilities.
- `.factory/claims.json` exists with 13 claims. Before broader QA, I ran every
  exact listed command, `npm run build:site && npm run test:e2e -- --grep
  @claim:<id>`, for `sample-demo`, `linux-download`,
  `cross-platform-downloads`, `recipe-download`, `browser-local`,
  `no-runtime-third-parties`, `browser-sidecar-formats`, `offline-reload`,
  `local-sidecar-search`, `cli-private-read-only`, `cli-outputs`,
  `cli-contract`, and `mit-license`. They passed. Every claim tag occurs
  exactly once; `test-results/.last-run.json` records `passed` with no failed
  tests.
- `npm test`, `npx tsc --noEmit`, `cargo fmt --check`, and
  `cargo clippy --all-targets -- -D warnings` passed. `npm run build` emitted
  `dist/site`; JS is 15,167 bytes (6,003 gzip) and CSS is 19,083 bytes (5,164
  gzip).
- `cargo package --allow-dirty` passed (13 files, 63.7 KiB unpacked, 18.8 KiB
  compressed). A clean `cargo install --path target/package/edit-trail-0.1.0
  --root <temporary-prefix> --locked` installed the package. Its public help,
  version, demo, and CSV find flow worked. The live downloaded Linux binary
  reports `edit-trail 0.1.0` and completed the 3-sidecar/2-match demo too.

## Cold read and product checks

Fresh Chromium received HTTP 200 and the first screen says: “Find RAW photos
by editing steps. For photographers using RAW editors who need to find
masking, denoise, crop, or other active edits.” The visible primary action is
**Try it with sample data**, with “See two matching sample photos immediately.”
One click opened `/demo/`, showed the persistent “Demo — sample data, nothing
is saved” banner, and showed two matches from three sidecars.

- A locally selected XMP gave “1 of 1 sidecars match all selected operations”
  with no subsequent request and empty local/session/IndexedDB stores.
  Malformed pasted XML gives an actionable recovery message; empty input gives
  the designed empty state; neither produces console errors.
- CLI boundaries: missing index exit 1, invalid `--match` exit 2, no-match
  exit 3, and a reused demo directory exit 1, all with useful messages.
- A temporary archive of 10,000 XMP files indexed in 178 ms. A crop+denoise
  `--match all` query returned all 10,000 records in 25 ms, passing the
  brief's under-30-seconds criterion.
- Each native download had the correct attachment name, executable magic
  bytes, and `application/octet-stream` content type.

## Live quality, privacy, and deployment checks

- `/opt/fleet/lib/verify-url.sh` passed (title, `lang=en`, one h1, main,
  complete image alt attributes, named buttons, and no console/page errors).
- Independent Playwright axe scans found zero violations on `/`, `/demo/`,
  `/privacy/`, `/terms/`, and `/404.html`, hence zero serious/critical issues.
  At 390x844 there is no horizontal overflow, body text is 17 px, and the
  final first-screen fact ends at y=785.44. Keyboard starts at the skip link,
  Enter moves to `#main`, and focus is a cyan 3 px solid outline. Reduced
  motion uses `scroll-behavior: auto` and a `0.000001s` transition.
- The cold load, demo flow, local-file parse, and route tests made only
  same-origin requests to `edit-trail-finder.sociobot.in`; no analytics,
  advertising, account, payment, or upload request was seen.
- HTML and the worker send CSP (`connect-src 'self'`, `frame-ancestors 'none'`),
  HSTS, nosniff, strict-origin referrer policy, and restrictive permissions.
  HTML/worker revalidate at 30 seconds; hashed assets are one-year immutable;
  unknown routes return real HTTP 404.
- `edit-trail-v5` has the canonical `/`, `/demo/`, `/privacy/`, and `/terms/`
  cache keys and no double slashes; `registration.update()` leaves no waiting
  worker. A fresh controlled context retained the demo, two results, and
  separate privacy content after offline navigation/reload.

The product is static and exposes no server-side endpoint, unlock call, or
sign-in flow. Rate-limit/429 and Entra checks are not applicable; `/api`,
`/api/health`, `/health`, `/v1`, and the nominal billing verify path all return
404.

## Defects by severity

- Critical: none.
- High: none.
- Medium: none.
- Low: none.

## Repeat commands

```sh
npm ci
npm test
npx tsc --noEmit
cargo fmt --check
cargo clippy --all-targets -- -D warnings
npm run build
cargo package --allow-dirty
/opt/fleet/lib/verify-url.sh https://edit-trail-finder.sociobot.in "$(mktemp -d)"
```

Evidence: `/tmp/edit-trail-live-cold.png` and
`/tmp/edit-trail-verify-url.nerW7n/verify.json`; temporary CLI and scale test
workspaces are named in the terminal record.
