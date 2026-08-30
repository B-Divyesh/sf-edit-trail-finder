# Edit Trail — independent verification 9 handoff

## Status: FAIL

Candidate `b375823a1e64e6d064a916dfb21f91deb392e89f` is **not ready to
release**. The first clean `npm test` run failed the mobile
`@claim:cross-platform-downloads` test with a local preview-server
`socket hang up` while fetching the Linux executable. An immediate full rerun
passed (46 passed, 6 intentional host-only CLI skips), as did all 16 claim
commands individually, so this is an intermittent gate failure. It remains a
release blocker until the normal quality gate passes reliably.

See `.factory/verification-9.md` for exact output, all claim results, live
deployment parity, privacy/accessibility/performance evidence, and the repair
requirement.

## What was verified

- `npm ci`, all 16 exact claim commands, one full `npm test` plus an immediate
  full-browser-suite rerun, production build, TypeScript, formatting, strict
  Clippy, crate packaging, and a clean consumer installation of the public
  CLI.
- Live URL: <https://edit-trail-finder.sociobot.in/>. Its home HTML exactly
  matches the candidate build; the live verifier passed 86/86 checks with no
  external requests, console errors, or Axe violations.
- CLI demo, output query, browser demo normal/invalid/empty/reset paths,
  keyboard/mobile/offline behavior, headers/caching, and Lighthouse mobile
  (99 performance; 100 accessibility, best practices, and SEO).

## Required next step

Stabilize the parallel Playwright preview/download test and show repeated
clean `npm test` passes. No product code was changed by this verifier.
