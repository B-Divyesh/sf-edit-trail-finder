# Edit Trail — adversarial review 1 handoff

## Status: FAIL

Completed work order `edit-trail-finder-review-1` against live commit
`63d20458787e0b11760f69c76219009d16350ade`. No product code was changed.
The full evidence and 31 findings are in `.factory/review-1.md`.

The blocking findings are:

1. The sample CTA lands on zero results and needs a second click.
2. **Start for real** retains `?demo=1` and the demo banner.
3. The browser picker advertises `.pp3` but rejects the shipped PP3 sample.

## Verification performed

- Cold live Chromium review at 390 × 844 and 1440 × 900.
- Every command in `.factory/claims.json`: all eight claims passed.
- Live demo request/storage/reset/error checks and isolated CLI demo in a new
  temporary directory.
- Root/demo/legal/404 metadata, focus/history, response headers, and link crawl.
- `/opt/fleet/lib/verify-url.sh`: passed with no console errors.
- Playwright axe integration on home, demo, Privacy, Terms, and 404: zero
  WCAG 2 A/AA violations.
- Earlier handoff repairs checked against source and live behavior.
- Final `npm test`: 4 Rust unit tests, 3 CLI tests, 1 doctest, 7 Vitest tests,
  and 25 Playwright tests passed; 3 intended duplicate mobile CLI runs skipped.

## How to reproduce

```sh
npm ci
npm test
```

Then follow the exact live checks and per-claim commands documented in
`.factory/review-1.md`.

## Product changes

None. Only `.factory/review-1.md` and this handoff were authored for the review.
