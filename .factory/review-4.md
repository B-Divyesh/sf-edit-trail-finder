# Adversarial first-read review 4: Edit Trail

**Verdict: FAIL**

Reviewed 1 September 2026 against the live deployment at
<https://edit-trail-finder.sociobot.in> and source commit
`0be15035f1ae6de6598e4aaca253796af9f50d46`.

The live browser demo, CLI demo, registered claims, routes, privacy checks,
accessibility checks, and build gates pass. The product still fails because
the landing page does not demonstrate the shipped CLI with the required
terminal recording. It also has 17 major or minor copy, claim-registration,
structure, and demo-documentation findings. PASS requires zero findings.

## Cold first read

Fresh Chromium contexts opened the root route at 390 × 844 and 1440 × 900.
The observations below were recorded before scrolling.

- What it does: finds RAW photos by the editing steps stored in sidecar files.
- For whom: photographers who use RAW editors and need to find edits such as
  masking, denoise, or crop.
- What to click first: **Try it with sample data**.

The exact first-screen text is “Find RAW photos by editing steps,” “For
photographers using RAW editors who need to find masking, denoise, crop, or
other active edits,” and “Try it with sample data.” The first-read clarity gate
therefore passes. The three fact lines also fit without scrolling at both
sizes. Their wording still has the findings in F-4-3 and F-4-4.

## Findings

### Blocking

#### F-4-1 — The landing page demonstrates a browser port, not the shipped CLI

- Exact location/quote: the primary action **Try it with sample data** opens
  `/demo/`, headed “Search sample editing steps.” The later CLI section contains
  static `<pre>` examples, not a terminal recording of `edit-trail demo`.
- Verification: the browser demo immediately shows two realistic matches and
  resets correctly. The downloaded Linux binary also ran `edit-trail demo` in
  a fresh temporary directory and reported three sidecars and two matches.
  No self-hosted asciinema, SVG recording, or equivalent playback of that real
  command exists in the landing source or live page.
- Why this fails: this repository ships a CLI. The current one-click path
  proves a browser reimplementation, so a first-time visitor does not see the
  actual artifact's invocation, output, or generated report before installing
  it. The CLI-specific demo contract requires both the demo command and a
  landing-page recording of the real binary.
- Concrete fix: record the shipped binary running `edit-trail demo` against the
  bundled sample. Add a captioned, self-hosted SVG or asciinema recording to
  the landing preview, include a text transcript, and test that it loads with
  no external request and shows the same three-sidecar/two-match result.

### Major

#### F-4-2 — The landing skeleton omits the required limitations/privacy section

- Exact location: the page moves from **CLI commands for sidecar searches** to
  **Download 12 archive audit recipes** and **Search your own sidecars**. There
  is no section named “What Edit Trail does not do” or equivalent.
- Existing fragments: “0 pixels indexed” and “Parsing stays in this tab; files
  are never uploaded.”
- Why this fails: the brief excludes RAW rendering, facial recognition, hosted
  libraries, and AI editing. A new visitor must infer those boundaries from
  scattered fragments and can mistake the tool for a photo manager or editor.
  The required site skeleton calls for this section on the landing page.
- Concrete fix: add a section after the product preview titled **What Edit
  Trail does not do**. Suggested copy: “Edit Trail reads sidecar metadata only.
  It does not render, organise, upload, or edit photos.” Register and test any
  new privacy claims.

#### F-4-3 — The first screen does not state the price in plain words

- Exact quote/location: first-screen fact, “MIT licensed.”
- Why this fails: “MIT” is licence jargon, not a price. A normal photographer
  cannot confirm from this fact whether the tool costs money, although the
  mandatory first-screen facts must state privacy, offline use, and price.
- Concrete fix: use **Free to use · MIT licensed** and expand
  `@claim:mit-license` to assert the free wording and the shipped licence.

#### F-4-4 — The first-screen privacy fact is a jargon fragment

- Exact quote/location: first-screen fact, “Local sidecar processing.”
- Why this fails: it has no verb and does not tell a non-technical visitor
  whether files leave the device.
- Concrete fix: use **Sidecars stay on your computer** and keep the existing
  request-log and CLI privacy tests tied to that sentence.

#### F-4-5 — “Three commands” is an unlisted and inaccurate quantitative claim

- Exact quote/location: how-it-works heading, “Index editing steps in three
  commands.”
- Verification: the three items below it are conceptual stages. Normalising is
  part of indexing, not a separate user command. No `.factory/claims.json`
  entry asserts a three-command workflow.
- Why this fails: a visitor can reasonably expect three commands to follow,
  but the section does not provide them. The number is also outside the claims
  registry.
- Concrete fix: change the heading to **How Edit Trail searches sidecars**. If
  a three-command workflow is intended, show the three commands and register a
  test that executes them.

### Minor

#### F-4-6 — “Large archives” is an unlisted scale claim

- Exact quote/location: CLI support heading, “CLI behavior on large archives.”
- Verification: `local-sidecar-search` uses six sidecars. No registered claim
  defines or measures “large.”
- Why this fails: the heading implies tested scale without a measurable
  boundary.
- Concrete fix: rename it **CLI behavior and outputs**, or register a specific
  archive size and runtime with a deterministic performance test.

#### F-4-7 — The sample outcome is separated from its action on a phone

- Exact location: at 390 px, **Download for Linux** and **Copy install command**
  sit between **Try it with sample data** and “Open three samples and see two
  matches.”
- Why this fails: the outcome sentence can appear to describe the wrong action.
  The first-screen contract requires the result next to the primary action.
- Concrete fix: place “Opens three samples and shows two matches” directly
  under the sample-data action, before the install controls.

#### F-4-8 — “Recursively” is avoidable implementation jargon

- Exact quote/location: first how-it-works step, “Walk XMP, DOP, and PP3 files
  recursively.”
- Why this fails: photographers should not need a programming term to learn
  that subfolders are included.
- Concrete fix: “Scan XMP, DOP, and PP3 sidecars in every subfolder.”

#### F-4-9 — “Parsing” is avoidable implementation jargon

- Exact quote/location: browser-demo introduction, “Parsing stays in this tab;
  files are never uploaded.”
- Why this fails: the useful fact is where the files stay, not the parser's
  implementation.
- Concrete fix: “Your sidecars stay in this tab and are never uploaded.”

#### F-4-10 — “Query combinations” does not name the section out of context

- Exact quote/location: third how-it-works heading, “Query combinations.”
- Why this fails: a headings list does not say what is combined or what result
  the visitor gets.
- Concrete fix: **Find files with selected edits**.

#### F-4-11 — “Free command recipes” is a metaphor heading

- Exact quote/location: section label, “Free command recipes.”
- Why this fails: “recipes” does not name the downloadable artifact directly.
- Concrete fix: **Free example commands**.

#### F-4-12 — “Archive audit recipes” is a metaphor heading

- Exact quote/location: section heading, “Download 12 archive audit recipes.”
- Why this fails: the visitor downloads commands, not recipes.
- Concrete fix: **Download 12 archive audit commands**.

#### F-4-13 — The recipe download button uses the same metaphor

- Exact quote/location: button, “Download audit recipes.”
- Why this fails: the label should name the result in the same concrete term
  used by the section.
- Concrete fix: **Download audit commands**.

#### F-4-14 — “Example search recipes” is a metaphor heading

- Exact quote/location: heading above the two copyable examples, “Example
  search recipes.”
- Why this fails: the section contains commands.
- Concrete fix: **Example search commands**.

#### F-4-15 — “Automate” does not name the tab result

- Exact quote/location: fourth CLI tab, “Automate.”
- Why this fails: opening the tab shows a JSON pipeline that counts results;
  “Automate” does not identify that output.
- Concrete fix: **Count JSON results**.

#### F-4-16 — Four download actions omit the verb

- Exact quote/location: install links, “Linux x64,” “macOS Apple silicon,”
  “macOS Intel,” and “Windows x64.”
- Why this fails: these controls look like platform choices but do not say
  that activation downloads an executable.
- Concrete fix: use **Download for Linux x64**, **Download for macOS Apple
  silicon**, **Download for macOS Intel**, and **Download for Windows x64**.

#### F-4-17 — The README does not link directly to the demo route

- Exact quote/location: README, “Open the product site and sample demo at
  edit-trail-finder.sociobot.in.” The link target is `/`, not `/demo/`.
- Why this fails: the documented demo URL should enter the isolated sample
  directly. The current link adds a landing-page step and does not match
  `.factory/demo.md` or the verifier entry point.
- Concrete fix: split the sentence and link **Open the sample demo** directly
  to `https://edit-trail-finder.sociobot.in/demo/`.

#### F-4-18 — “Current Rust toolchain” is less precise than the documented requirement

- Exact quote/location: README Install, “You can also build from source with a
  current Rust toolchain.”
- Why this fails: “current” is time-dependent, while the README later gives an
  exact minimum version.
- Concrete fix: “You can also build from source with Rust 1.85 or newer.”

## Copy audit

Counts use whitespace-delimited tokens containing a letter or number.
Hyphenated terms, paths, flags, and versions count once. No sentence exceeds
22 words and no banned marketing word appears. The jargon, metaphor,
inconsistent-action, and claim flags are listed in the final column.

### Landing-page sentences

| Words | Exact sentence | Flag |
| ---: | --- | --- |
| 4 | Local sidecar search / v0.1 | F-4-4 applies to the related first-screen fact. |
| 16 | For photographers using RAW editors who need to find masking, denoise, crop, or other active edits. | — |
| 7 | Open three samples and see two matches. | F-4-7 placement. |
| 3 | How it works | — |
| 18 | Edit Trail reads each supported sidecar, records active operations, and builds a small local index you can search. | — |
| 7 | Walk XMP, DOP, and PP3 files recursively. | F-4-8. |
| 9 | Malformed sidecars are recorded as warnings, and scanning continues. | — |
| 11 | Map editor-specific names and enabled states into one visible editing step. | — |
| 15 | Require all operations or match any, then print paths, JSON, CSV, or a static report. | — |
| 3 | Browser sidecar demo | — |
| 6 | Paste XMP or choose local sidecars. | — |
| 9 | Parsing stays in this tab; files are never uploaded. | F-4-9. |
| 11 | Files stay in browser memory and disappear when this tab closes. | — |
| 2 | CLI reference | — |
| 14 | Index an archive, find matching files, list operation names, or write an offline report. | — |
| 3 | Free command recipes | F-4-11. |
| 9 | The pack includes 12 commands and a crop-and-denoise search. | — |
| 6 | It is free with the CLI. | — |
| 11 | The download is generated in your browser and contains commands only. | — |
| 3 | Install the CLI | — |
| 10 | Choose a native download, or build from source with Rust. | — |
| 11 | Find RAW photos by editing steps. v0.1.0 · Built by Param Factory. | — |
| 9 | Offline mode — the demo and docs still work locally. | — |
| 6 | Demo — sample data, nothing is saved. | — |

### Dynamic landing/demo sentences

| Words | Exact rendered example | Flag |
| ---: | --- | --- |
| 4 | 3 sidecars parsed locally. | — |
| 5 | Choose editing steps, then search. | — |
| 8 | 2 of 3 sidecars match all selected operations. | — |
| 4 | No sidecar content yet. | — |
| 6 | Paste a sidecar or choose files. | — |
| 3 | No matching trails. | — |
| 7 | Try “Any selected” or choose fewer operations. | — |
| 4 | Could not parse [name]. | — |
| 10 | Check that its XML, DOP, or PP3 data is complete. | — |
| 7 | This DOP does not identify DxO PhotoLab. | — |
| 6 | No DxO correction states were found. | — |
| 2 | Command copied. | — |
| 3 | Could not copy. | — |
| 4 | Select the command manually. | — |
| 6 | This sidecar could not be parsed. | — |
| 5 | Three realistic sidecars are ready. | — |
| 8 | Crop and denoise already show two matching photos. | — |
| 7 | Offline mode — the demo still works locally. | — |

### Landing headings and controls

| Type | Exact text | Result |
| --- | --- | --- |
| Headings | Find RAW photos by editing steps; How it works; Scan sidecars; Normalise operation names; Browser sidecar demo; Search sample editing steps; CLI reference; CLI commands for sidecar searches; Search your own sidecars | Clear. |
| Heading | Index editing steps in three commands | F-4-5. |
| Heading | Query combinations | F-4-10. |
| Heading | CLI behavior on large archives | F-4-6. |
| Heading | Free command recipes | F-4-11. |
| Heading | Download 12 archive audit recipes | F-4-12. |
| Heading | Example search recipes | F-4-14. |
| Controls | Open navigation menu; Try sample data; CLI guide; Privacy; Install; Try it with sample data; Download for Linux; Copy install command; Reset demo; View install options; Choose sidecars; Reset sample; All selected; Any selected; Find matching files; Copy command | Clear or valid navigation labels. |
| Tab | Automate | F-4-15. |
| Button | Download audit recipes | F-4-13. |
| Download links | Linux x64; macOS Apple silicon; macOS Intel; Windows x64 | F-4-16. |

### README sentences

| Words | Exact sentence | Flag |
| ---: | --- | --- |
| 18 | Edit Trail is a local CLI for photographers who need to find RAW files by their editing steps. | — |
| 11 | It indexes XMP, DOP, and PP3 sidecars from common RAW editors. | — |
| 12 | It normalises active editing steps, then searches combinations such as denoise + crop. | — |
| 7 | It never reads or uploads image pixels. | — |
| 9 | Open the product site and sample demo at edit-trail-finder.sociobot.in. | F-4-17 link target. |
| 11 | The demo uses browser memory and does not upload selected sidecars. | — |
| 18 | Download the native executable for Linux x64, macOS arm64, macOS x64, or Windows x64 from the product site. | — |
| 11 | You can also build from source with a current Rust toolchain. | F-4-18. |
| 10 | Try the installed CLI without pointing it at your archive. | — |
| 10 | It creates a temporary three-sidecar archive, index, and offline report. | — |
| 8 | Use `--output <DIRECTORY> --json` for a scripted run. | — |
| 7 | Index every supported sidecar under an archive. | — |
| 8 | Find files where both editing steps are active. | — |
| 9 | Export JSON, or export a spreadsheet without exposing pixels. | — |
| 5 | Build a self-contained offline report. | — |
| 17 | Exit codes are `0` for success, `1` for I/O or parse failures, and `2` for invalid usage. | — |
| 8 | A `find` query with no matches returns `3`. | — |
| 9 | darktable history entries, including enabled state and history boundaries | — |
| 10 | Adobe Camera Raw / Lightroom crop, denoise, masks, and development settings | — |
| 8 | generic XML elements with editing-step and enabled-state attributes | — |
| 6 | `.xmp`, `.XMP`, `.dop`, and `.pp3` sidecars | — |
| 13 | Malformed sidecars become warnings, so one file does not stop an archive scan. | — |
| 12 | The index contains paths, timestamps, editor families, active editing steps, and warnings. | — |
| 6 | It does not contain image bytes. | — |
| 10 | By default, the CLI writes `.edit-trail.json` in the current directory. | — |
| 7 | Requirements: Rust 1.85+, Node 20+, and npm. | — |
| 12 | `npm run build` creates the static site and release CLI in `dist/site`. | — |
| 8 | Run `cargo package --allow-dirty` to check package readiness. | — |
| 10 | The factory owns publishing credentials; this repository does not publish. | — |
| 6 | Deploy `dist/site` as the static site. | — |
| 11 | Its checked-in configuration defines security headers, download headers, and asset caching. | — |
| 5 | MIT © 2026 Sociobot (Param Factory). | — |
| 2 | See LICENSE. | — |

README headings **Edit Trail**, **Install**, **Usage**, **Schema support and
privacy**, **Develop and verify**, **Deployment**, and **License** identify
their sections. The terminology table remains: **editing step** for the user
concept, **operation** for the stored editor field, **sidecar** for the
supporting file, and **normalise operation names** for translation.

## Demo and sandbox verification

- One click on **Try it with sample data** opened `/demo/`, showed the
  persistent “Demo — sample data, nothing is saved” banner, and immediately
  rendered `night-market-1842.NEF` and `lantern-0917.ARW` as two of three
  matches.
- After replacing the sample, changing to **Any selected**, and searching,
  **Reset demo** restored the bundled input, **All selected**, crop and
  denoise, an empty file picker, and the original two records.
- A pre-existing `real:test-sentinel` local-storage value stayed unchanged.
  Session storage and IndexedDB remained empty. The complete live request log
  contained no third-party request.
- **View install options** reached `/#install` and removed the demo banner.
- The downloaded live Linux binary ran `edit-trail demo --output <new temp
  directory> --json`. It created three sidecars, an index, and a self-contained
  report, and reported two matches.
- F-4-1 remains because no landing-page recording shows that CLI flow.

## Claims verification

A clean local clone at `/tmp/edit-trail-review4-clean.nYs35k/repo` ran every
exact `test` command from `.factory/claims.json` independently, in manifest
order. Every command passed. Each `@claim:<id>` tag occurs exactly once.

| Claim ID | Result | Observable check |
| --- | --- | --- |
| `sample-demo` | PASS | One click; banner; two of three records; complete reset. |
| `linux-download` | PASS | Attachment name, ELF signature, and size. |
| `cross-platform-downloads` | PASS | Linux, two macOS, and Windows native signatures. |
| `recipe-download` | PASS | 12 commands and required command families. |
| `browser-local` | PASS | Local upload parsed with no request or browser-data write. |
| `no-runtime-third-parties` | PASS | Root-page requests stayed same-origin. |
| `browser-sidecar-formats` | PASS | XMP, representative DxO DOP, and PP3 parsed. |
| `offline-reload` | PASS | Demo, Privacy, and Terms reloaded in a dedicated offline context. |
| `local-sidecar-search` | PASS | Formats, fields, warnings, active states, and no pixel marker. |
| `cli-private-read-only` | PASS | No source mutation and no connect, DNS, or send call. |
| `cli-outputs` | PASS | JSON, CSV, and self-contained HTML report. |
| `cli-contract` | PASS | Exit codes 0, 1, 2, and 3. |
| `mit-license` | PASS | First-screen MIT text and shipped licence. |
| `default-index-path` | PASS | Default creation, search, deletion, and failure after deletion. |
| `open-folder` | PASS | Fake opener received the exact source folder. |
| `deployment-artifact` | PASS | Static site, CLI, headers, download policy, and caching. |

No registered claim is untested or failing. F-4-5 and F-4-6 are the two
claim-like live headings without adequate registry entries.

## Earlier-finding verification

Every earlier review and polish report was read. Each finding below was
checked against both current source and the byte-matching live build, rather
than accepted from its repair report.

| Earlier ID | Current result |
| --- | --- |
| F-1-1 | Confirmed fixed: one click shows two sample results. |
| F-1-2 | Confirmed fixed: **View install options** exits demo mode. |
| F-1-3 | Confirmed fixed: browser tests parse XMP, DOP, and PP3. |
| F-1-4 | Confirmed fixed: all three facts fit 390×844 and 1440×900. |
| F-1-5 | Confirmed fixed: `/demo/` has its own title/h1; Back restores focus. |
| F-1-6 | Confirmed fixed: every route has sharing metadata and touch icons. |
| F-1-7 | Confirmed fixed: all routes share the header and complete footer. |
| F-1-8 | Confirmed fixed: the live response CSP has `frame-ancestors 'none'`. |
| F-1-9 | Confirmed fixed: the README introduction is split and under 22 words. |
| F-1-10 | Confirmed fixed: exit-code copy is split and every code is tested. |
| F-1-11 | Confirmed fixed: stored and excluded data use separate sentences. |
| F-1-12 | Confirmed fixed: deployment copy is split and registered. |
| F-1-13 | Confirmed fixed: “Made for actual archives” is absent. F-4-6 is a new scale-claim issue in its replacement. |
| F-1-14 | Confirmed fixed: “Two useful recipes” is absent. F-4-14 separately checks the remaining metaphor. |
| F-1-15 | Confirmed fixed: user and stored-field terminology is defined. |
| F-1-16 | Confirmed fixed: the formerly ambiguous copy controls are renamed. |
| F-1-17 | Confirmed fixed: MIT licensing is registered and tested. |
| F-1-18 | Confirmed fixed: the unproved 10,000-sidecar display is absent. |
| F-1-19 | Confirmed fixed: the unproved 247 result is absent. |
| F-1-20 | Confirmed fixed: the unproved 10,000-report result is absent. |
| F-1-21 | Confirmed fixed: the unproved 89 result is absent. |
| F-1-22 | Confirmed fixed: the one-binary/runtime-service sentence is absent. |
| F-1-23 | Confirmed fixed: default-index behavior is registered and passes. |
| F-1-24 | Confirmed fixed: the broad synonym promise is absent; tested aliases remain. |
| F-1-25 | Confirmed fixed: folder opening is registered and passes with a fake opener. |
| F-1-26 | Confirmed fixed: exhaustive help and index-override promises are absent. |
| F-1-27 | Confirmed fixed: the unknown-field promise is absent. |
| F-1-28 | Confirmed fixed: copy is limited to the tested no-pixel behavior. |
| F-1-29 | Confirmed fixed: build outputs are registered and pass. |
| F-1-30 | Confirmed fixed: runtime privacy is registered and passes request logging. |
| F-1-31 | Confirmed fixed: four native platform downloads are present and signature-checked. |
| F-2-1 | Confirmed fixed: reset restores every tested demo control and result. |
| F-2-2 | Confirmed fixed: the surviving 247 display was removed. |
| F-2-3 | Confirmed fixed: default-index creation and deletion are tested. |
| F-2-4 | Confirmed fixed: the documented `--open` command is tested. |
| F-2-5 | Confirmed fixed: all 12 downloaded commands and named examples are asserted. |
| F-2-6 | Confirmed fixed: index paths, timestamps, editors, operations, and warnings are asserted. |
| F-2-7 | Confirmed fixed: build and deployment artifacts are registered. |
| F-2-8 | Confirmed fixed: the “roadblocks” metaphor is absent. |
| F-2-9 | Confirmed fixed: the CLI section heading identifies sidecar searches. |
| F-2-10 | Confirmed fixed: the proof strip says **Exports JSON**. |
| F-2-11 | Confirmed fixed: the generated copy audit is reproducible and current. |
| F-3-1 | Confirmed fixed: the mobile menu exposes all four destinations, closes with Escape, restores focus, and focuses the destination h1. |

No earlier finding is reopened under its original ID. The findings above are
new checks against the complete current contract.

## Structure, accessibility, links, and identity

- `/`, `/demo/`, `/privacy/`, `/terms/`, and the designed 404 returned the
  expected status. Each has `lang="en"`, one `h1`, one `main`, its own title,
  description, canonical, Open Graph/Twitter metadata, favicon, and touch icon.
- Browser Back restored focus to the sample trigger. The mobile menu is
  keyboard-operable and route navigation focuses the new h1. Reduced-motion
  styles disable smooth scrolling and long transitions.
- All discovered internal links, four native downloads, and both GitHub link
  forms returned 200. The missing route returned the designed 404 and a route
  home.
- `/opt/fleet/lib/verify-url.sh` returned 200 with no console errors, one h1,
  one main, complete alt text, and named buttons. The 86-check live Playwright
  run reported zero console errors, zero external requests, and zero Axe WCAG
  2 A/AA violations across five routes.
- The live root HTML, main JavaScript, and stylesheet byte-match the clean
  build. Main JavaScript is 6,354 bytes gzip, below the static-product budget.
- The night-market sidecar artwork, clipped work-order shapes, square mono
  type, and cyan/pink/amber system match `.factory/design.md` and do not use a
  generic SaaS layout.
- F-4-2 remains a required landing-skeleton omission despite the valid Privacy
  route. F-4-1 remains a CLI-specific demo omission despite the working browser
  demo and command.

## Full quality-gate result

The clean clone passed `npm test`, `npm run build`, `cargo fmt --check`, strict
Clippy, and `cargo package --allow-dirty`. `npm test` passed 6 Rust unit tests,
3 CLI integration tests, 1 doctest, 11 Vitest tests, and 46 Playwright tests;
6 duplicate mobile CLI runs were intentionally skipped. `dist/site` was
produced successfully.

## Missed leverage

No AI or sync feature is justified. Edit Trail performs deterministic local
metadata parsing, and external inference would weaken its privacy model. It
already imports the three intended sidecar families, exports JSON/CSV/offline
HTML, opens a matching folder, and ships four native binaries. The missing
leverage is showing the real CLI demo on the landing page, covered by F-4-1.

## What would make this perfect

Add the real CLI terminal recording and the missing limitations/privacy
section. Replace the unclear first-screen facts, misleading or unlisted
headings, jargon, recipe metaphor, vague tab, and non-verbal download labels.
Place the sample outcome beside its action, link the README directly to
`/demo/`, and state the Rust version exactly. Register any retained claims and
rerun this complete review. PASS requires zero remaining findings.
