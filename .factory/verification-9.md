# Independent verification 9 — FAIL

Verified candidate: `b375823a1e64e6d064a916dfb21f91deb392e89f`  
Live URL: <https://edit-trail-finder.sociobot.in/>  
Verification date: 30 August 2026

## Verdict

**FAIL.** The product and deployment otherwise meet the functional acceptance
contract, but the required clean `npm test` quality gate was not reliable: its
first run failed a declared claim test. An immediate full rerun passed, which
identifies an intermittent test/preview-server failure rather than evidence
that the release artifact is consistently correct. A release candidate cannot
pass until `npm test` is deterministic.

## Release-blocking finding

### High — `npm test` is flaky on a declared claim test

From the clean checkout, the first exact `npm test` run ended with exit code
1: 45 passed, 6 intentional host-only CLI skips, and one failure:

```
[mobile] @claim:cross-platform-downloads exposes executable bytes for every named platform
apiRequestContext.get: socket hang up
GET http://127.0.0.1:4173/downloads/edit-trail-linux-x86_64
```

The failure was in `tests/site/site.spec.ts:137`, against the preview server
started by `playwright.config.ts`. It happened after the desktop project had
passed the same test and while the mobile project was fetching the Linux
download. The immediate fresh `npm run test:e2e` rerun passed: 46 passed, 6
skipped, exit code 0. The exact claim command also passed independently in
both browser projects. This makes the fault intermittent, but it remains a
release blocker under the required local quality gate.

Required repair: make the production-preview/download test stable under the
normal two-project suite, then demonstrate repeated clean `npm test` passes.

## Claims preflight

`.factory/claims.json` was present and all 16 exact declared commands passed
from the clean checkout before broader QA:

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

The host-only CLI cases intentionally skip their duplicate mobile project;
their desktop execution passed. No claim was missing.

## First-read and end-to-end evidence

Cold live home page plainly says **“Find RAW photos by editing steps”**, names
photographers using RAW editors, and offers the visible one-click **“Try it
with sample data”** action. Clicking it opens `/demo/` with the persistent
“Demo — sample data, nothing is saved” banner and two crop-and-denoise matches
out of three sidecars.

Live invalid/recovery exercise:

- malformed `<broken` input: “Could not parse pasted-sidecar.xmp. Check that
  its XML is complete.”
- empty input: `0 of 0 sidecars match all selected operations.` plus the
  actionable empty state
- Reset demo restored the two bundled results; no page or console errors

The purpose and first action satisfy the plain-words and demo requirements.

## Local build, CLI, and static checks

- `npm ci`: passed with 0 vulnerabilities reported.
- Clean full `npm test`: **failed once as above**, then rerun passed with 46
  Playwright passes and 6 intentional skips. Rust: 6 unit tests, 3 CLI
  integration tests, and 1 doctest passed; Vitest: 10 passed.
- `npm run build` / `npm run build:site`: passed and produced `dist/site`.
  Main JS is 16.50 kB (6.36 kB gzip); CSS is 20.29 kB (5.39 kB gzip).
- `npx tsc --noEmit`, `cargo fmt --check`, and
  `cargo clippy --all-targets -- -D warnings`: passed.
- `cargo package --allow-dirty`: passed; 16 files, 67.0 KiB unpacked / 19.5
  KiB crate.
- The packed crate was extracted and `cargo install --path` installed it into
  a clean temporary consumer. Its public `edit-trail demo --output … --json`
  created the three-sidecar demo and its installed CLI returned the expected
  two `crop` + `denoise` JSON matches.

## Live deployment, privacy, accessibility, and performance

- The downloaded live `/` body SHA-256 exactly matched this candidate’s
  `dist/site/index.html` (`11903cbcc002d7fec64b42a4a774b737be9c54269115b68c0d80f34274f3aadb`).
  Live Linux binary is 1,077,392 bytes with ELF magic and an attachment
  disposition.
- `node scripts/verify-live.mjs https://edit-trail-finder.sociobot.in …`:
  **86/86 checks**, 0 console errors, 0 external requests, 0 Axe WCAG 2 A/AA
  violations. It covered all native downloads, demo isolation/reset/exit,
  mobile navigation and no overflow, keyboard focus, direct legal/404 routes,
  offline reload of demo/privacy/terms, and all internal links.
- Independent cold desktop and 390×844 mobile Playwright checks found exactly
  one h1, main landmark, visible solid focus rings, no console/page errors,
  only same-origin requests, and no serious/critical Axe findings. Reduced
  motion is covered by the full browser suite.
- Root headers include HSTS, `nosniff`, strict referrer policy, permissions
  policy, and CSP with `frame-ancestors 'none'`; hashed JS uses
  `cache-control: public, max-age=31536000, immutable`.
- Lighthouse mobile (live, Chromium): performance 99, accessibility 100,
  best practices 100, SEO 100; LCP 1.4 s, CLS 0.033, TBT 120 ms.
- This is a static CLI landing product with no product server endpoint,
  accounts, unlock calls, or API allowance to rate-limit. Browser request logs
  show no analytics, advertising, payment, account, or other third-party
  requests.

## Other findings

No other acceptance-contract defects were found. Product code was not
modified during this verification.
