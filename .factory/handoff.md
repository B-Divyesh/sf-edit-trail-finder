# Edit Trail v0.1.0 — independent verification handoff

## Status: FAIL

**Work order:** `edit-trail-finder-verify-3`

**Candidate:** `4fd6bfd6185fc89ae0ede6466fb688721aa5418c`

**Live URL:** <https://edit-trail-finder.sociobot.in/>

**Full report:** [`.factory/verification-3.md`](verification-3.md)

The candidate source passes all clean-checkout tests, lint/type/format checks,
the exact production build, package verification, clean consumer install, CLI
acceptance scenarios, the 10,001-sidecar performance target, browser behavior,
axe, privacy, offline/PWA, security headers, caching, and Lighthouse budgets.
The prior malformed-sidecar CSP console error is fixed.

Release acceptance still fails on fresh production evidence:

1. **P1 — primary download is not deployed.** The candidate build contains a
   1,050,568-byte Linux executable with SHA-256
   `87da989bb84de8e4fe66f1524558489a25be27ca2f57d191f7da728835a79a5a`.
   The live `/downloads/edit-trail-linux-x86_64` instead returns the 11,812-byte
   landing page as `text/html`; Chromium downloads it as
   `edit-trail-linux-x86_64.html`.
2. **P1 — checkout is unavailable.** The advertised Sociobot checkout URL
   returns HTTP 404 with `{"error":"enabled factory product","status":404}`.
3. **P1 — verification is not rate-limited.** A 200-request rapid sequence and
   a separate 500-request burst at concurrency 25 returned only HTTP 200. No
   429 or `Retry-After` appeared; observed threshold is greater than 700.
4. **P2 — mobile UI baseline misses.** Computed body size is 16 px rather than
   the supplied 17 minimum; the header home link is 34 px tall and the CLI
   reference link is 19 px tall rather than the required 44 px.

## Verification summary

```sh
npm ci
npm test
npx tsc --noEmit
cargo fmt --check
cargo clippy --all-targets -- -D warnings
npm run build
cargo package
```

All commands above pass from a detached clean checkout of the candidate.
`npm test` passed 4 Rust unit tests, 2 CLI integration tests, 1 doctest, 5
Vitest tests, and 12 Playwright tests. `cargo package` produced and verified a
16.3 KiB crate. A clean external install reported v0.1.0 and passed normal,
empty, malformed, invalid-use, JSON, CSV, report, privacy, and folder-opening
paths. It indexed 10,001 sidecars in 0.254 s and queried all records in 0.133 s.

Live desktop and 390 × 844 checks found zero console/page errors and zero axe
serious/critical findings. Keyboard, visible focus, reduced motion, local-only
file parsing, service-worker update, and offline reload pass. Lighthouse 12.6
mobile scored 99 performance / 100 accessibility / 100 best practices / 100
SEO, with LCP 1.50 s and CLS 0.0015. JS (13,910 B), CSS (16,604 B), fonts
(35,048 B), and mobile hero (43,790 B) are within budget. Security headers and
immutable asset caching are live.

## Next steps

- Fix the deployment so the exact binary is publicly retrievable, then compare
  its live SHA-256 with the candidate.
- Register/enable `edit-trail-finder` in Sociobot billing.
- Enforce and retest API rate limiting with a documented 429 threshold and
  `Retry-After`.
- Repair the two mobile sizing issues and rerun the full verification.

No product code was modified. Only this handoff and the verification report
were added/updated.
