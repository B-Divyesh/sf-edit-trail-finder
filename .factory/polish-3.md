# Polish round 3 — every cumulative finding resolved

Reviewed candidate `0275189fc6e959f75d2d8d3c470dcb77742e3f3c` against
review commit `48dea03d9c77dc775a471bd72905cdc77c915335`. The round 3
implementation is commit `18e9a8c7dfe9f0da115cdc592cc86fdbfdf9af64`.

Evidence used below:

- Clean clone: `/tmp/edit-trail-polish3-clean.R3fGqL/repo`
- Full suite: `npm test` — 6 Rust unit tests, 3 CLI integration tests, 1
  doctest, 10 Vitest tests, and 46 Playwright passes; 6 duplicate host-only
  CLI runs skipped on the mobile project
- Claims: all 16 exact `.factory/claims.json` commands passed independently
- Live verifier: `.factory/evidence/polish-3-live/live-check.json` — 86 checks,
  0 console errors, 0 external requests, and 0 Axe violations
- URL verifier: `.factory/evidence/polish-3-live/verify.json`
- Screenshots: `.factory/evidence/polish-3-live/home-desktop.png`,
  `home-mobile.png`, `mobile-menu.png`, `demo-mobile.png`, and
  `demo-reset-desktop.png`
- Lighthouse: `.factory/evidence/polish-3-live/lighthouse.json` — 100 in
  performance, accessibility, best practices, and SEO; LCP 1.5 s, CLS 0.033,
  and total blocking time 0 ms
- Live URL: <https://edit-trail-finder.sociobot.in>

## Review 1

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | `/demo/` and `?demo=1` run the default crop-and-denoise search immediately and show two records. | `@claim:sample-demo`; live checks `one click opens two sample results` and `?demo=1 shows results without a second action`; `demo-mobile.png` |
| F-1-2 | **View install options** leaves the demo and removes its banner. | Test `demo query entry redirects to the real sandbox route and its exit discards the mode`; live `demo exit reaches the real install section` |
| F-1-3 | The browser parser and bundled sample support XMP, representative DxO DOP, and PP3. | `@claim:browser-sidecar-formats`; live two-record sample |
| F-1-4 | Compact responsive hero spacing keeps all three facts within 1440×900 and 390×844. | Test `first-screen facts stay inside desktop and mobile viewports`; live desktop/mobile bounds; `home-mobile.png` |
| F-1-5 | `/demo/` has its own title and h1; history restores the triggering control. | Tests `browser Back returns focus to the sample-demo trigger` and `all routes provide their own sharing metadata and the shared shell` |
| F-1-6 | Every route has its own title, description, canonical, OG/Twitter metadata, share image, favicon, and touch icon. | Test `all routes provide their own sharing metadata and the shared shell`; live route checks |
| F-1-7 | Home, demo, legal, and 404 pages share the same four-link header and complete footer. | Shared-shell browser test and live route crawl |
| F-1-8 | Response-header CSP contains `frame-ancestors 'none'`. | `response-policy.test.ts`; live check `live CSP prevents framing` |
| F-1-9 | Split the README introduction into short plain-language sentences. | `npm run copy:audit:check`; longest sentence is 18 words |
| F-1-10 | Split the exit-code explanation and execute every documented code. | `@claim:cli-contract`; copy audit |
| F-1-11 | Separated stored-data and pixel-exclusion statements. | `@claim:local-sidecar-search`; copy audit |
| F-1-12 | Shortened build and deployment wording. | `@claim:deployment-artifact`; copy audit |
| F-1-13 | Renamed the heading **CLI behavior on large archives**. | Copy audit and live body check |
| F-1-14 | Renamed the heading **Example search recipes**. | Copy audit and live page |
| F-1-15 | Standardised user copy on **editing step**, index fields on **operation**, and UK spelling. | Terminology table in `.factory/copy-audit.md` |
| F-1-16 | Controls now name results: **Try sample data**, **View install options**, and **Copy command**. | Browser keyboard suite; copy audit |
| F-1-17 | Registered and tested the MIT statement. | `@claim:mit-license` |
| F-1-18 | Removed the unproved 10,000-sidecar count. | Copy audit and live body check |
| F-1-19 | Removed the last unproved 247-result count. | Live check `unproved 247 count is absent` |
| F-1-20 | Removed the unproved 10,000-record report count. | Copy audit and live body check |
| F-1-21 | Removed the unproved 89-result output. | Copy audit and live body check |
| F-1-22 | Removed the unsupported single-binary/runtime-service sentence. | README copy audit |
| F-1-23 | Registered the default `.edit-trail.json` behavior and deletion result. | `@claim:default-index-path`; live Privacy check |
| F-1-24 | Narrowed alias/history wording to tested behavior. | `@claim:local-sidecar-search`; `demo.test.ts` |
| F-1-25 | Registered `--open` and test its exact target with a fake OS opener. | `@claim:open-folder` |
| F-1-26 | Removed exhaustive help and index-override promises. | README copy audit |
| F-1-27 | Removed the untested unknown-field promise. | README copy audit |
| F-1-28 | Limited privacy copy to tested no-pixel behavior. | `@claim:local-sidecar-search`; `@claim:cli-private-read-only` |
| F-1-29 | Registered the build output and deployment configuration. | `@claim:deployment-artifact` |
| F-1-30 | Registered runtime privacy and recorded the whole request stream. | `@claim:no-runtime-third-parties`; live 0 external requests |
| F-1-31 | Shipped Linux x64, macOS arm64/x64, and Windows x64 downloads with native signatures. | `@claim:cross-platform-downloads`; live signature checks |

## Review 2

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | **Reset demo** restores source text, clears the picker, selects **All selected**, selects crop and denoise, and redraws two records. | `@claim:sample-demo`; live reset checks; `demo-reset-desktop.png` |
| F-2-2 / F-1-19 | Removed “247” from the hero. | Live check `unproved 247 count is absent` |
| F-2-3 / F-1-23 | Added the default-index claim and fresh-directory deletion test. | `@claim:default-index-path` |
| F-2-4 / F-1-25 | Added the exact-target folder-opening sandbox. | `@claim:open-folder` |
| F-2-5 | Narrowed recipe copy and verify all 12 commands plus representative recipes. | `@claim:recipe-download`; live recipe checks |
| F-2-6 | Registered and asserted paths, timestamps, editor, operations, and warnings. | `@claim:local-sidecar-search` |
| F-2-7 | Registered the static build, binary, headers, and cache rules. | `@claim:deployment-artifact`; build artifact verifiers |
| F-2-8 | Replaced the metaphor with the exact malformed-sidecar behavior. | Copy audit; live check `plain scan wording is live` |
| F-2-9 | Renamed the heading **CLI commands for sidecar searches**. | Copy audit; live heading check |
| F-2-10 | Replaced vague automation copy with **Exports JSON**. | Copy audit; live product-fact check |
| F-2-11 | Generate copy counts deterministically and fail CI when stale. | `npm run copy:audit:check` |

## Review 3

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-3-1 | Added a 44 px **Open navigation menu** control to every route. The cyan-edged market-directory panel exposes all four desktop destinations, opens from the keyboard, closes with Escape, returns focus, and focuses the Privacy h1 after navigation. | Test `mobile navigation exposes every destination and manages keyboard focus`; live checks `mobile menu exposes …`, `Escape closes …`, and `mobile Privacy navigation focuses …`; `mobile-menu.png` |

## Result

No finding from reviews 1, 2, or 3 remains open. The production URL was opened
in fresh desktop, mobile, and offline contexts after deployment. The demo,
reset, exit, routing, focus, 404, metadata, downloads, response policy,
privacy, and every registered claim passed.
