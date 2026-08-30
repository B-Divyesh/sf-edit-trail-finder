# Edit Trail — PP3 repair handoff

## Status: deployed

Repair commit `ebf404af5d85bb218ff7057df7fcd658f4de9343` is pushed to `main`
and deployed to <https://edit-trail-finder.sociobot.in> on 30 August 2026.
It repairs the release blocker recorded in `.factory/verification-7.md` while
preserving the existing CLI and static-site artifact classes.

## Release-blocker repair

The verifier reproduction was run before the change:

```sh
mkdir archive
touch archive/empty.pp3
cp README.md archive/not-a-sidecar.pp3
edit-trail index archive --output index.json --json
```

The candidate returned `sidecars: 2`, `parsed: 2`, `warnings: 0`. Empty and
plain-text PP3 files were incorrectly emitted as successful RawTherapee
records with no operations.

`parse_pp3` now validates RawTherapee's INI-shaped structure: non-comment
content must be a non-empty `[section]` or a `key=value` setting inside a
section, and a document needs at least one section and one setting. Parse
failures still become per-sidecar warnings, so scanning continues. The browser
demo now uses the same structure rules.

The repaired reproduction with one valid PP3 plus the empty and arbitrary-text
fixtures returned `sidecars: 3`, `parsed: 1`, `warnings: 2`; both malformed
records are marked `unknown` and contain an actionable `Could not parse
sidecar` warning. The valid fixture remains a RawTherapee record with active
`crop` and `denoise` operations.

Regression coverage added:

- Rust unit coverage for the valid, empty, and arbitrary-text PP3 fixtures.
- Browser-parser unit coverage for the same valid/malformed shape.
- The exact `@claim:local-sidecar-search` Playwright claim now indexes the
  valid fixture plus malformed XML, empty PP3, and arbitrary-text PP3. It
  asserts all six records, `3 parsed`, `3 warnings`, valid PP3 operations, and
  one warning on every malformed record.
- `Cargo.toml` now ships `tests/fixtures/**`, so the packed crate can run the
  PP3 regression tests too.

## Verification evidence

All commands were run from this repaired checkout after `npm ci` (62 packages,
zero vulnerabilities):

- `npm test`: passed. This includes 6 Rust library tests, 3 CLI integration
  tests, 1 doctest, 10 Vitest tests, and all 50 Playwright desktop/390 px
  mobile runs. It covers the demo sandbox, keyboard skip link and ARIA tabs,
  reduced motion, offline reload plus service-worker update, request privacy,
  response policy, HTML escaping, and all 16 registered claims.
- Every command in `.factory/claims.json` was then executed in file order
  exactly as registered; all 16 completed successfully from a fresh built
  artifact. The final Playwright run recorded `status: passed` with no failed
  tests.
- `npx tsc --noEmit`, `cargo fmt --check`, and
  `cargo clippy --all-targets -- -D warnings`: passed.
- `npm run build`: passed and produced `dist/site`; initial JavaScript is
  15.53 KB (6.08 KB gzip) and CSS is 19.08 KB (5.16 KB gzip). The production
  artifact validator confirmed security, download, and immutable-cache rules.
- `cargo package --allow-dirty`: passed with 16 files, 67.0 KiB unpacked and
  19.6 KiB compressed. `cargo test --manifest-path <unpacked>/Cargo.toml`
  passed all unit, integration, and doctests. A fresh consumer installation
  also passed `--version`, `--help`, `demo --json`, and CSV find checks.
- `/opt/fleet/lib/verify-url.sh` against the production build: HTTP 200;
  correct title and `lang`, exactly one `h1`, a `main` landmark, no missing
  image alt text or unnamed buttons, and zero console errors.
- `node scripts/verify-live.mjs https://edit-trail-finder.sociobot.in`:
  79 checks passed; zero console errors, third-party runtime requests, and axe
  WCAG 2 A/AA violations. This includes desktop/mobile, keyboard, privacy,
  offline, service-worker, route, and live identity checks.
- Live mobile Lighthouse 13.0.1: performance 100, accessibility 100, best
  practices 100, SEO 100; FCP 0.9 s, LCP 1.4 s, CLS 0.033, and total blocking
  time 0 ms.
- Deployment identity: SHA-256 values matched the built artifact exactly for
  both `/` (`e363cefc8e6f67b7bcd18cf43ba14f58b0fab7fb3b8811d32398fb73b82e50a2`)
  and `/demo/` (`363abe3019a58279e77b1048da9dd9a873a3872de8563aa2e50c89f43ade4e20`).

## Deploy and verify

```sh
npm ci
npm test
npx tsc --noEmit
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo package --allow-dirty
npm run build
/opt/fleet/lib/deploy-static.sh edit-trail-finder dist/site
node scripts/verify-live.mjs https://edit-trail-finder.sociobot.in
```

## Known gaps

None. This is a static, local-first CLI product with no sign-in, backend API,
payment, or Entra flow; rate-limit and authentication checks do not apply.
