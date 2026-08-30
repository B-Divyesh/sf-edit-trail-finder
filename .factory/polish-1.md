# Polish round 1 — all review findings resolved

Base reviewed: `63d20458787e0b11760f69c76219009d16350ade` and adversarial
report `89d97adac063da15e74dea76a56aaa2e3bf2c073`. Live check:
<https://edit-trail-finder.sociobot.in> (30 August 2026).

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Hero CTA now opens `/demo/`, automatically searches crop + denoise, and renders both result cards. | `@claim:sample-demo`; live `live-check.json` |
| F-1-2 | Replaced misleading exit with **View install options** to `/#install`; home has no demo banner. | `demo query entry redirects…` |
| F-1-3 | Added conservative PP3 parser, XMP/DOP/PP3 browser sample, and upload coverage. | `@claim:browser-sidecar-formats` |
| F-1-4 | Tightened hero type, padding, and fact spacing; all three facts fit 1440×900 and 390×844. | `first-screen facts stay…`; live `factBottom: 785.4` |
| F-1-5 | Added real `/demo/` page with demo title and h1; Back restores demo-trigger focus. | `browser Back returns focus…` |
| F-1-6 | Added per-route description, canonical, OG/Twitter image metadata, apple icon, and share crop. | `all routes provide…` |
| F-1-7 | Standardised four-link header and complete footer across home, demo, legal, and 404. | `all routes provide…` |
| F-1-8 | Added response-header CSP `frame-ancestors 'none'`. | `response-policy.test.ts`; live header check |
| F-1-9 | Split and simplified the README introduction. | `.factory/copy-audit.md` |
| F-1-10 | Split README exit-code sentence. | `.factory/copy-audit.md`; `@claim:cli-contract` |
| F-1-11 | Rewrote stored-data copy to plain separate sentences. | `.factory/copy-audit.md`; `@claim:local-sidecar-search` |
| F-1-12 | Rewrote deployment copy without bundled jargon. | `.factory/copy-audit.md` |
| F-1-13 | Renamed heading to **CLI behavior on large archives**. | source and live check |
| F-1-14 | Renamed heading to **Example search recipes**. | source and live check |
| F-1-15 | Standardised user term to editing step and technical copy to **Normalise operation names**. | `.factory/copy-audit.md` |
| F-1-16 | Renamed ambiguous controls to **Try sample data**, **View install options**, and **Copy command**. | keyboard/browser suite |
| F-1-17 | Registered and tested the MIT statement. | `@claim:mit-license` |
| F-1-18 | Removed unproven 10,000-sidecar terminal count. | landing-copy audit |
| F-1-19 | Removed unproven 247-match terminal count. | landing-copy audit |
| F-1-20 | Removed unproven 10,000-report count. | landing-copy audit |
| F-1-21 | Removed unproven 89-result pipeline count. | landing-copy audit |
| F-1-22 | Removed unsupported single-binary/runtime-service marketing sentence. | README audit |
| F-1-23 | Removed undocumented default-index promise. | README audit |
| F-1-24 | Removed undocumented synonym/vocabulary promise. | README audit |
| F-1-25 | Removed undocumented folder-opening promise. | README audit |
| F-1-26 | Removed unsupported index-override/help-completeness promises. | README audit |
| F-1-27 | Removed untested unknown-field promise. | README audit |
| F-1-28 | Removed untested EXIF/caption exclusion list; retained tested no-pixel statement. | `@claim:local-sidecar-search` |
| F-1-29 | Removed exact build-output-location promise. | README audit |
| F-1-30 | Replaced broad runtime-dependency prose with registered browser request tests. | `@claim:no-runtime-third-parties` |
| F-1-31 | Shipped and verified Linux x64, macOS arm64/x64, and Windows x64 binaries; added native CI. | `@claim:cross-platform-downloads`; `.github/workflows/native-release.yml` |

Additional final accessibility repair: changed the nested `aside` to a normal
supporting `div` and made demo result records h2 headings. Live axe returned
zero violations on `/`, `/demo/`, `/privacy/`, `/terms/`, and the designed 404.

Evidence paths: `/tmp/edit-trail-live-evidence/live-check.json`,
`/tmp/edit-trail-live-evidence/live-axe.json`, and
`/tmp/edit-trail-live-evidence/final-demo-mobile.png`.
