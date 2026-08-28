# Independent verification — FAIL

**Work order:** `edit-trail-finder-verify-1`  
**Candidate:** `729ce5e80b36034c404c1c0730b32ccebf9039c0`  
**Live URL:** <https://edit-trail-finder.sociobot.in/>  
**Verified:** 2026-08-28 (UTC), from a fresh detached clone of the candidate.

## Verdict

**FAIL.** The CLI and site are functional and the deployed content is exactly
the candidate build, but the production host does not apply the candidate's
security and immutable-cache response policy. This fails the production
caching/response-policy acceptance requirement. It is a deployment
configuration defect, not a source-content mismatch.

## Release-blocking defect

### P1 — deployed host omits required security and cache headers

`site/public/_headers` in the candidate declares a restrictive
`Content-Security-Policy`, `Permissions-Policy: camera=(), microphone=(),
geolocation=()`, and one-year immutable caching for `/assets/*` and `/*.webp`.
Fresh HTTPS `HEAD` requests to the live root, JS, and service worker instead
returned only:

```
cache-control: public, must-revalidate, max-age=30
strict-transport-security: max-age=10886400; includeSubDomains; preload
referrer-policy: strict-origin-when-cross-origin
x-content-type-options: nosniff
```

There was no `Content-Security-Policy` or `Permissions-Policy`, and the
hashed `assets/main-BifG5UM3.js` was also cached for only 30 seconds rather
than `public, max-age=31536000, immutable`. Configure the actual static host
to serve the candidate `_headers` rules (or its platform-native equivalent),
then recheck the live URL. Do not mark this release accepted before that is
observed over HTTPS.

## Evidence: clean build and package

- Fresh clone was detached at the exact candidate SHA; `npm ci` completed with
  `npm audit` reporting 0 vulnerabilities.
- `npm test` passed: 4 Rust library tests, 2 Rust CLI integration tests, 1
  Rust doctest, 2 Vitest tests, and the Playwright desktop/mobile projects.
  The run result recorded `{"status":"passed","failedTests":[]}`.
- Exact production build `npm run build` passed and emitted `dist/site/` plus
  `dist/site/downloads/edit-trail-linux-x86_64` (1.1 MB).
- `npx tsc --noEmit`, `cargo fmt --check`, and
  `cargo clippy --all-targets -- -D warnings` passed.
- `cargo package --allow-dirty` passed, producing
  `target/package/edit-trail-0.1.0.crate` (16.1 KB compressed). A clean
  consumer installation with
  `CARGO_INSTALL_ROOT=<clean-dir> cargo install --path target/package/edit-trail-0.1.0 --locked`
  completed; the installed `edit-trail --help`, empty-archive index, and
  invalid `--match` path worked. Invalid `--match invalid` returned exit 2.

## Product and CLI checks

- The documented integration workflow passed: index a darktable sidecar plus
  malformed XMP, query `denoise + crop`, no-match exit 3, and generate an
  offline report. Empty archives succeed with a useful message.
- A separate release-binary benchmark used 10,001 valid sidecars (denoise +
  crop): `index --json` completed in **0.16 s** and a two-operation JSON
  query in **0.01 s**, well inside the 30-second brief target. It reported
  10,001 parsed sidecars and zero warnings.
- Boundary/recovery checks: a non-directory archive returned exit 1 with an
  actionable error; a no-match query returned exit 3; opening more than ten
  result folders was safely refused with exit 1. The CLI reads only sidecars;
  no image files were used in the test.

## Browser, accessibility, privacy, and PWA checks

- Live desktop and 390 x 844 mobile Chromium checks passed. Both had the
  expected title, `lang="en"`, exactly one `h1`, one `main`, and no horizontal
  overflow. Visual inspection of the 390 px capture found the intended
  stacked layout clear and legible.
- The live demo returned 2 of 3 results for normal input; malformed XML showed
  "Could not parse ... Check that its XML is complete"; blank input returned
  the visible 0-of-0 empty state. Existing keyboard tab/arrow tab tests pass;
  a live keyboard focus inspection found a visible `rgb(89, 243, 230) solid
  3px` outline. Reduced-motion media emulation was detected and transitions
  collapsed to 0.000001 s.
- Axe on both viewports found **zero serious or critical violations**. No
  console errors or page errors occurred.
- Initial-load browser requests went only to
  `https://edit-trail-finder.sociobot.in`; there are no analytics or CDN
  requests. Source review found the Sociobot verification endpoint only in
  the explicit license-restore/return flow. No photo pixels leave the CLI.
- On the live URL, `navigator.serviceWorker.ready` was controlled by
  `/sw.js`, cache `edit-trail-v2` was present, `registration.update()`
  completed without a waiting worker, and an offline reload retained the
  page and showed the offline status. The worker source uses `skipWaiting`,
  `clients.claim`, and removes prior cache keys on activation.

## Deployment identity and budgets

- Fresh live SHA-256 comparisons matched the clean `dist/site` output for
  `index.html`, `assets/main-BifG5UM3.js`, `assets/style-BgAZSCfR.css`,
  `sw.js`, `/privacy/`, `/terms/`, and the 720 px hero image. The live HTML
  and local build were both exactly 11,812 bytes with SHA-256
  `10a504a6a1c92f77963123e0266ea2500804a958161ef575ce6f4952d09a7e4e`.
- Static payloads are within budget: JS 10,754 B, CSS 16,604 B, loaded WOFF2
  fonts total 21,472 B, and mobile hero 43,790 B. No Lighthouse executable is
  declared or installed in this repository, so no fresh Lighthouse score is
  claimed; the functional/browser and byte-budget checks above were run.

## Retest command set

```sh
npm ci
npm test
npm run build
npx tsc --noEmit
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo package --allow-dirty
curl -sSI https://edit-trail-finder.sociobot.in/
curl -sSI https://edit-trail-finder.sociobot.in/assets/main-BifG5UM3.js
```
