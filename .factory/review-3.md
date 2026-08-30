# Adversarial first-read review 3: Edit Trail

**Verdict: FAIL**

Reviewed 30 August 2026 against the live deployment at
<https://edit-trail-finder.sociobot.in> and source commit
`bdc9db3f16f169c28602942340577f81cb267b49`.

There is one remaining finding. The main header loses three of its four
navigation destinations on a 390 px screen and offers no menu in their place.
Everything else checked in this round passed, including the one-click demo,
the complete claims registry, the CLI demo, routes, offline behavior, request
privacy, and the earlier repair trail.

## Cold first read

Fresh Chromium contexts opened the root route at 390 x 844 and 1440 x 900,
without scrolling.

- What it does: finds RAW photos by the editing steps recorded beside them.
- For whom: photographers using RAW editors who need to find a particular
  edit, such as masking, denoise, or crop.
- What to click first: **Try it with sample data**.

The exact first-screen text that supplies those answers is “Find RAW photos by
editing steps,” “For photographers using RAW editors who need to find masking,
denoise, crop, or other active edits,” and “Try it with sample data.” The
outcome is also stated directly: “Open three samples and see two matches.”
This first-read gate passes. At 390 px the last fact ends at 785 px; at desktop
it ends at 898 px, both within the tested viewports.

## Findings

### Medium

#### F-3-1 — The phone header hides Demo, CLI guide, and Privacy

- Exact location/quote: live root, demo, Privacy, Terms, and 404 headers at
  390 px. The only visible header control is **Install**. The controls
  **Try sample data**, **CLI guide**, and **Privacy** have `display: none` at
  `site/src/styles.css:166`; there is no navigation-menu control.
- Verification: fresh mobile Chromium reported `display: none` and no layout
  box for those three links. Desktop exposes all four links. The first-screen
  CTA still reaches the demo, but a first-time phone visitor has no header path
  to the CLI guide or Privacy policy and no way to discover the hidden choices.
- Why this fails: the required shared header is the navigation contract across
  routes. Removing most of it on the primary mobile viewport makes the shell
  inconsistent precisely where the review is intended to be adversarial.
- Concrete fix: provide an accessible 44 px **Open navigation menu** control
  at this breakpoint. It must expose the same four destinations, close with
  Escape, return focus to its trigger, and have visible focus. Add a 390 px
  Playwright test that opens it with the keyboard, verifies all four visible
  links, follows **Privacy**, and verifies focus on that route's `h1`.

## Copy audit

Counts use whitespace-delimited tokens containing a letter or number.
Hyphenated terms, paths, flags, and versions count as one word. No landing or
README sentence exceeds 22 words. No banned marketing adjective, vague
heading, metaphor heading, inconsistent user term, or non-result-naming action
was found. The current generated audit is reproducible with
`npm run copy:audit:check`.

### Landing-page sentences

| Words | Exact sentence |
| ---: | --- |
| 4 | Local sidecar search / v0.1 |
| 16 | For photographers using RAW editors who need to find masking, denoise, crop, or other active edits. |
| 7 | Open three samples and see two matches. |
| 3 | How it works |
| 18 | Edit Trail reads each supported sidecar, records active operations, and builds a small local index you can search. |
| 7 | Walk XMP, DOP, and PP3 files recursively. |
| 9 | Malformed sidecars are recorded as warnings, and scanning continues. |
| 11 | Map editor-specific names and enabled states into one visible editing step. |
| 15 | Require all operations or match any, then print paths, JSON, CSV, or a static report. |
| 3 | Browser sidecar demo |
| 6 | Paste XMP or choose local sidecars. |
| 9 | Parsing stays in this tab; files are never uploaded. |
| 11 | Files stay in browser memory and disappear when this tab closes. |
| 2 | CLI reference |
| 14 | Index an archive, find matching files, list operation names, or write an offline report. |
| 3 | Free command recipes |
| 9 | The pack includes 12 commands and a crop-and-denoise search. |
| 6 | It is free with the CLI. |
| 11 | The download is generated in your browser and contains commands only. |
| 3 | Install the CLI |
| 10 | Choose a native download, or build from source with Rust. |
| 11 | Find RAW photos by editing steps. v0.1.0 · Built by Param Factory. |

Dynamic rendered sentences are also all at or below 10 words: “3 sidecars
parsed locally,” “Choose editing steps, then search,” “2 of 3 sidecars match
all selected operations,” “No sidecar content yet,” “Paste a sidecar or choose
files,” “No matching trails,” “Try ‘Any selected’ or choose fewer operations,”
and the malformed-sidecar recovery messages. Headings name their sections;
buttons name their action or result, including **Try it with sample data**,
**Find matching files**, **Download audit recipes**, and **Copy command**.

### README sentences

| Words | Exact sentence |
| ---: | --- |
| 18 | Edit Trail is a local CLI for photographers who need to find RAW files by their editing steps. |
| 11 | It indexes XMP, DOP, and PP3 sidecars from common RAW editors. |
| 12 | It normalises active editing steps, then searches combinations such as `denoise + crop`. |
| 7 | It never reads or uploads image pixels. |
| 9 | Open the product site and sample demo at edit-trail-finder.sociobot.in. |
| 11 | The demo uses browser memory and does not upload selected sidecars. |
| 18 | Download the native executable for Linux x64, macOS arm64, macOS x64, or Windows x64 from the product site. |
| 11 | You can also build from source with a current Rust toolchain. |
| 10 | Try the installed CLI without pointing it at your archive. |
| 10 | It creates a temporary three-sidecar archive, index, and offline report. |
| 8 | Use `--output <DIRECTORY> --json` for a scripted run. |
| 7 | Index every supported sidecar under an archive. |
| 8 | Find files where both editing steps are active. |
| 9 | Export JSON, or export a spreadsheet without exposing pixels. |
| 5 | Build a self-contained offline report. |
| 17 | Exit codes are `0` for success, `1` for I/O or parse failures, and `2` for invalid usage. |
| 8 | A `find` query with no matches returns `3`. |
| 9 | darktable history entries, including enabled state and history boundaries |
| 10 | Adobe Camera Raw / Lightroom crop, denoise, masks, and development settings |
| 8 | generic XML elements with editing-step and enabled-state attributes |
| 6 | `.xmp`, `.XMP`, `.dop`, and `.pp3` sidecars |
| 13 | Malformed sidecars become warnings, so one file does not stop an archive scan. |
| 12 | The index contains paths, timestamps, editor families, active editing steps, and warnings. |
| 6 | It does not contain image bytes. |
| 10 | By default, the CLI writes `.edit-trail.json` in the current directory. |
| 7 | Requirements: Rust 1.85+, Node 20+, and npm. |
| 12 | `npm run build` creates the static site and release CLI in `dist/site`. |
| 8 | Run `cargo package --allow-dirty` to check package readiness. |
| 10 | The factory owns publishing credentials; this repository does not publish. |
| 6 | Deploy `dist/site` as the static site. |
| 11 | Its checked-in configuration defines security headers, download headers, and asset caching. |
| 5 | MIT © 2026 Sociobot (Param Factory). |
| 2 | See LICENSE. |

Terminology is consistent: **editing step** is the user-facing term,
**operation** is the stored editor field, **sidecar** is the supporting file,
and **normalise operation names** is the translation action.

## Demo, sandbox, and privacy

One click on **Try it with sample data** opened `/demo/`, immediately showed
the persistent “Demo — sample data, nothing is saved” banner, and rendered two
realistic result records: `night-market-1842.NEF` and `lantern-0917.ARW`.
Changing the uploaded sidecar and match rule, then activating **Reset demo**,
restored the three bundled sidecars, **All selected**, crop and denoise, and
the two-record result. **View install options** returned to `/#install` with
no demo banner.

The fresh-context request log contained only the product origin. Selecting a
sidecar made no request, and the demo used no localStorage, sessionStorage, or
IndexedDB namespace. A pre-existing `real:test-sentinel` value remained
unchanged. The service-worker offline claim passed in its dedicated context.

For the CLI sandbox, `edit-trail demo --output <fresh-directory> --json`
created a unique three-sidecar archive, JSON index, and self-contained HTML
report under that directory, reporting two matches. It did not use an archive
outside that sandbox.

## Claims

A fresh local clone at `/tmp/edit-trail-review3-clean` ran every exact command
from `.factory/claims.json`, in manifest order. All 16 passed:

| Claim ID | Result |
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
| default-index-path | PASS |
| open-folder | PASS |
| deployment-artifact | PASS |

The landing and README claim-like statements all map to one of those entries:
sample-result text to `sample-demo`; format support to
`browser-sidecar-formats` or `local-sidecar-search`; local/no-pixel behavior to
`browser-local`, `local-sidecar-search`, or `cli-private-read-only`; offline
to `offline-reload`; exports to `cli-outputs`; downloads to the two download
claims; recipes to `recipe-download`; licensing to `mit-license`; index path to
`default-index-path`; folder opening to `open-folder`; exit codes to
`cli-contract`; and build/deployment statements to `deployment-artifact`.
No unlisted landing-page or README claim was found.

`npm test` also passed from that clone: 6 Rust unit tests, 3 CLI integration
tests, 1 doctest, 10 Vitest tests, and 44 Playwright tests (6 intentional
mobile CLI skips).

## Earlier-finding verification

I read `review-1.md`, `review-2.md`, both polish reports, all verification
reports, and the previous handoff. The following status is based on the live
site and current source, not the reports' labels.

| Earlier finding | Current status |
| --- | --- |
| F-1-1, F-1-2, F-1-3 | Confirmed fixed: real demo route, immediate results, demo exit, and XMP/DOP/PP3 parsing. |
| F-1-4, F-1-5 | Confirmed fixed: first-screen facts fit; `/demo/` has its own title/h1 and Back restores focus. |
| F-1-6, F-1-7, F-1-8 | Confirmed fixed: per-route sharing metadata, shared shell, and response-header `frame-ancestors 'none'`. |
| F-1-9 through F-1-16 | Confirmed fixed: README and controls are concise, headings are specific, and terminology is consistent. |
| F-1-17 through F-1-31 | Confirmed fixed: the prior unregistered/unsupported claims are removed or registered and passing; four native downloads are available. |
| F-2-1 | Confirmed fixed: Reset demo restores the complete bundled state. |
| F-2-2 / F-1-19 | Confirmed fixed: no unproved 247-result count appears. |
| F-2-3 / F-1-23 | Confirmed fixed: default-index behavior is registered and tested. |
| F-2-4 / F-1-25 | Confirmed fixed: the folder-opening recipe is registered and tested with a fake opener. |
| F-2-5 through F-2-11 | Confirmed fixed: recipe, index-schema, artifact, copy, heading, JSON, and copy-audit repairs are present and tested. |

No earlier finding is reopened. F-3-1 is a new mobile regression/nonconformance
not covered by those earlier checks.

## Structure and presentation checks

The live root, demo, Privacy, Terms, and designed 404 each returned the
expected status, one `h1`, one `main`, a route-specific title and description,
canonical URL, Open Graph/Twitter metadata, favicon, and touch icon. All
discovered internal links and four native download links returned 200; an
unknown route returned the designed 404 with HTTP 404. Desktop and mobile
routes had no horizontal overflow. The desktop visual system is distinct and
matches the documented sidecar-night-market direction rather than a generic
SaaS template.

The route checks do not clear F-3-1: a navigation can exist in the DOM yet be
unavailable to the phone visitor when it is `display: none`.

## Missed leverage

No extra AI, sync, or import feature is required by the brief. The local CLI
already imports the three stated sidecar families and exports JSON, CSV, and a
self-contained report. Adding AI would not help the deterministic edit-step
search and would weaken the product's local privacy position.

## What would make this perfect

Add and test the accessible mobile navigation menu described in F-3-1. With
that repair, no finding from this review remains.
