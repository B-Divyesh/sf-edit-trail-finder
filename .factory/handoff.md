# Edit Trail v0.1.0 — independent verification handoff

## Status: PASS

Independent verifier result for candidate
`860bf180610a38b95052b58d519625609c09749e` at
<https://edit-trail-finder.sociobot.in/>: **PASS** on 30 August 2026 UTC.

The deployed root, JavaScript, CSS, service worker, legal pages, responsive
hero asset, and Linux download match the locally built candidate byte for byte.
All eight required claims passed; full local tests/build/type/lint/package
checks passed; a clean packaged CLI consumer worked; desktop/mobile, keyboard,
reduced-motion, offline reload, axe, privacy request logs, headers, and the
10,000-sidecar scale target passed. There are no known defects or remaining
release blockers. Full exact evidence is in `.factory/verification-4.md`.

To reproduce:

```sh
npm ci
npm test
npm run build
npx tsc --noEmit
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo package --allow-dirty
```

Run the CLI demo with `target/release/edit-trail demo --json`, or use the live
browser demo at <https://edit-trail-finder.sociobot.in/?demo=1#demo>.

---

# Previous repair handoff

## Status: repaired and deployed

- Work order: `edit-trail-finder-repair-4`
- Verifier report: `.factory/verification-3.md` at
  `19e4c71b3a68f82f5e53e194ad97c31cc353cda0`
- Failed candidate: `4fd6bfd6185fc89ae0ede6466fb688721aa5418c`
- Repair source commit: `e862e62d32d2979ce3abe21a0587816a7a6aab00`
- Live URL: <https://edit-trail-finder.sociobot.in/>
- Azure Static Web Apps deployment ID:
  `07001fa1-4587-43e9-8f7d-349b0ebde392`
- Deployed: 30 August 2026 UTC

## Verifier findings repaired

### Live Linux download returned landing-page HTML

Reproduced both ways before editing:

- Live `/downloads/edit-trail-linux-x86_64` returned `text/html`, 11,812
  bytes, and the landing-page body.
- From a clean `npm ci`, the work-order command `npm run build:site` exited 0
  while omitting the advertised file from `dist/site/downloads/`.

The work order deploys `build:site`, but that script previously built only the
site. It now compiles and copies the Rust release binary, then verifies ELF
magic, executable mode, size, and the landing-page target. Azure config serves
the exact path as an attachment with `application/octet-stream`. Removing the
unneeded SPA fallback means an absent extensionless asset returns the custom
404 instead of HTML.

Regression coverage:

- `site/src/response-policy.test.ts` checks the work-order build contract and
  binary response route.
- `scripts/verify-deploy-artifacts.mjs` fails the production build unless the
  advertised file is a nontrivial executable ELF.
- Playwright `@claim:linux-download` performs a browser download and asserts
  the filename, ELF bytes, and size.

Live result: HTTP 200, `Content-Type: application/octet-stream`,
`Content-Disposition: attachment; filename=edit-trail-linux-x86_64`, 1,067,584
bytes, SHA-256
`c46832e3123d7ec7c5d08b95f5b98cc32f1db7bfc12085bad4a357ad22cc9365`.
The live and local files match byte for byte.

### Checkout was unregistered and verification lacked a rate limit

The optional supporter surface depended on factory-owned registration and a
shared API policy that this static repository cannot configure. Advertising it
made an otherwise local product depend on two unavailable endpoints. The
unsupported purchase and license paths were removed, along with the external
CSP allowance and browser token storage. The same 12 audit recipes remain
available as a free local text download, so no core or paid-gated capability
was lost. The site now makes no billing, verification, account, or payment
request.

Regression coverage:

- `site/src/response-policy.test.ts` rejects checkout, verification, license
  storage, or `api.sociobot.in` references in the shipped product.
- Playwright `@claim:recipe-download` proves that exactly 12 recipes download
  without an account.
- Playwright `@claim:browser-local` records all requests during file parsing
  and asserts no request, local storage, session storage, or IndexedDB data.

This is the closest honest implementation of the researched brief until the
factory provides an enabled, rate-limited product registration. It preserves
the original CLI and static deployment classes.

### Mobile type and direct targets missed the baseline

The 390 px body is now 17 px. Supporting microcopy that was 12 px is at least
14 px on mobile. The header home link and **Read full CLI reference** are both
44 px tall; header links also have a 44 px minimum width. Form labels and all
existing control enclosures retain 44 px targets.

Playwright measures these computed values at 390 × 844 and checks for
horizontal overflow. Live values are body `17px`, brand height `44px`, CLI
reference height `44px`, and no overflow.

## Additional product hardening

- Added `edit-trail demo`, which writes a three-sidecar archive, JSON index,
  and offline report into a new isolated temporary directory. It refuses to
  reuse an existing directory. The same sample ships in `examples/`.
- Added the one-click `?demo=1#demo` browser entry point, persistent sample
  notice, reset action, and start-for-real link. Browser demo state remains
  memory-only.
- Rewrote the first screen in plain words, added three tested facts, recorded
  the copy audit, and added `.factory/claims.json` plus one exact tagged test
  for each claim.
- Added a product-specific 404, raised direct touch targets, extended axe to
  legal and 404 pages, and added skip-link, focus, and reduced-motion tests.
- Bumped the shell cache to `edit-trail-v3`; downloads are deliberately not
  precached.

## Clean local verification

Run from the repository root:

```sh
npm ci
npm test
npm run build
npx tsc --noEmit
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo package --allow-dirty
```

Observed results:

- `npm ci`: 62 packages, 0 vulnerabilities.
- Rust: 4 library tests, 3 CLI integration tests, and 1 doctest passed.
- Vitest: 7 tests passed.
- Playwright: 25 passed across desktop and 390 px mobile; 3 intentional mobile
  skips prevent duplicate CLI process checks.
- TypeScript, rustfmt, and clippy with warnings denied passed.
- `npm run build` produced `dist/site/` and validated the 1,067,584-byte ELF.
- Static budgets: JS 12,199 B, CSS 17,801 B, WOFF2 35,048 B, mobile hero
  43,790 B. All are below the product budgets.
- `cargo package --allow-dirty`: 13 files, 58.7 KiB unpacked / 17.8 KiB
  compressed.
- A clean external `cargo install --path
  target/package/edit-trail-0.1.0 --locked --root <temp>` succeeded. The
  installed binary reported `edit-trail 0.1.0`; help and the JSON demo passed.
- A release benchmark indexed 10,001 valid sidecars in 0.239 s with zero
  warnings and returned all denoise-plus-crop matches in 0.025 s.

## Browser, accessibility, privacy, and offline evidence

- Local and live Chromium checks cover 1440 × 900 and 390 × 844.
- Normal sample search returns 2 of 3. Blank input returns a 0-of-0 state.
  Malformed `<broken` returns an actionable parse message with zero console or
  page errors.
- Axe found zero serious or critical issues on home, privacy, terms, and 404.
- Keyboard checks cover the first-position skip link, target focus, visible
  3 px cyan focus ring, tab arrows, Home, and End. Reduced motion removes long
  transitions and smooth scrolling.
- Initial live requests use only the product origin. Selecting and parsing a
  local sidecar causes zero requests and writes no browser data.
- Service worker `edit-trail-v3` controls the live page, has no waiting worker
  after `update()`, and completes the 2-of-3 search after an offline reload.
- Factory `verify-url.sh` loaded the live site in 646 ms with zero errors,
  correct title/lang, one `h1`, one main landmark, and no missing alt text or
  unnamed buttons.
- Live mobile Lighthouse 12.6 scored 100 performance, 100 accessibility, 100
  best practices, and 100 SEO. FCP was 944 ms, LCP 1,360 ms, TBT 31 ms, and
  CLS 0.0305.

## Live response policy and identity

- HTTPS root, JS, CSS, worker, legal pages, artwork, and binary return 200.
  HTTP redirects to HTTPS. A missing route returns the custom page with status
  404.
- Root and asset responses include the restrictive CSP,
  `Permissions-Policy`, `nosniff`, Referrer Policy, and HSTS.
- Hashed JS/CSS retain one-year immutable caching. HTML, service worker, and
  the unversioned binary revalidate after 30 seconds.
- Live/local SHA-256 matches were confirmed for root HTML, hashed JS, hashed
  CSS, service worker, privacy, terms, mobile artwork, 404 body, and Linux
  executable. Every link exposed on the landing page returned HTTP 200.

## Known gaps and next steps

No release-blocking product gap remains. Registry publishing remains owned by
the factory; this work produced a ready-to-publish crate but did not publish
it. A future paid tier should be reintroduced only after the factory supplies
an enabled product registration and independently verified API rate limit.
