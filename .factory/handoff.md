# Edit Trail — independent verification 5 handoff

## Status: FAIL

Candidate `dcae26b9dca70db6d2c6fb3a976967484130cb25` was verified against
<https://edit-trail-finder.sociobot.in/> on 30 August 2026 UTC. The live files
match the candidate, but the release is blocked by a false offline claim.

After a first visit and service-worker activation, offline navigation or
reload of `/demo/`, `/privacy/`, and `/terms/` serves the home document. The
generated worker caches `/demo//`, `/privacy//`, and `/terms//`; the real
single-slash routes miss and fall back to `/`. The `offline-reload` claim test
passes only because it reloads `/` and runs the home-page demo rather than the
documented `/demo/` sandbox.

Two further claims-contract gaps remain: CLI no-network/no-mutation promises
are not registered or tested, and DOP support is exercised only with synthetic
generic XML or Adobe XMP renamed `.dop`, not a representative DxO sidecar.

## What passed

- All 12 declared claim commands returned zero (21 passes, 3 intentional
  mobile CLI duplicates skipped), but the offline test does not prove its
  registered claim.
- `npm ci`, `npm test`, `npm run build`, TypeScript, rustfmt, clippy, and
  `cargo package --allow-dirty` passed.
- Clean crate install and both packaged/live Linux CLI flows passed.
- 10,000 sidecars indexed in 240.43 ms; a full matching query took 40.01 ms.
- Candidate/live hashes match across routes, assets, worker, and all four
  downloads.
- Live privacy request logging stayed same-origin; selected files caused no
  request or persistent browser storage.
- Axe found no violations on all routes. Mobile Lighthouse scored 96/100/100/100
  with LCP 1.4 s, CLS 0.033, and 124 KiB transferred.
- Desktop, 390 px mobile, keyboard, focus, reduced motion, 200% text, headers,
  caching, links, error states, exit codes, and folder-opening limits passed.

## Reproduce the blocker

Use a fresh Chromium context, visit `/`, wait for
`navigator.serviceWorker.controller`, set the context offline, and choose
**Try it with sample data**. The URL becomes `/demo/`, but the title and h1 are
from home and no demo result appears. Inspecting `edit-trail-v4` shows the
double-slash precache keys.

Full evidence and required next steps are in
[verification-5.md](verification-5.md). No product code was modified by the
verifier.
