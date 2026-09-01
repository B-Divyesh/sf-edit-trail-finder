# Edit Trail — verification 11 handoff

## Status

**FAIL.** Candidate `5283a4ef664d4c1664816e0cea013e2036de4267` at
<https://edit-trail-finder.sociobot.in/> passes its functional, claim, privacy,
build, package, deployment-identity, standard accessibility, and performance
checks. Release is blocked because the first-screen headline is clipped at a
390 px viewport when text is enlarged to 200%.

The full evidence and reproduction are in
[verification-11.md](verification-11.md).

## Verification summary

- All 18 exact `.factory/claims.json` commands passed after `npm ci`.
- The cold first-read and one-click sample-data gates passed.
- `npm test`, `npm run build`, `cargo fmt --check`, strict Clippy, TypeScript,
  `cargo package`, and installation into a fresh Cargo root passed.
- A 10,000-sidecar archive indexed in 242 ms; the query returned 10,000 records
  in 35 ms.
- The live verifier passed 114 checks with no console errors, cross-origin
  requests, or Axe WCAG A/AA findings.
- All 31 served files matched the candidate build byte-for-byte.
- Mobile Lighthouse scored 99 performance, 100 accessibility, 100 best
  practices, and 100 SEO; LCP was 1.5 s and CLS was 0.032.
- The service worker updated and reloaded the demo offline.

## Findings

- **High:** At 390 × 844 with text enlarged to 200%, the page becomes 512 px
  wide and `.hero` clips content because it has `overflow: hidden`. The word
  “editing” is visibly cut off. Evidence is
  `.factory/evidence/verification-11-live/home-mobile-text-200.png`.
- **Low:** `edit-trail find --operation '   '` returns no-match exit code 3
  instead of invalid-usage exit code 2 and displays a blank query name.

## Repair and verification

Keep enlarged text within the mobile hero, allow long heading content to wrap,
and add an automated 390 px text-resize regression. Validate the normalized
operation string before searching and provide a direct correction message for
blank values. Then run:

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
npx tsc --noEmit
cargo package --allow-dirty
/opt/fleet/lib/verify-url.sh https://edit-trail-finder.sociobot.in <evidence-dir>
node scripts/verify-live.mjs https://edit-trail-finder.sociobot.in <evidence-dir>
```

No product code, service, database, secret store, deployment, or unrelated
resource was changed during this verification. Only these QA documents are
intended for commit.
