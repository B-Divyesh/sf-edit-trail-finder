# Edit Trail — independent verification 7 handoff

## Status: FAIL

Candidate `a463f65259ca878069bc4589611eb2674a5f86eb` was independently
verified against <https://edit-trail-finder.sociobot.in> on 30 August 2026.
The live deployment matches the candidate and all declared tests pass, but a
release-blocking product and claim defect remains.

## Release blocker

The CLI silently accepts empty and arbitrary-text `.pp3` files as successfully
parsed RawTherapee records with no operations and no warnings. This contradicts
the landing-page and README promise that malformed sidecars become warnings.
It can hide edit metadata without telling the photographer.

Reproduction:

```sh
mkdir archive
touch archive/empty.pp3
cp README.md archive/not-a-sidecar.pp3
edit-trail index archive --output index.json --json
```

Observed: `sidecars: 2`, `parsed: 2`, `warnings: 0`. Both record warning lists
are empty. The `local-sidecar-search` claim test includes malformed XML but no
malformed PP3 fixture, so it does not prove the broader public promise.

Required next step: validate PP3 structure in the CLI, report invalid or empty
PP3 input as a parse warning while continuing the scan, and add invalid PP3 to
the claim test. Then rerun every command in `.factory/claims.json` and the full
verification suite.

## What was verified

- All 16 exact claim commands passed after `npm ci`.
- `npm test`, `npx tsc --noEmit`, `cargo fmt --check`,
  `cargo clippy --all-targets -- -D warnings`, `npm run build`, and
  `cargo package --allow-dirty` passed.
- The packed crate installed into a clean temporary consumer. Help, version,
  demo, index, operations, JSON and CSV find, report, and documented exit
  codes worked.
- The first screen clearly states what the product does, who it serves, and
  the one-click sample action. The demo opens with 2 of 3 matches.
- A 10,000-sidecar archive indexed in 0.218 seconds; all 6,667 crop and denoise
  matches were returned in 0.034 seconds.
- Live Playwright verification passed 79 checks with no console errors,
  external requests, or axe violations. Keyboard, focus, 390px layout,
  reduced motion, invalid-input recovery, and offline service-worker reload
  passed.
- Lighthouse mobile scored 94/100/100/100 for performance, accessibility,
  best practices, and SEO. LCP was 1.50 s and CLS 0.033. Desktop scored 100
  throughout.
- Live headers and caching are correct. Eight representative deployed files,
  including all route documents, JS, CSS, service worker, and Linux binary,
  matched the candidate build byte-for-byte.
- This is a static product with no server API or sign-in, so 429 allowance and
  Entra checks are not applicable.

No product code was modified during verification. Full evidence, hashes,
commands, and the severity matrix are in `.factory/verification-7.md`.
