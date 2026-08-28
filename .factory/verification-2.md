# Independent verification — FAIL

**Work order:** `edit-trail-finder-verify-2`
**Candidate:** `77a6fb7957e1c131f5b18b9a926a0b8c697ae8a2`
**Live URL:** <https://edit-trail-finder.sociobot.in/>
**Verified:** 2026-08-28 UTC, from a fresh detached clone at the exact SHA.

## Verdict

**FAIL.** The previous deployment-only P1 is repaired: the live response
policy and cached deployable content match this candidate. However, the
required malformed-sidecar recovery path emits two browser CSP console errors.
That violates the no-console-errors quality gate and must be fixed before the
candidate is accepted.

## Release-blocking defect

### P2 — malformed XML recovery produces CSP violations in the live product

**Reproduction (Chromium, desktop and 390 x 844 mobile):**

1. Open <https://edit-trail-finder.sociobot.in/>.
2. Paste `<broken` into **Sidecar XML**.
3. Select **Find matching files**.

The UI correctly recovers with `Could not parse pasted-sidecar.xmp. Check that
its XML is complete.`, but Chromium logs two errors, both attributed to
`assets/main-BifG5UM3.js:24`:

```
Applying inline style violates the following Content Security Policy directive
'style-src 'self'' ... The action has been blocked.
```

The errors occur while the demo parses malformed XML with `DOMParser`. The
browser-generated parser-error document attempts inline styling, which is
correctly rejected by the site's strict `style-src 'self'` CSP. The candidate
output is deployed byte-for-byte (including `main-BifG5UM3.js`), so this is a
candidate defect, not an environment discrepancy. Keep the strict CSP and
make malformed-input detection/recovery avoid this console violation; add a
browser regression test that asserts no console errors for that path.

## Clean-clone quality gates

- Detached fresh clone was clean at `77a6fb7957e1c131f5b18b9a926a0b8c697ae8a2`.
  `npm ci` installed 62 packages; audit reported 0 vulnerabilities.
- `npm test` completed its Rust, Vitest, build-site, and Playwright suite:
  4 Rust library tests, 2 CLI integration tests, 1 Rust doctest, 3 Vitest
  tests, and 12 Playwright tests. `test-results/.last-run.json` reports
  `{"status":"passed","failedTests":[]}`.
- Exact production `npm run build` passed, emitting `dist/site/` and the
  1.1 MB Linux binary at `dist/site/downloads/edit-trail-linux-x86_64`.
  Its site-policy guard passed.
- `npx tsc --noEmit`, `cargo fmt --check`, and
  `cargo clippy --all-targets -- -D warnings` passed.
- `cargo package --allow-dirty` passed, producing
  `target/package/edit-trail-0.1.0.crate` (16.2 KiB compressed).

## CLI and package acceptance checks

- Installed the packed crate into a clean `CARGO_INSTALL_ROOT` with
  `cargo install --path target/package/edit-trail-0.1.0 --locked`.
  The installed public `edit-trail --help` and `--version` (`0.1.0`) work.
- On a synthetic archive containing an enabled darktable XMP, RawTherapee PP3,
  and malformed XMP: indexing preserved the parse warning, the documented
  `noise reduction + crop` synonym/all query returned one match, operations
  listing worked, and a non-empty offline report was generated.
- Recovery and boundary exits are correct: no match `3`, invalid
  `--match invalid` `2`, and nonexistent archive `1`, with actionable output.
- Release-binary benchmark: 10,001 valid sidecars indexed in **193 ms**;
  `denoise + crop --match all --json` returned all 10,001 in **21 ms**. This
  satisfies the brief's under-30-second 10,000-photo success measure.

## Browser, accessibility, privacy, and PWA evidence

- On desktop and 390 x 844 mobile: `lang=en`, one `h1`, one `main`, image alt
  attributes, no horizontal overflow, visible cyan `3px` keyboard focus ring,
  arrow-key tabs, and reduced-motion transition duration of `0.000001s`.
  A visual mobile capture showed the intended stacked layout and readable
  controls.
- Normal demo search returned `2 of 3`; empty input produced the visible
  `0 of 0` recovery state. The malformed-input text recovery works but is the
  P2 console-error failure above.
- Axe found **0 serious or critical** findings on desktop and mobile.
- Initial-load request origins were only
  `https://edit-trail-finder.sociobot.in`; no analytics, CDN font/script, or
  sidecar upload was observed. The optional license flow is the only declared
  Sociobot API path. Source and behavior review confirm the CLI reads sidecars
  only, not image pixels.
- The live page is controlled by `/sw.js`; a service-worker registration is
  active and an offline reload retained the shell and showed the offline
  status. The worker uses `skipWaiting`, `clients.claim`, and replaces old
  cache names.

## Deployment identity, response policy, and budgets

- Fresh SHA-256 comparisons were identical for live and local `index.html`,
  `assets/main-BifG5UM3.js`, `assets/style-BgAZSCfR.css`, `sw.js`, `/privacy/`,
  `/terms/`, and the 720 px WebP. The root HTML SHA-256 is
  `10a504a6a1c92f77963123e0266ea2500804a958161ef575ce6f4952d09a7e4e`.
- Live root, JS, image, service worker, and manifest responses include the
  intended CSP, `Permissions-Policy: camera=(), microphone=(), geolocation=()`,
  `X-Content-Type-Options: nosniff`, and Referrer Policy. Hashed JS and hero
  WebP return `Cache-Control: public, max-age=31536000, immutable`; document
  and service-worker resources deliberately revalidate at 30 seconds.
  This confirms the earlier deployment-header defect is fixed.
- Static budgets pass: JS 10,754 B, CSS 16,604 B, mobile hero 43,790 B, and
  WOFF2 assets 35,048 B (all below applicable limits).
- Fresh Lighthouse 12.6 mobile audit completed cleanly with **100
  performance** and **100 accessibility**: FCP 1.1 s, LCP 1.4 s, CLS 0.002,
  and TBT 40 ms.

## Retest commands

```sh
npm ci
npm test
npm run build
npx tsc --noEmit
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo package --allow-dirty
```

Then reproduce the malformed XML browser path above while collecting console
errors. Do not accept the release until that path is clean.
