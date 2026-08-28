# Edit Trail v0.1.0 — build handoff

## What shipped

- A Rust single-binary CLI with `index`, `find`, `operations`, and `report`
  commands; useful `--help`, stable JSON/CSV, and documented exit codes.
- Recursive, read-only parsing for `.xmp`, `.dop`, and `.pp3` files. The index
  records paths, timestamps, editor families, active operations, and warnings;
  it never reads image pixels or unrelated private metadata.
- darktable history boundaries and module instances, Adobe crop/denoise/mask
  hints, RawTherapee sections, generic module attributes, operation aliases,
  malformed-file isolation, hidden-file control, and symlink control.
- Combined `all`/`any` operation searches, capped folder opening, and a
  self-contained responsive/printable offline HTML audit report.
- A Vite static product site at `dist/site`, including a real browser-local
  sidecar demo, keyboard tabs, desktop/mobile layouts, explicit empty/error/
  offline states, install/docs content, privacy and terms pages, and an offline
  service-worker shell with a build-generated asset manifest.
- Sociobot one-time purchase flow for the optional $19 Supporter tier: hosted
  checkout link, query-token capture/removal, local storage, daily cached
  verification, optimistic offline unlock, invalid-license lock, restore form,
  and a downloadable audit-recipe pack. The complete CLI remains free.
- Original night-market metadata illustration in responsive 720/1080/1440 px
  WebP variants (43/87/148 KB); prompt, generation details, and the complete
  product visual system are in `.factory/design.md`.

## Run and release

```sh
npm install
npm test
npm run build
cargo package --allow-dirty
```

The exact build command is `npm run build`. It writes the deployable site to
`dist/site/index.html` and the release executable to
`dist/site/downloads/edit-trail-linux-x86_64`. The factory should deploy
`dist/site`; it should publish the crate/release artifact with its own
credentials. The billing product is intentionally referenced only by slug and
still needs factory registration/switching if a staging checkout is desired.

## Verification performed

- `npm test`: passes Rust unit/integration/doctests, Vitest unit tests, a Vite
  production build, and 12 Playwright cases across desktop Chromium and a
  390×844 mobile viewport.
- Browser coverage includes the local demo, malformed and empty input,
  keyboard arrow navigation, horizontal overflow, license return/verification,
  privacy/terms, service-worker precache, and interactive offline reload.
- Playwright axe scan: zero serious or critical findings. Factory URL verifier:
  title present, `lang="en"`, one `h1`, main landmark, no missing image alt,
  no unlabeled buttons, and no console errors.
- Lighthouse mobile: Performance **99**, Accessibility **100**, Best Practices
  **100**, SEO **100**; FCP **1.2 s**, LCP **1.8 s**, TBT **0 ms**, CLS
  **0.002**. (Lab Lighthouse does not report field INP; zero TBT is the lab
  interaction proxy.)
- Payloads: initial JS 10.75 KB uncompressed, CSS 16.60 KB, loaded Latin WOFF2
  fonts 21.47 KB, and mobile hero 43 KB—all below contract budgets.
- Release `cargo clippy --all-targets -- -D warnings` passes, `npm audit`
  reports zero vulnerabilities, and `cargo package` verifies successfully.
- Synthetic 10,001-sidecar release benchmark: index **0.27 s**, two-operation
  JSON query **0.02 s**, far inside the 30-second success measure.

## Known gaps / next steps

- Editor schemas evolve. Unknown fields are safely ignored, but future vendor
  versions should add fixtures before adding aliases or inference rules.
- The production artifact contains a Linux x86_64 binary. CI should add macOS,
  Windows, ARM64 builds, checksums, and signed release attachments.
- The browser demo is a deliberately tiny TypeScript parser rather than the
  Rust core compiled to WASM. It demonstrates real local parsing while keeping
  initial JS at 10.75 KB; the CLI remains authoritative for full archives.
- Lighthouse and the URL verifier ran against the local production preview;
  repeat them against the deployed HTTPS URL after factory deployment.
