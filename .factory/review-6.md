# Review 6 — independent first-read QA

**Verdict: PASS.** There are zero findings of any severity.

I reviewed the deployed product at https://edit-trail-finder.sociobot.in on
1 September 2026 in fresh 1440 × 900 and 390 × 844 browser contexts, and ran
the clean-clone verification below. This was a read-only product review.

## Cold first read

Before scrolling, the page says **Find RAW photos by editing steps**. It is for
photographers using RAW editors who need to find masking, denoise, crop, or
other active edits. The unambiguous first action is **Try it with sample data**;
the adjacent text says **Opens three samples and shows two matches.**

This answers what it does, who it is for, and what to click at both viewport
sizes. The visible facts are **Sidecars stay on your computer**, **Works offline
after the first visit**, and **Free to use · MIT licensed**. No first-read
blocker was found.

## Copy audit

I read every landing-page and README sentence and compared it with the
generated, checked-in exhaustive inventory in .factory/copy-audit.md. It is
current (npm run copy:audit:check passed), has every exact sentence and word
count, and reports a maximum of 18 words. No sentence exceeds 22 words.

No sentence was flagged for jargon that prevents the stated audience from
understanding it, marketing adjectives, inconsistent terminology, metaphor or
mood heading, or a non-result-naming action. The terms are consistent:
**editing step** for the visible edit, **operation** for stored data, and
**sidecar** for the supplemental editor file. The buttons name their result:
**Try it with sample data**, **Find matching files**, **Download audit
commands**, **Download for [platform]**, **Copy command**, and **Reset demo**.
All headings name their section.

## Demo, privacy, and sandbox

- One click opens /demo/ with two visible matches from three realistic bundled
  sidecars.
- The persistent banner says **Demo — sample data, nothing is saved**.
- Reset restores crop + denoise, all-match, an empty picker, and two results.
- A pre-seeded real-storage sentinel remains intact, and the whole flow made no
  third-party request.
- ?demo=1 enters the demo directly; exit removes the banner.
- Empty/no-match states provide the right next action.
- In a dedicated context, Demo, Privacy, and Terms reload offline after first
  visit.
- The CLI demo claim runs in a fresh temporary directory; it creates the
  shipped three-sidecar/two-match sample without a real archive.

## Claims

All 18 exact commands in .factory/claims.json passed from clean clone
/tmp/edit-trail-review6-clean.rFs4CY/repo:

| Claim | Result |
| --- | --- |
| sample-demo | PASS |
| linux-download | PASS |
| cross-platform-downloads | PASS |
| recipe-download | PASS |
| browser-local | PASS |
| no-runtime-third-parties | PASS |
| browser-sidecar-formats | PASS |
| offline-reload | PASS |
| local-sidecar-search | PASS |
| cli-private-read-only | PASS |
| cli-outputs | PASS |
| cli-contract | PASS |
| mit-license | PASS |
| cli-demo-recording | PASS |
| local-only-boundary | PASS |
| default-index-path | PASS |
| open-folder | PASS |
| deployment-artifact | PASS |

The first 17 used their listed npm run build:site plus Playwright grep command;
deployment-artifact used its listed Vitest command. Every claim-like landing
and README statement maps to one or more observable checks. No unlisted claim
was found.

## Earlier findings

I read all review, polish, and handoff records. Each prior finding was checked
again on the live site and in current source/tests; all are fixed, not merely
marked fixed.

| Earlier findings | Confirmation |
| --- | --- |
| F-1-1 | Confirmed fixed in live behavior and current source/tests. |
| F-1-2 | Confirmed fixed in live behavior and current source/tests. |
| F-1-3 | Confirmed fixed in live behavior and current source/tests. |
| F-1-4 | Confirmed fixed in live behavior and current source/tests. |
| F-1-5 | Confirmed fixed in live behavior and current source/tests. |
| F-1-6 | Confirmed fixed in live behavior and current source/tests. |
| F-1-7 | Confirmed fixed in live behavior and current source/tests. |
| F-1-8 | Confirmed fixed in live behavior and current source/tests. |
| F-1-9 | Confirmed fixed in live copy and current copy audit. |
| F-1-10 | Confirmed fixed in live copy and current copy audit. |
| F-1-11 | Confirmed fixed in live copy and current copy audit. |
| F-1-12 | Confirmed fixed in live copy and current copy audit. |
| F-1-13 | Confirmed fixed in live copy and current copy audit. |
| F-1-14 | Confirmed fixed in live copy and current copy audit. |
| F-1-15 | Confirmed fixed in live copy and current copy audit. |
| F-1-16 | Confirmed fixed in live copy and current copy audit. |
| F-1-17 | Confirmed removed or registered; applicable claim test passes. |
| F-1-18 | Confirmed removed or registered; applicable claim test passes. |
| F-1-19 | Confirmed removed or registered; applicable claim test passes. |
| F-1-20 | Confirmed removed or registered; applicable claim test passes. |
| F-1-21 | Confirmed removed or registered; applicable claim test passes. |
| F-1-22 | Confirmed removed or registered; applicable claim test passes. |
| F-1-23 | Confirmed removed or registered; applicable claim test passes. |
| F-1-24 | Confirmed removed or registered; applicable claim test passes. |
| F-1-25 | Confirmed removed or registered; applicable claim test passes. |
| F-1-26 | Confirmed removed or registered; applicable claim test passes. |
| F-1-27 | Confirmed removed or registered; applicable claim test passes. |
| F-1-28 | Confirmed removed or registered; applicable claim test passes. |
| F-1-29 | Confirmed removed or registered; applicable claim test passes. |
| F-1-30 | Confirmed removed or registered; applicable claim test passes. |
| F-1-31 | Confirmed removed or registered; applicable claim test passes. |
| F-2-1 | Confirmed fixed in live behavior and current source/tests. |
| F-2-2 | Confirmed fixed in live behavior and current source/tests. |
| F-2-3 | Confirmed fixed in live behavior and current source/tests. |
| F-2-4 | Confirmed fixed in live behavior and current source/tests. |
| F-2-5 | Confirmed fixed in live behavior and current source/tests. |
| F-2-6 | Confirmed fixed in live behavior and current source/tests. |
| F-2-7 | Confirmed fixed in live behavior and current source/tests. |
| F-2-8 | Confirmed fixed in live behavior and current source/tests. |
| F-2-9 | Confirmed fixed in live behavior and current source/tests. |
| F-2-10 | Confirmed fixed in live behavior and current source/tests. |
| F-2-11 | Confirmed fixed in live behavior and current source/tests. |
| F-3-1 | Confirmed fixed in live mobile keyboard/focus checks. |
| F-4-1 | Confirmed fixed in live copy, layout, and source/tests. |
| F-4-2 | Confirmed fixed in live copy, layout, and source/tests. |
| F-4-3 | Confirmed fixed in live copy, layout, and source/tests. |
| F-4-4 | Confirmed fixed in live copy, layout, and source/tests. |
| F-4-5 | Confirmed fixed in live copy, layout, and source/tests. |
| F-4-6 | Confirmed fixed in live copy, layout, and source/tests. |
| F-4-7 | Confirmed fixed in live copy, layout, and source/tests. |
| F-4-8 | Confirmed fixed in live copy, layout, and source/tests. |
| F-4-9 | Confirmed fixed in live copy, layout, and source/tests. |
| F-4-10 | Confirmed fixed in live copy, layout, and source/tests. |
| F-4-11 | Confirmed fixed in live copy, layout, and source/tests. |
| F-4-12 | Confirmed fixed in live copy, layout, and source/tests. |
| F-4-13 | Confirmed fixed in live copy, layout, and source/tests. |
| F-4-14 | Confirmed fixed in live copy, layout, and source/tests. |
| F-4-15 | Confirmed fixed in live copy, layout, and source/tests. |
| F-4-16 | Confirmed fixed in live copy, layout, and source/tests. |
| F-4-17 | Confirmed fixed in live copy, layout, and source/tests. |
| F-4-18 | Confirmed fixed in live copy, layout, and source/tests. |
| F-5-1 | Confirmed fixed in the live demo empty state. |

## Structure, accessibility, and identity

The independent live audit passed **117 checks**: zero console errors, zero
third-party requests, and zero Axe WCAG 2 A/AA violations. It checked links,
metadata, canonical/OG/favicon, designed 404, keyboard/focus/back behavior,
mobile overflow/menu, offline reload, download signatures, and CSP.

The sidecar-night-market art, warm paper/neon palette, clipped ticket panels,
mono display type, and terminal/index rhythm match the design thesis and are
distinct from a generic SaaS template.

## Missed leverage

No obvious implied feature is absent. The brief calls for local sidecar
indexing, operation-combination search, source-folder opening, and reports.
The product has supported-sidecar input and JSON, CSV, and offline HTML export.
AI would be decorative here and is not warranted; no provider key is embedded.

## What would make this perfect

Nothing actionable remains. Preserve the claim registry and clean-clone/live
checks when changing the product.

## Verification

The fresh clone passed npm test, npm run build, cargo fmt --check, strict
Clippy, TypeScript no-emit, and cargo package --allow-dirty. This includes
6 Rust unit tests, 3 CLI integration tests, 1 doctest, 12 Vitest tests, and
60 Playwright project runs.
