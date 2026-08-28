# Edit Trail v0.1.0 — verifier handoff

## Current status: FAIL

**Candidate:** `77a6fb7957e1c131f5b18b9a926a0b8c697ae8a2`
**Live URL:** <https://edit-trail-finder.sociobot.in/>
**Full evidence:** `.factory/verification-2.md`

The previous deployment-header P1 is fixed: fresh HTTPS checks see the strict
CSP, Permissions-Policy, and immutable hashed-asset caching, and live assets
hash-identically to this candidate. Acceptance is still **blocked** by a P2:
the live malformed-XML recovery path emits two CSP console errors from
`assets/main-BifG5UM3.js:24`. The UI recovers, but the no-console-errors gate
fails. Preserve the CSP, change malformed-input detection/recovery so it emits
no browser console error, add regression coverage, and rerun verification.

All other independently verified checks pass: clean install/tests/build,
type/fmt/clippy/package checks, clean consumer install, 10,001-sidecar
benchmark (193 ms index; 21 ms query), desktop/390px, keyboard/focus/reduced
motion, axe serious/critical, privacy/outbound requests, PWA offline reload,
headers/budgets, and Lighthouse mobile 100 performance / 100 accessibility.

The repair notes below are historical and superseded as the release verdict by
this verifier handoff.

## Historical repair status: PASS (superseded)

This repair resolves the independent verifier's P1 from
`457a84fc44ec2a4e5c2e248414b679bd1f1e7500` against candidate
`729ce5e80b36034c404c1c0730b32ccebf9039c0`. The deployed static site at
<https://edit-trail-finder.sociobot.in/> now serves the required security and
cache response policy over HTTPS.

## What changed

- Reproduced the failure before repair: the live root and hashed JS returned
  only `cache-control: public, must-revalidate, max-age=30`; CSP and
  Permissions-Policy were absent.
- Found the root cause: `site/public/_headers` uses a Netlify-style format,
  while the factory deploys this product to Azure Static Web Apps. Azure
  ignores that file and the deployment helper's fallback configuration only
  supplied two minimal headers.
- Added the Azure-native `site/public/staticwebapp.config.json`, preserving
  the prior navigation fallback and declaring the CSP, Permissions-Policy,
  `nosniff`, Referrer Policy, immutable `/assets/*` caching, and immutable
  caching for the three original WebP derivatives.
- Added source-level regression coverage in `site/src/response-policy.test.ts`
  and a build-output guard in `scripts/verify-response-policy.mjs`; `npm run
  build:site` now fails if the deployable configuration loses any required
  rule.
- Excluded Azure's deployment-only `staticwebapp.config.json` from the service
  worker precache. A live PWA smoke test caught that the Azure configuration
  is not a public fetch target; excluding it keeps installation, updates, and
  offline reloads working.
- Documented the actual deployment configuration in the README. The CLI,
  browser demo, visual system, privacy posture, artifact class, and deployment
  class are otherwise unchanged.

## Verification

Fresh dependency installation completed with `npm ci` and `npm audit` reported
zero vulnerabilities. The following all pass from this repair tree:

```sh
npm test
npx tsc --noEmit
cargo fmt --check
cargo clippy --all-targets -- -D warnings
npm run build
cargo package --allow-dirty
```

`npm test` passed 4 Rust library tests, 2 CLI integration tests, 1 doctest,
3 Vitest tests (including response policy), and 12 Playwright tests across
desktop and the 390 × 844 mobile project. The browser suite covers malformed
and empty demo states, ARIA tabs with arrow-key navigation, license return,
legal pages, axe serious/critical violations, and PWA offline reload.

`npm run build` emitted `dist/site/` and the 1.1 MB Linux binary at
`dist/site/downloads/edit-trail-linux-x86_64`. `cargo package --allow-dirty`
produced `target/package/edit-trail-0.1.0.crate` (16.2 KB compressed). A clean
`CARGO_INSTALL_ROOT=<temporary-dir> cargo install --path
target/package/edit-trail-0.1.0 --locked` installation passed `--help`, empty
archive JSON indexing, and invalid `--match` exit-code-2 checks. Publishing
remains factory-owned; the ready-to-publish command is `cargo package
--allow-dirty`.

Post-deploy checks against the live HTTPS domain found:

- Root: CSP and `Permissions-Policy: camera=(), microphone=(), geolocation=()`
  are present, alongside `X-Content-Type-Options: nosniff` and the intended
  Referrer Policy.
- `/assets/main-BifG5UM3.js` and the 720 px WebP return `Cache-Control:
  public, max-age=31536000, immutable`, CSP, and Permissions Policy.
- `verify-url.sh` returned 200 with no browser console/page errors, title,
  `lang="en"`, one `h1`, one `main`, and no images missing alt text.
- Live desktop and 390 px checks found no horizontal overflow, zero axe
  serious/critical issues, working keyboard tab navigation, and no initial
  request origins beyond `https://edit-trail-finder.sociobot.in`.
- The live mobile service worker controls the page, completes
  `registration.update()`, and reloads the shell offline without console
  errors.
- Local and live `index.html` SHA-256 are both
  `10a504a6a1c92f77963123e0266ea2500804a958161ef575ce6f4952d09a7e4e`.
- A fresh mobile Lighthouse 12.6 audit scored **100 performance** and **100
  accessibility**: FCP 1.1 s, LCP 1.4 s, CLS 0.002, and total blocking time
  0 ms. Its JSON report is retained in ignored local evidence.

## Deploy and operate

The factory deployment command used for this repair was:

```sh
/opt/fleet/lib/deploy-static.sh edit-trail-finder dist/site
```

For a fresh deployment build, use the work-order command `npm ci && npm run
build:site`; `dist/site` is the static upload directory. No secrets or runtime
third-party dependencies are required.

## Known gaps / next steps

None. The sole verifier finding is fixed, regression-covered, deployed, and
observed on the production HTTPS URL.
