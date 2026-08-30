# Polish round 2 — every cumulative finding resolved

Reviewed candidate `4987f141ebaa6e35be52b58d519625609c09749e`
against review commit `0e55f90ddd78829781c8e77c75cf323b4ea5687c`.
The repaired product was deployed as Azure Static Web Apps deployment
`72703bbf-fa08-4b51-9099-8061ca069cb0` and checked cold at
<https://edit-trail-finder.sociobot.in> on 30 August 2026.

Evidence shortcuts used below:

- `sample-demo`: `@claim:sample-demo`
- `live-check`: `node scripts/verify-live.mjs` — 79 checks, zero console
  errors, external requests, or axe violations
- Screenshots:
  `.factory/evidence/polish-2-live/home-mobile.png`,
  `.factory/evidence/polish-2-live/demo-mobile.png`, and
  `.factory/evidence/polish-2-live/demo-reset-desktop.png`
- URL verifier: `.factory/evidence/polish-2-live/verify.json`
- Lighthouse: `.factory/evidence/polish-2-live/lighthouse.json`

## Review 1

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | The landing CTA opens the real demo route and immediately renders the crop-and-denoise search with two records. | `sample-demo`; live-check “one click opens two sample results”; demo screenshots |
| F-1-2 | **View install options** leaves demo mode for `/#install`; the demo banner is no longer visible. | `demo query entry redirects…`; live-check demo-exit checks |
| F-1-3 | The browser parser accepts XMP, representative DxO DOP, and PP3 data. | `@claim:browser-sidecar-formats`; live demo sample |
| F-1-4 | The compact hero keeps all three decision facts inside 1440×900 and 390×844. | `first-screen facts stay inside…`; live-check desktop/mobile bounds; home-mobile screenshot |
| F-1-5 | `/demo/` has its own h1/title; browser Back restores the CTA and route changes are announced. | `browser Back returns focus…`; `all routes provide…`; live-check focus |
| F-1-6 | Every route has its own description, canonical, OG/Twitter data, share image, favicon, and touch icon. | `all routes provide their own sharing metadata…`; live-check route metadata |
| F-1-7 | Home, demo, legal pages, and 404 use the same header/footer with legal links, owner, and version. | `all routes provide…`; live-check shared legal shell |
| F-1-8 | The response-header CSP includes `frame-ancestors 'none'`. | `response-policy.test.ts`; live response header and live-check |
| F-1-9 | The README introduction remains split into short plain-language sentences. | generated copy audit; longest sentence 18 words |
| F-1-10 | Exit-code copy remains split and each code is executed. | `@claim:cli-contract`; generated copy audit |
| F-1-11 | Stored and excluded data are separate sentences. | `@claim:local-sidecar-search`; generated copy audit |
| F-1-12 | Build and deployment statements are short and now belong to a registered artifact claim. | `@claim:deployment-artifact`; generated copy audit |
| F-1-13 | The heading remains **CLI behavior on large archives**. | landing-source audit; live-check page copy |
| F-1-14 | The heading remains **Example search recipes**. | landing-source audit; live page |
| F-1-15 | User copy uses “editing step”; index details use “operation”; UK spelling is consistent. | terminology table in `.factory/copy-audit.md` |
| F-1-16 | Controls retain result-naming labels such as **Try sample data**, **View install options**, and **Copy command**. | keyboard/browser suite; generated control audit |
| F-1-17 | MIT licensing remains registered and checks both the first screen and shipped license. | `@claim:mit-license` |
| F-1-18 | The unproved 10,000-sidecar display count remains removed. | generated landing audit; live-check body copy |
| F-1-19 | Removed the last “247” from the hero and replaced it with the non-quantitative marker “matches”. | live-check “unproved 247 count is absent”; home-mobile screenshot |
| F-1-20 | The unproved 10,000-record report count remains removed. | generated landing audit |
| F-1-21 | The unproved 89-result output remains removed. | generated landing audit |
| F-1-22 | The unsupported runtime-service marketing promise remains removed. | generated README audit |
| F-1-23 | Registered the default `.edit-trail.json` behavior and deletion guidance. | `@claim:default-index-path`; live-check Privacy text |
| F-1-24 | The remaining alias/history behavior is stated narrowly and tested across formats. | `@claim:local-sidecar-search`; `demo.test.ts` alias tests |
| F-1-25 | Registered `--open` and test it with a fake OS opener that captures the exact source folder. | `@claim:open-folder`; live recipe download check |
| F-1-26 | Unsupported exhaustive help and index-override promises remain absent. | generated README audit |
| F-1-27 | The untested unknown-field promise remains absent. | generated README audit |
| F-1-28 | Privacy copy remains limited to the tested no-pixel behavior. | `@claim:local-sidecar-search`; `@claim:cli-private-read-only` |
| F-1-29 | Registered the build output and deployment configuration. | `@claim:deployment-artifact`; build artifact verifiers |
| F-1-30 | Runtime privacy is registered and records the entire browser request stream. | `@claim:no-runtime-third-parties`; live-check zero external requests |
| F-1-31 | Linux x64, macOS arm64/x64, and Windows x64 downloads remain exposed and signature-checked. | `@claim:cross-platform-downloads`; four live signature checks |

## Review 2

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | **Reset demo** now restores bundled text, clears the file picker, selects **All selected**, selects only crop and denoise, and redraws two records. The duplicate demo-page reset was removed. | `sample-demo` changes every control before reset; live-check repeats the flow; demo-reset screenshot |
| F-2-2 / F-1-19 | Removed “247” from the hero. | live-check absence assertion; home-mobile screenshot |
| F-2-3 / F-1-23 | Added the default-index claim and fresh-directory index/find/delete test. | `@claim:default-index-path` |
| F-2-4 / F-1-25 | Added the folder-opening claim and exact-target opener sandbox. | `@claim:open-folder` |
| F-2-5 | Narrowed the landing sentence to the observed 12-command download and crop-and-denoise recipe; the test asserts the complete command list and representative formats. | `@claim:recipe-download`; live recipe download check |
| F-2-6 | Expanded the local-index claim and assertions to paths, timestamps, editor, operations, and warnings. | `@claim:local-sidecar-search` |
| F-2-7 | Registered the static build artifact and its response, download, and cache configuration. | `@claim:deployment-artifact`; `verify-response-policy.mjs`; `verify-deploy-artifacts.mjs` |
| F-2-8 | Replaced the metaphor with “Malformed sidecars are recorded as warnings, and scanning continues.” | generated copy audit; live-check exact copy |
| F-2-9 | Renamed the section **CLI commands for sidecar searches**. | generated heading audit; live-check exact copy |
| F-2-10 | Replaced “JSON automation ready” with **Exports JSON**. | generated fragment audit; live-check fact-strip assertion |
| F-2-11 | Added a deterministic source-derived copy-audit generator and made freshness part of `npm test`. | `npm run copy:audit:check`; generated counts in `.factory/copy-audit.md` |

## Verification

A clean clone at `/tmp/edit-trail-polish2.DD7nD5/repo` ran every exact
command in `.factory/claims.json`; all 16 passed independently. The same
clone then passed `npm test`, TypeScript, Rust formatting, Clippy with
warnings denied, and `cargo package --allow-dirty`.

The full suite passed 5 Rust unit tests, 3 CLI integration tests, 1 doctest,
9 Vitest tests, and 44 Playwright runs. Six mobile duplicates of host-only CLI
checks were intentionally skipped. The production bundle is 15.33 KB JS and
19.08 KB CSS before gzip.

The final live run passed 79 checks. It covered the demo/reset/exit path,
metadata, focus, legal shell, internal links, 404 status, native downloads,
privacy, offline reloads, mobile overflow, CSP, and all review-specific copy.
Playwright axe found zero WCAG 2 A/AA violations. Lighthouse scored 100 for
performance, accessibility, best practices, and SEO; LCP was 1.4 s, CLS 0.033,
and total blocking time 0 ms.

