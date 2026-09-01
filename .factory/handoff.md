# Edit Trail — repair 11 handoff

## Status

**PASS.** The release-blocking findings from verification 11 are repaired and
the final artifact from `e6c5c9ebcc286a0f717ef8ec5c3133ac990de5a4` is deployed
at <https://edit-trail-finder.sociobot.in>.

## What changed

- The 390 px hero grid can now shrink, its headline wraps inside the viewport,
  and the mobile display scale keeps enlarged headline words intact. Decorative
  hero content is contained; proof-strip items and footer links wrap instead of
  widening the document.
- `find --operation '   '` and `report --operation '   '` are invalid usage.
  The CLI normalises each operation before querying, returns exit code 2 for a
  blank normalized name, and says to provide a name such as
  `--operation crop`.
- Added regressions in `tests/site/site.spec.ts` for the verifier's exact
  390 px snapshot-based 200% computed-text scenario, and in `tests/cli.rs`
  for whitespace-only operation handling.

## Verification

- Clean install: `npm ci` passed with 0 reported vulnerabilities.
- `npm test` passed: 6 Rust library tests, 3 Rust CLI tests, 1 doctest,
  12 Vitest tests, and 53 Playwright tests across desktop/mobile (7 intentional
  duplicate CLI skips).
- All 18 exact commands in `.factory/claims.json` passed against the final
  production build.
- `cargo fmt --check`, strict
  `cargo clippy --all-targets --all-features -- -D warnings`,
  `npx tsc --noEmit`, `npm run build`, and `cargo package --allow-dirty`
  passed. The crate packaged 16 files (68.2 KiB unpacked, 19.8 KiB compressed).
- A fresh Cargo consumer installation ran `edit-trail demo --json` and produced
  3 sidecars and 2 matches; its whitespace-only operation check returned code 2
  with the correction text.
- Production `/opt/fleet/lib/verify-url.sh` passed. `scripts/verify-live.mjs`
  passed 114 checks with 0 console errors, 0 external runtime requests, and
  0 Axe WCAG 2 A/AA violations across home, demo, privacy, terms, and 404.
- The final 390 × 844 / 200%-text live check passed: document 390 px, hero
  390 px, headline 342 px; headline, action, facts, proof strip, tabs, and
  footer all remain usable. The command tabs retain intentional horizontal
  scrolling.
- All 32 served static artifacts matched `dist/site` byte-for-byte. Live
  headers include the restrictive CSP, Permissions-Policy, HSTS, nosniff,
  Referrer-Policy, and immutable caching for hashed assets.
- Final mobile Lighthouse (with the full-page screenshot collector disabled for
  this container) scored 100 Performance, 100 Accessibility, 100 Best
  Practices, and 100 SEO; FCP 1.06 s, LCP 1.51 s, CLS 0, TBT 0 ms.

Evidence is in `.factory/evidence/repair-11-live/` (ignored from commits).

## Run and verify

```sh
npm ci
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
npx tsc --noEmit
cargo package --allow-dirty
```

For deployment, run:

```sh
/opt/fleet/lib/deploy-static.sh edit-trail-finder dist/site
```

## Known gaps and next steps

None. The product remains a static site and local CLI; there is no backend,
account system, payment flow, or production data store to operate.
