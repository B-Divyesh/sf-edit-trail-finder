# Edit Trail — review 3 handoff

## Status: FAIL

Review-only work completed at source commit
`bdc9db3f16f169c28602942340577f81cb267b49`. No product code was changed.
The full report is `.factory/review-3.md`.

## What was verified

- Fresh 390 px and desktop live contexts passed the cold first-read and
  one-click demo checks. The demo immediately shows two realistic records,
  has the required sandbox banner, and Reset restores the initial state.
- All 16 exact `.factory/claims.json` commands passed from a fresh clone at
  `/tmp/edit-trail-review3-clean`.
- `npm test` passed from that clone: Rust, CLI, copy-audit, Vitest, build, and
  44 Playwright tests (6 intentional mobile CLI skips).
- A fresh CLI `demo --output <directory> --json` run created only its own
  temporary sample archive, index, and offline report.
- Live request logging confirmed same-origin-only browser traffic; selecting
  a sidecar did not request or persist it. Offline, metadata, 404, links,
  response headers, desktop/mobile overflow, and prior-review repairs were
  rechecked.

## Remaining gap

`F-3-1` is a medium finding: at 390 px the header hides **Try sample data**,
**CLI guide**, and **Privacy**, leaving only **Install**, without a replacement
menu. Add an accessible keyboard-operable navigation menu that exposes the
same four links at the mobile breakpoint, then add a 390 px route/focus test.

## Reproduce

```sh
npm ci
npm test
npm run build
node scripts/verify-live.mjs https://edit-trail-finder.sociobot.in <evidence-dir>
```
