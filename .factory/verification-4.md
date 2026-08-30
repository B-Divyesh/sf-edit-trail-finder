# Independent verification 4 — PASS

**Candidate:** `860bf180610a38b95052b58d519625609c09749e` (`main`)  
**Live URL:** <https://edit-trail-finder.sociobot.in/>  
**Verified:** 30 August 2026 UTC  
**Verdict:** **PASS** — no release-blocking defects found.

## First-read result

Cold Chromium at both 1440 × 900 and 390 × 844 showed, without scrolling:

- **What:** “Find photos by their editing steps.”
- **For whom:** photographers using RAW editors.
- **First action:** **Try it with sample data**, with adjacent text saying that three sidecars open ready to search.

The direct browser demo URL (`/?demo=1#demo`) set the title to “Demo — Edit Trail”, returned **2 of 3** matches for crop + denoise, and showed the required “Demo — sample data, nothing is saved” banner with Reset demo and Start for real. This satisfies the plain-words and one-click-demo gate.

## Required claims

`.factory/claims.json` exists and declares eight demo-sandbox claims. Each listed command was run after `npm ci` from this checkout; the consolidated fresh-browser run `npm run test:e2e -- --grep '@claim:'` reported **13 passed, 3 expected mobile duplicates skipped**. No claim failed.

| Claim | Result | Observable evidence |
| --- | --- | --- |
| `sample-demo` | PASS | Default crop + denoise search returns two result records from three samples. |
| `linux-download` | PASS | Browser download is `edit-trail-linux-x86_64`, ELF magic, 1,067,584 bytes. |
| `recipe-download` | PASS | Account-free text download contains all 12 recipes and the documented combination query. |
| `browser-local` | PASS | An in-memory local XMP was parsed; after selection/search there were zero requests and no local/session/IndexedDB data. |
| `offline-reload` | PASS | Dedicated context had controlled `edit-trail-v3`; offline reload completed the 2-of-3 demo search. |
| `local-sidecar-search` | PASS | XMP, DOP, PP3, malformed XML, history boundary, aliases, and RAW-marker non-reading assertions passed. |
| `cli-outputs` | PASS | CLI demo wrote JSON, CSV and a self-contained report with no external resource URL. |
| `cli-contract` | PASS | Exact documented exits passed: 0 success, 1 I/O, 2 invalid usage, 3 no match. |

## Local build and consumer verification

Fresh locked installation completed with `npm ci` (62 packages, 0 vulnerabilities). The following all passed:

```sh
npm test
npm run build
npx tsc --noEmit
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo package --allow-dirty
```

`npm test` covered 4 Rust library tests, 3 Rust CLI integration tests, 1 doctest, 7 Vitest tests, and the Playwright suite. The production build made `dist/site/` and validated the 1,067,584-byte executable. `cargo package` both packaged and verified the 13-file crate.

A clean consumer installation from `target/package/edit-trail-0.1.0` via `cargo install --locked --root <temporary directory>` succeeded. The installed binary reported `edit-trail 0.1.0`; `--help`, `demo --json`, indexing the shipped sample, and JSON crop+denoise search all worked. The query returned the two expected sidecars; an absent operation returned exit 3.

For the brief’s scale measure, a new temporary archive of 10,000 valid XMP sidecars was indexed by the release binary in **227.04 ms** (10,000 records). A denoise+crop CSV query returned success in **27.72 ms**. Both are within the 30-second target.

## Live deployment identity, privacy, and security

The live root and release binary are the candidate output, not merely a similar deployment. SHA-256 matched local production artifacts for root HTML, JS, CSS, service worker, privacy, terms, 720 px image, and Linux executable. In particular, live and local Linux download hash:

```
c46832e3123d7ec7c5d08b95f5b98cc32f1db7bfc12085bad4a357ad22cc9365
```

Live response checks:

- root, privacy, terms, and download: 200; a missing route: custom 404/404.
- download: `application/octet-stream` and attachment filename, not HTML.
- CSP limits `connect-src` to `'self'`; `nosniff`, strict-origin referrer policy, HSTS, and a restrictive Permissions-Policy are present.
- hashed JS/CSS and artwork are one-year immutable; HTML, worker, and binary revalidate at 30 seconds.
- a fresh live desktop/mobile request log contains only the product origin. The mobile hero selected the 720 px asset.
- after browser demo file selection and search, the request log remained empty; localStorage, sessionStorage, and IndexedDB remained empty.
- there are no product server-side endpoints, payment/unlock calls, account flows, or sign-in; the documented 429 allowance check is therefore N/A.

## Browser, accessibility, and resilience

`/opt/fleet/lib/verify-url.sh` passed against the live root in 654 ms: title, `lang=en`, exactly one h1, main landmark, zero missing image alts, zero unnamed buttons, and zero console/page errors. Playwright axe integration found zero serious or critical violations on home (desktop and 390 px mobile), privacy, terms, and the custom 404. The expected browser network warning when navigating to a deliberately missing URL was not treated as an application error.

Keyboard checks passed for the first-position skip link, focus transfer to `<main>`, visible 3 px cyan focus outline, and tab arrow navigation. With reduced motion, smooth scrolling is `auto`. At 390 px there was no horizontal overflow. A live service-worker update produced no waiting worker; controlled offline reload rendered the page and completed the sample search.

## Defects

None found. No known release-blocking or non-blocking defect remains from this verification.
