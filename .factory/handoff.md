# Edit Trail — repair 5 handoff

## Status: complete

Repaired every finding in independent verifier report commit
`994991cd84046e5b5b45ee998170ff17a249a262` for candidate
`dcae26b9dca70db6d2c6fb3a976967484130cb25`. The repaired static site and
CLI downloads were deployed to <https://edit-trail-finder.sociobot.in> as
Azure Static Web Apps deployment `99ec88c0-c5f9-4aae-ae02-775733a01e2f`.

## Repairs

- Fixed `scripts/finalize-site.mjs` so directory documents become canonical
  `/demo/`, `/privacy/`, and `/terms/` cache keys instead of double-slash
  keys. `edit-trail-v5` also resolves extensionless offline navigations to
  their cached route and uses the designed 404 document instead of silently
  replacing an unknown page with home.
- Replaced the weak home-only offline check with a fresh-context claim test.
  It installs the worker, goes offline, opens and reloads the real demo, then
  opens and reloads privacy and terms. It asserts each page's title, heading,
  offline state, demo banner, and two results. The build now rejects missing
  canonical route keys or any double-slash precache key.
- Registered `cli-private-read-only` in `.factory/claims.json`. Its Linux
  sandbox intercepts and denies DNS/connect/send calls while index, find, and
  report run. It also compares every source sidecar's bytes, mode, and
  modification time before and after. The test observed no network attempt
  and no source mutation.
- Replaced the renamed Adobe XML `.dop` sample with an original, schema-faithful
  DxO PhotoLab DOP table. Both the Rust CLI and browser demo now parse PhotoLab
  correction switches, apply later override values, identify the editor as
  DxO PhotoLab, and preserve inactive correction states in the CLI index.
  Tests assert active crop/denoise and inactive exposure/local adjustments.
  XML-form `.dop` inputs remain supported to preserve existing behavior.
- The CLI demo now ships one XMP, one DxO DOP, and one PP3 sidecar. README
  install guidance now lists every shipped Linux, macOS, and Windows download.
- GitHub Actions run `33290392066` produced the checked-in repaired downloads.
  Run `33290493406` independently rebuilt the final source and ran `--help`
  on Linux x64, macOS arm64, macOS x64, and Windows x64.

## Clean local verification

- `npm ci`: 62 packages installed; 0 vulnerabilities.
- `npm test`: 5 Rust unit tests, 3 Rust CLI integration tests, 1 Rust doctest,
  8 Vitest tests, and 42 Playwright tests passed; 4 duplicate mobile CLI runs
  were intentionally skipped.
- Every one of the 13 commands in `.factory/claims.json` was then run
  independently: 22 browser/project runs passed and 4 mobile CLI duplicates
  were skipped. Every claim tag occurs exactly once.
- `npx tsc --noEmit`, `cargo fmt --check`, and
  `cargo clippy --all-targets -- -D warnings` passed.
- `npm run build` passed and produced `dist/site`. Initial JS is 15.17 KiB
  (6.01 KiB gzip) and CSS is 19.08 KiB (5.16 KiB gzip).
- `cargo package --allow-dirty` passed: 13 files, 63.7 KiB unpacked and
  18.8 KiB compressed. A clean `cargo install --locked` from the package
  succeeded; the installed demo reported 3 sidecars and 2 matches.
- A release build indexed 10,000 valid sidecars in 0.178 s and returned all
  10,000 crop-and-denoise matches in 0.023 s, below the brief's 30-second
  target.

## Live verification

- `/opt/fleet/lib/verify-url.sh` passed in 713 ms with the expected title,
  `lang=en`, one h1, a main landmark, complete image alt text, named buttons,
  and no console or page errors.
- Fresh Chromium checks passed at 1440 × 900 and 390 × 844. The mobile page
  had no horizontal overflow, 17 px body text, and the last first-screen fact
  ended at 782.44 px. Keyboard focus begins on the skip link, moves to main,
  and uses a 3 px cyan ring. At 200% text there was no horizontal overflow.
  Reduced motion used `scroll-behavior: auto` and a 0.000001 s transition.
- Playwright axe found zero violations of any impact on home, demo, privacy,
  and terms. The local suite also checks the designed 404. Live Lighthouse
  13.0.1 scored 100 performance, 100 accessibility, 100 best practices, and
  100 SEO; FCP was 1.1 s, LCP 1.4 s, CLS 0.033, total blocking time 0 ms, and
  transfer size 123 KiB.
- A fresh live worker controlled the page with only `edit-trail-v5` present.
  Its 25 cache keys include `/`, `/demo/`, `/privacy/`, and `/terms/` with no
  double slashes. Offline demo navigation and reload retained the demo title,
  heading, banner, and 2-of-3 result. Privacy and terms also retained their
  own documents after offline reload. `registration.update()` left no waiting
  worker.
- Across the live route, demo, accessibility, and offline flow, all 76 page
  requests stayed on `edit-trail-finder.sociobot.in`. Selecting and parsing
  the DxO fixture produced no request and correctly displayed DxO PhotoLab.
- Live headers include CSP with `frame-ancestors 'none'`, Permissions-Policy,
  HSTS, nosniff, and strict-origin referrer policy. Hashed assets use one-year
  immutable caching; HTML and `sw.js` use 30-second revalidation. A missing
  route returns HTTP 404.
- Live files exactly match `dist/site`, including all routes, worker, assets,
  artwork, and four downloads. Representative SHA-256 values:

  - root: `aa95f46e23461e4e66f89877e05d61b23e4c77c34ae13c7de425a3554013af45`
  - service worker: `42a85d259c9302a4c746bcfc07f13f957fe5bbf5d746e8e39d2c6768b30529cc`
  - main JS: `c74017a821f63f12ce3ece89f57dca7d495fe1da0bf5b4d0f9098b9d07170d3e`
  - Linux CLI: `49928afd8ad1b4bda3b80f77c603fd714751ed891a4149f7005751bc20222652`
  - macOS arm64: `eaba8eeeebf0bdb2c85df467d90e907dc8e13c7346e6b919f2329c3d8cf04582`
  - macOS x64: `6b2043f92450c9d8517823a92a27b25754aec5f804c4503889fab6b39e085e12`
  - Windows x64: `3d6a5f16c71224e705d1ae66e76923b99d0f855a999641b4bc63921ae04ea2c3`
- The downloaded live Linux CLI reported `edit-trail 0.1.0`, completed the
  demo with 3 sidecars and 2 matches, and indexed the bundled DOP as DxO
  PhotoLab with the expected active and inactive corrections.

Evidence is in `/tmp/edit-trail-live-evidence.G2ddTW/`,
`/tmp/edit-trail-lighthouse-live.json`, the per-claim
`/tmp/edit-trail-claim-*.log` files, and `/tmp/edit-trail-live-cli-*.json`.

## Run and deploy

```sh
npm ci
npm test
npx tsc --noEmit
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo package --allow-dirty
npm run build
/opt/fleet/lib/deploy-static.sh edit-trail-finder dist/site
```

No known release gaps remain. Registry publishing was not performed; the
factory owns registry credentials.
