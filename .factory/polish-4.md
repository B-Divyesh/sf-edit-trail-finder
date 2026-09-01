# Polish round 4 — cumulative finding map

Reviewed every `.factory/review-*.md` and `.factory/polish-*.md`. The repair
is product commit `5d619ad` (`fix: complete polish round four`). The deployed
URL is <https://edit-trail-finder.sociobot.in>; the cold production audit is
recorded in `.factory/evidence/polish-4-live/live-check.json` (114 checks, no
console errors, external requests, or Axe violations). Screenshots referenced
below are under `.factory/evidence/polish-4-live/`.

The exact 18 commands from `.factory/claims.json` were each run independently
from the clean clone `/tmp/edit-trail-polish4-clean.6IMrj8/repo`; `npm test`,
`npm run build`, `cargo fmt --check`, strict Clippy, and `cargo package
--allow-dirty` also passed there.

## Review 1

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | `/demo/` and `?demo=1` open the crop-and-denoise sample and two results without setup. | `@claim:sample-demo`; live checks for one-click and `?demo=1`; `demo-mobile.png` |
| F-1-2 | **View install options** leaves demo mode and discards its banner/state. | Demo routing test; live check `demo exit reaches the real install section` |
| F-1-3 | Browser demo supports bundled XMP, DOP, and PP3 sidecars. | `@claim:browser-sidecar-formats` |
| F-1-4 | Hero spacing keeps all three facts in the first desktop and 390 px mobile screens. | Live desktop/mobile bounds; `home-desktop.png`, `home-mobile.png` |
| F-1-5 | Demo has its own route/title/h1 and browser Back returns focus to its trigger. | Route/focus browser tests; live history-focus check |
| F-1-6 | Each real route has title, description, canonical, OG/Twitter metadata, and icons. | Route metadata tests; live route checks |
| F-1-7 | Home, demo, legal, and 404 pages share the full header/footer shell. | Shared-shell test; live internal-link crawl |
| F-1-8 | Production CSP is response-header based and prevents framing. | `response-policy.test.ts`; live CSP check |
| F-1-9 | README introduction was split into short plain sentences. | `npm run copy:audit:check` |
| F-1-10 | README exit-code text is concrete and documented codes execute. | `@claim:cli-contract` |
| F-1-11 | Stored-data and pixel-exclusion statements are separated and scoped. | `@claim:local-sidecar-search` |
| F-1-12 | Build/deployment wording is short and evidenced. | `@claim:deployment-artifact`; copy audit |
| F-1-13 | Unsupported scale wording is now the factual heading **CLI behavior and outputs**. | Live plain-copy check; `home-desktop.png` |
| F-1-14 | Example section is named **Example search commands**, not a metaphor. | Live plain-copy check |
| F-1-15 | Copy consistently uses editing step for people and operation for index data. | `.factory/copy-audit.md` terminology table |
| F-1-16 | Controls use concrete verbs and results. | Keyboard/browser tests; copy audit |
| F-1-17 | The free/MIT statement is registered and tested. | `@claim:mit-license` |
| F-1-18 | Unproved 10,000-sidecar number was removed. | Copy audit; live body check |
| F-1-19 | Unproved 247-result number was removed. | Live check `unproved 247 count is absent` |
| F-1-20 | Unproved 10,000-record report number was removed. | Copy audit |
| F-1-21 | Unproved 89-result output number was removed. | Copy audit |
| F-1-22 | Unsupported single-binary/runtime-service promise was removed. | README copy audit |
| F-1-23 | Default `.edit-trail.json` behavior and deletion are registered and tested. | `@claim:default-index-path`; live Privacy check |
| F-1-24 | Alias/history wording is limited to tested local behavior. | `@claim:local-sidecar-search`; demo tests |
| F-1-25 | `--open` has an exact-target sandbox test. | `@claim:open-folder` |
| F-1-26 | Untested exhaustive-help/index-override promises were removed. | README copy audit |
| F-1-27 | Untested unknown-field promise was removed. | README copy audit |
| F-1-28 | Privacy copy is limited to tested no-pixel/read-only behavior. | `@claim:local-sidecar-search`; `@claim:cli-private-read-only` |
| F-1-29 | Static build, binaries, headers, and caching behavior are registered. | `@claim:deployment-artifact` |
| F-1-30 | Runtime privacy records the full request stream. | `@claim:no-runtime-third-parties`; live 0-external-request check |
| F-1-31 | Linux, macOS arm64/x64, and Windows native binaries are served with correct signatures. | `@claim:cross-platform-downloads`; live signature checks |

## Review 2

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | **Reset demo** restores controls, clears picker, and redraws the initial two results without touching real storage. | `@claim:sample-demo`; live reset checks; `demo-reset-desktop.png` |
| F-2-2 | The 247-result claim remains removed. | Live check `unproved 247 count is absent` |
| F-2-3 | Default-index claim/deletion behavior remains registered. | `@claim:default-index-path` |
| F-2-4 | Folder opening remains tested in an exact-target sandbox. | `@claim:open-folder` |
| F-2-5 | The 12-command pack is concrete and its commands execute as promised. | `@claim:recipe-download`; live command-pack checks |
| F-2-6 | Index fields, warnings, timestamps, editors, and operations are registered and asserted. | `@claim:local-sidecar-search` |
| F-2-7 | Build artifact, binary, headers, and cache rules are verified. | `@claim:deployment-artifact` |
| F-2-8 | Malformed-sidecar copy says exactly what happens. | Copy audit; live plain-copy check |
| F-2-9 | CLI heading is now factual: **CLI behavior and outputs**. | Live plain-copy check |
| F-2-10 | JSON output is named plainly in the product facts. | Live JSON-fact check |
| F-2-11 | Copy counts are generated deterministically and checked in CI. | `npm run copy:audit:check` |

## Review 3

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-3-1 | Every route has a 44 px mobile navigation control; Enter opens it, Escape returns focus, and navigation focuses the destination h1. | Mobile keyboard test; live menu/focus checks; `mobile-menu.png` |

## Review 4

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-4-1 | Landing now includes `edit-trail-demo.svg`, generated by `scripts/record-cli-demo.mjs` from the shipped binary, plus a visible transcript/caption. It records three sidecars and two matches. | `@claim:cli-demo-recording`; live recording/origin check; `cli-demo-recording.png` |
| F-4-2 | Added **What Edit Trail does not do** after the preview, with explicit metadata-only/no-render/no-organise/no-upload/no-edit boundary. | `@claim:local-only-boundary`; live plain-copy check; `home-desktop.png` |
| F-4-3 | First-screen price fact now says **Free to use · MIT licensed**. | `@claim:mit-license`; live first-screen fact check |
| F-4-4 | First-screen privacy fact now says **Sidecars stay on your computer**. | `@claim:no-runtime-third-parties`; live request/privacy fact checks |
| F-4-5 | Replaced the inaccurate **three commands** wording with **How Edit Trail searches sidecars**. | Live removed/added-copy checks |
| F-4-6 | Replaced unmeasured **large archives** heading with **CLI behavior and outputs**. | Live removed/added-copy checks |
| F-4-7 | Moved **Opens three samples and shows two matches** immediately below the sample action and before install controls. | Mobile layout test; live mobile bound check; `home-mobile.png` |
| F-4-8 | Replaced **recursively** with **in every subfolder**. | Live removed/added-copy checks |
| F-4-9 | Replaced parser implementation jargon with **Your sidecars stay in this tab and are never uploaded**. | Live plain-copy check; `@claim:no-runtime-third-parties` |
| F-4-10 | Renamed **Query combinations** to **Find files with selected edits**. | Live removed/added-copy checks |
| F-4-11 | Renamed **Free command recipes** to **Free example commands**. | Live removed/added-copy checks |
| F-4-12 | Renamed the download section **Download 12 archive audit commands**. | Live plain-copy check |
| F-4-13 | Renamed the download action **Download audit commands**. | Live role/action check; command-pack test |
| F-4-14 | Renamed examples **Example search commands**. | Live plain-copy check |
| F-4-15 | Renamed the tab **Count JSON results**. | Live role/tab check |
| F-4-16 | Every native link now starts with **Download for** and names its platform. | `@claim:cross-platform-downloads`; live link-label/signature checks |
| F-4-17 | README now links directly to `https://edit-trail-finder.sociobot.in/demo/`. | `response-policy.test.ts`; README copy audit |
| F-4-18 | README source-build wording now specifies Rust 1.85 or newer. | `response-policy.test.ts`; README copy audit |

## Final live recheck

Opened the production URL cold after deployment at desktop and 390 px, then
rechecked every review-four change. `?demo=1` redirected to the isolated demo,
the persistent banner/reset worked, the live terminal recording and transcript
were present, and all product routes, legal links, metadata, 404, focus,
offline reload, request privacy, and accessibility checks passed. There are no
open findings of any severity.
