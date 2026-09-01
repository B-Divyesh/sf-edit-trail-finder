# Polish round 5 — cumulative finding map

Reviewed candidate `390253a2695107473415e3afa6804d128eb4d731` against
review commit `ae162cfcce66b9c7efd6b20be266f5242216305e`. The repair is
commit `df593ee` and Azure Static Web Apps deployment
`435e1b85-40db-4c74-a638-ba3aa2c96d44` at
<https://edit-trail-finder.sociobot.in>.

Evidence shorthand:

- `clean`: `/tmp/edit-trail-polish5-clean.bYasYz/repo`
- `live`: `.factory/evidence/polish-5-live/live-check.json` — 117 checks,
  zero console errors, external requests, or Axe violations
- `empty screenshot`:
  `.factory/evidence/polish-5-live/demo-empty-desktop.png`
- `URL check`: `.factory/evidence/polish-5-url/verify.json`
- `Lighthouse`: `.factory/evidence/polish-5-live/lighthouse.json` — 100 in
  performance, accessibility, best practices, and SEO

The evidence folders are intentionally ignored by repository policy.

## Review 1

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | The first action opens `/demo/` with the default crop-and-denoise search and two records already visible. | `@claim:sample-demo`; live checks `one click opens two sample results` and `?demo=1 shows results without a second action` |
| F-1-2 | **View install options** leaves the sandbox and removes its banner. | Browser test `demo query entry redirects…`; live demo-exit checks |
| F-1-3 | Browser parsing supports XMP, representative DOP, and PP3 sidecars. | `@claim:browser-sidecar-formats` |
| F-1-4 | Responsive hero spacing keeps all three facts in 1440×900 and 390×844 first screens. | Browser test `first-screen facts stay…`; live desktop/mobile bounds; `home-desktop.png`, `home-mobile.png` |
| F-1-5 | `/demo/` has its own title and h1; Back restores focus to the sample trigger. | Browser Back-focus and shared-route tests; live focus check |
| F-1-6 | Every route has its own title, description, canonical, social metadata, favicon, and touch icon. | Browser test `all routes provide…`; live route metadata checks |
| F-1-7 | Home, demo, legal, and 404 pages use the shared header and complete footer. | Shared-shell browser test; live route checks |
| F-1-8 | Response-header CSP prevents framing. | `response-policy.test.ts`; live check `live CSP prevents framing` |
| F-1-9 | README introduction uses short plain sentences. | `npm run copy:audit:check`; longest sentence 18 words |
| F-1-10 | Exit-code wording is split and all documented codes execute. | `@claim:cli-contract`; copy audit |
| F-1-11 | Stored fields and the pixel exclusion are separate, scoped statements. | `@claim:local-sidecar-search`; copy audit |
| F-1-12 | Build and deployment wording is short and registered. | `@claim:deployment-artifact`; copy audit |
| F-1-13 | The unsupported scale heading is now **CLI behavior and outputs**. | Browser test `round-four landing copy…`; live plain-copy check |
| F-1-14 | The examples heading is **Example search commands**. | Browser test `round-four landing copy…`; live plain-copy check |
| F-1-15 | User copy uses editing step; stored fields use operation; spelling is consistent. | Terminology table in `.factory/copy-audit.md` |
| F-1-16 | Controls use concrete verbs and name their result. | Keyboard browser suite and copy audit |
| F-1-17 | Free/MIT wording is registered and checks the shipped licence. | `@claim:mit-license` |
| F-1-18 | The unproved 10,000-sidecar display count is absent. | Generated copy audit and cold live body review |
| F-1-19 | The unproved 247-result display is absent. | Live check `unproved 247 count is absent` |
| F-1-20 | The unproved 10,000-record report count is absent. | Generated copy audit and cold live body review |
| F-1-21 | The unproved 89-result example is absent. | Generated copy audit and cold live body review |
| F-1-22 | Unsupported single-binary/runtime-service copy remains removed. | README copy audit |
| F-1-23 | Default `.edit-trail.json` creation and deletion are registered. | `@claim:default-index-path`; live Privacy check |
| F-1-24 | Alias/history wording is limited to checked behavior. | `@claim:local-sidecar-search`; `demo.test.ts` |
| F-1-25 | `--open` sends the exact source folder to an isolated fake opener. | `@claim:open-folder`; live command-pack check |
| F-1-26 | Unsupported exhaustive-help and index-override promises remain absent. | README copy audit |
| F-1-27 | The untested unknown-field promise remains absent. | README copy audit |
| F-1-28 | Privacy wording is limited to tested no-pixel and read-only behavior. | `@claim:local-sidecar-search`; `@claim:cli-private-read-only` |
| F-1-29 | Static build outputs, binaries, headers, and caching are registered. | `@claim:deployment-artifact` |
| F-1-30 | Runtime privacy records the complete browser request stream. | `@claim:no-runtime-third-parties`; live zero-external-request check |
| F-1-31 | Linux x64, macOS arm64/x64, and Windows x64 downloads have native signatures. | `@claim:cross-platform-downloads`; four live signature checks |

## Review 2

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | **Reset demo** restores sample text, clears the picker, selects All/crop/denoise, and redraws two records. | `@claim:sample-demo`; live reset checks; `demo-reset-desktop.png` |
| F-2-2 / F-1-19 | The 247-result text remains absent. | Live absence check |
| F-2-3 / F-1-23 | The default index path and deletion behavior are registered. | `@claim:default-index-path` |
| F-2-4 / F-1-25 | Folder opening is tested with an exact-target opener sandbox. | `@claim:open-folder` |
| F-2-5 | The 12-command pack is narrow, concrete, and checked. | `@claim:recipe-download`; live command-pack checks |
| F-2-6 | Index paths, timestamps, editors, operations, and warnings are asserted. | `@claim:local-sidecar-search` |
| F-2-7 | Static files, native download, headers, and cache rules are registered. | `@claim:deployment-artifact` |
| F-2-8 | Malformed-sidecar copy states that warnings are recorded and scanning continues. | Copy audit; live plain-copy check |
| F-2-9 | The CLI heading names its sidecar-search content. | Browser and live plain-copy checks |
| F-2-10 | The product fact says **Exports JSON**. | Browser test `round-four landing copy…`; live JSON fact check |
| F-2-11 | Copy counts are deterministic and checked in CI. | `npm run copy:audit:check` |

## Review 3

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-3-1 | Every route has a 44 px phone menu with all four destinations, Escape close, focus return, and route-heading focus. | Browser test `mobile navigation exposes…`; live menu/focus checks; `mobile-menu.png` |

## Review 4

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-4-1 | The landing page shows a self-hosted SVG recording and transcript generated by the shipped CLI. | `@claim:cli-demo-recording`; live recording checks; `cli-demo-recording.png` |
| F-4-2 | **What Edit Trail does not do** states the metadata-only product boundary. | `@claim:local-only-boundary`; live plain-copy check |
| F-4-3 | The first screen says **Free to use · MIT licensed**. | `@claim:mit-license`; live first-screen check |
| F-4-4 | The first screen says **Sidecars stay on your computer**. | `@claim:no-runtime-third-parties`; live request/privacy check |
| F-4-5 | The inaccurate three-command heading is **How Edit Trail searches sidecars**. | Browser and live added/removed-copy checks |
| F-4-6 | The unmeasured scale heading is **CLI behavior and outputs**. | Browser and live added/removed-copy checks |
| F-4-7 | The sample outcome sits directly below its action before install controls. | Mobile browser layout test; live bound check; `home-mobile.png` |
| F-4-8 | Subfolder behavior uses plain wording instead of “recursively”. | Browser and live removed-copy checks |
| F-4-9 | Browser privacy copy says sidecars stay in the tab and are never uploaded. | `@claim:browser-local`; live plain-copy check |
| F-4-10 | The heading is **Find files with selected edits**. | Browser and live plain-copy checks |
| F-4-11 | The section label is **Free example commands**. | Browser and live plain-copy checks |
| F-4-12 | The download heading is **Download 12 archive audit commands**. | `@claim:recipe-download`; live plain-copy check |
| F-4-13 | The action is **Download audit commands**. | `@claim:recipe-download`; live role check |
| F-4-14 | The example heading is **Example search commands**. | Browser and live plain-copy checks |
| F-4-15 | The tab is **Count JSON results**. | Browser and live tab checks |
| F-4-16 | All four native links begin with **Download for**. | `@claim:cross-platform-downloads`; live label/signature checks |
| F-4-17 | README links directly to `/demo/`. | `response-policy.test.ts`; README copy audit |
| F-4-18 | README specifies Rust 1.85 or newer. | `response-policy.test.ts`; README copy audit |

## Review 5 and controller evidence

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-5-1 | Zero loaded sidecars now show **No sidecars yet. Paste sidecar data or choose sidecar files, then find matching files.** Loaded sidecars with zero matches retain filter advice. | Exact browser test `demo gives the right next action for malformed, zero-sidecar, and zero-match states` passes on desktop and 390 px mobile; live checks for both states; `empty screenshot` |

## Final verification

- All 18 exact commands in `.factory/claims.json` passed independently in
  `clean`.
- `npm test` passed 6 Rust library tests, 3 CLI integration tests, 1 doctest,
  12 Vitest tests, and 53 Playwright tests. Seven duplicate mobile CLI runs
  were intentionally skipped.
- `npm run build`, `cargo fmt --check`, strict Clippy, `npx tsc --noEmit`, and
  `cargo package --allow-dirty` passed in `clean`.
- A fresh 10,000-sidecar run indexed all records in 236 ms and returned all
  matches in 34 ms.
- The downloaded live Linux executable matched the local SHA-256
  `c3819a1a2deb86e034e0d24fa2f26e809cd4febf6876146a73edd96ea665c8e4`
  and completed the three-sidecar/two-match demo.
- The post-deploy URL verifier passed. The cold live audit passed all 117
  checks, including the new empty state, routes, focus, 404, privacy, offline,
  downloads, and Axe checks.

No finding from reviews 1–5 remains open.
