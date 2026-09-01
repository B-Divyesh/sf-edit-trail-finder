# Product QA review 5: Edit Trail

**Verdict: FAIL**

Reviewed 1 September 2026 against <https://edit-trail-finder.sociobot.in>
and the repository at `e6d711f54e175edf2f42ff555db289f5c7978c51`.

This review used new Chromium contexts at 390 × 844 and 1440 × 900, a clean
clone at `/tmp/edit-trail-review5.aDCwlZ/repo`, and a separate temporary CLI
output directory. Product code was not changed.

## Cold first read

Before scrolling, the page answers all three required questions.

| Question | Answer from the first screen | Supporting text |
| --- | --- | --- |
| What does it do? | It finds RAW photos from the editing steps recorded in sidecars. | “Find RAW photos by editing steps” |
| Who is it for? | Photographers using RAW editors who need to locate photos with active edits. | “For photographers using RAW editors who need to find masking, denoise, crop, or other active edits.” |
| What should I click first? | Try the sample data. | “Try it with sample data” and “Opens three samples and shows two matches.” |

At 390 px the three decision facts end at 722 px in an 844 px viewport. At
1440 px they end at 897 px in a 900 px viewport. The action, its outcome, and
all three facts are visible without scrolling. This check passes.

## Findings

### Minor

#### F-5-1 — The empty demo result gives the wrong next action

- **Location and exact text:** `/demo/`, after clearing **Sidecar data** and
  selecting **Find matching files**: “No matching trails. Try “Any selected”
  or choose fewer operations.”
- **Check:** the page correctly detects zero sidecars, but the suggested next
  action changes filters. With no sidecars loaded, changing filters cannot
  create a result. A first-time visitor can remain at an empty result without
  being told to load data.
- **Concrete fix:** when the parsed sidecar count is zero, replace the result
  text with: “No sidecars yet. Paste sidecar data or choose sidecar files,
  then find matching files.” Keep the current filter suggestion only when one
  or more sidecars are loaded and the query has zero matches.
- **Check to add:** clear the textarea, select **Find matching files**, and
  assert that the message names both **Paste sidecar data** and **Choose
  sidecars**. Retain the existing zero-record assertion as a separate state
  check.

## Copy audit

All listed landing and README sentences are at or below 22 words. No sentence
uses the banned marketing vocabulary. Terms are consistent: people see
“editing step”; index data use “operation”; supplemental files are
“sidecars”. Headings name their sections, and controls name their action or
result. The one recovery message in F-5-1 is the only copy issue found.

### Landing-page sentences

| Words | Sentence |
| ---: | --- |
| 4 | Local sidecar search / v0.1 |
| 16 | For photographers using RAW editors who need to find masking, denoise, crop, or other active edits. |
| 7 | Opens three samples and shows two matches. |
| 3 | CLI demo recording |
| 13 | A real run creates three sample sidecars, an index, and an offline report. |
| 5 | It finds two matching photos. |
| 9 | Recorded from the shipped Linux binary during the build. |
| 6 | The temporary folder name is shortened. |
| 3 | Limits and privacy |
| 5 | It reads sidecar metadata only. |
| 9 | It does not render, organise, upload, or edit photos. |
| 3 | How it works |
| 18 | Edit Trail reads each supported sidecar, records active operations, and builds a small local index you can search. |
| 9 | Scan XMP, DOP, and PP3 sidecars in every subfolder. |
| 9 | Malformed sidecars are recorded as warnings, and scanning continues. |
| 11 | Map editor-specific names and enabled states into one visible editing step. |
| 15 | Require all operations or match any, then print paths, JSON, CSV, or a static report. |
| 3 | Browser sidecar demo |
| 6 | Paste XMP or choose local sidecars. |
| 10 | Your sidecars stay in this tab and are never uploaded. |
| 11 | Files stay in browser memory and disappear when this tab closes. |
| 2 | CLI reference |
| 14 | Index an archive, find matching files, list operation names, or write an offline report. |
| 3 | Free example commands |
| 9 | The pack includes 12 commands and a crop-and-denoise search. |
| 6 | It is free with the CLI. |
| 11 | The download is generated in your browser and contains commands only. |
| 3 | Install the CLI |
| 10 | Choose a native download, or build from source with Rust. |
| 11 | Find RAW photos by editing steps. v0.1.0 · Built by Param Factory. |

### README sentences

| Words | Sentence |
| ---: | --- |
| 18 | Edit Trail is a local CLI for photographers who need to find RAW files by their editing steps. |
| 11 | It indexes XMP, DOP, and PP3 sidecars from common RAW editors. |
| 12 | It normalises active editing steps, then searches combinations such as `denoise + crop`. |
| 7 | It never reads or uploads image pixels. |
| 4 | Open the product site. |
| 5 | Open the sample demo directly. |
| 11 | The demo uses browser memory and does not upload selected sidecars. |
| 18 | Download the native executable for Linux x64, macOS arm64, macOS x64, or Windows x64 from the product site. |
| 11 | You can also build from source with Rust 1.85 or newer: |
| 10 | Try the installed CLI without pointing it at your archive: |
| 10 | It creates a temporary three-sidecar archive, index, and offline report. |
| 8 | Use `--output <DIRECTORY> --json` for a scripted run. |
| 7 | Index every supported sidecar under an archive: |
| 8 | Find files where both editing steps are active: |
| 9 | Export JSON, or export a spreadsheet without exposing pixels: |
| 5 | Build a self-contained offline report: |
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

## Demo and privacy checks

- A fresh click on **Try it with sample data** opened `/demo/` and immediately
  showed `2 of 3 sidecars match all selected operations` with the two result
  records `night-market-1842.NEF` and `lantern-0917.ARW`.
- The persistent banner reads “Demo — sample data, nothing is saved”. **Reset
  demo** restored the initial sample, crop-and-denoise selection, and two
  records.
- Fresh phone and desktop contexts had no local-storage or session-storage
  keys after the demo. The browser-demo claim test also confirmed no IndexedDB
  database.
- Request logging during the landing and demo flow recorded only
  `https://edit-trail-finder.sociobot.in`; no console errors occurred.
- `target/release/edit-trail demo --output <new temporary output> --json`
  created three sidecars, an index, and an offline report, and returned two
  matches. The output directory was newly created for this check.

## Registered claims

Each exact command in `.factory/claims.json` was run independently in the
clean clone. All 18 completed successfully. The full `npm test` browser suite
then repeated the tagged checks and reported 60 passing tests.

| Claim id | Result |
| --- | --- |
| `sample-demo` | Pass |
| `linux-download` | Pass |
| `cross-platform-downloads` | Pass |
| `recipe-download` | Pass |
| `browser-local` | Pass |
| `no-runtime-third-parties` | Pass |
| `browser-sidecar-formats` | Pass |
| `offline-reload` | Pass |
| `local-sidecar-search` | Pass |
| `cli-private-read-only` | Pass |
| `cli-outputs` | Pass |
| `cli-contract` | Pass |
| `mit-license` | Pass |
| `cli-demo-recording` | Pass |
| `local-only-boundary` | Pass |
| `default-index-path` | Pass |
| `open-folder` | Pass |
| `deployment-artifact` | Pass |

The live landing, README, and legal copy were cross-checked against this
registry. Observable product statements map to the listed local processing,
browser-local, output, download, offline, license, and deployment checks. No
additional unlisted product claim was found.

## Earlier-review confirmation

The following checks were repeated against the live page and current source.
Every prior finding remains resolved.

| Earlier finding | Current confirmation |
| --- | --- |
| F-1-1 | Sample action opens two visible results without a second action. |
| F-1-2 | Install link exits demo mode and removes its banner. |
| F-1-3 | Browser demo accepts XMP, DOP, and PP3 inputs. |
| F-1-4 | All three first-screen facts fit at phone and desktop sizes. |
| F-1-5 | Demo has its own route, title, h1, and Back focus restoration. |
| F-1-6 | All routes supply description, canonical, sharing data, and icons. |
| F-1-7 | Home, demo, legal, and 404 routes share the required shell. |
| F-1-8 | The response header includes `frame-ancestors 'none'`. |
| F-1-9 | README introduction sentences remain within the word limit. |
| F-1-10 | Exit-code wording is concise and the codes are checked. |
| F-1-11 | Stored index data and excluded pixels are separately stated. |
| F-1-12 | Build and deployment wording is concise and registered. |
| F-1-13 | CLI output heading is factual and context-complete. |
| F-1-14 | Example-command heading is factual and context-complete. |
| F-1-15 | Editing-step and operation terms remain consistent. |
| F-1-16 | Controls name their actions or resulting content. |
| F-1-17 | Free and MIT wording maps to the license check. |
| F-1-18 | The unmeasured 10,000-sidecar count is absent. |
| F-1-19 | The unmeasured 247-match count is absent. |
| F-1-20 | The unmeasured 10,000-report count is absent. |
| F-1-21 | The unmeasured 89-result example is absent. |
| F-1-22 | Unsupported runtime-service wording is absent. |
| F-1-23 | Default index location and deletion behavior are registered. |
| F-1-24 | Alias and history behavior is limited to checked support. |
| F-1-25 | `--open` has an exact source-folder check. |
| F-1-26 | Exhaustive-help and index-override statements are absent. |
| F-1-27 | Unknown-field wording is absent. |
| F-1-28 | Privacy wording is limited to checked local behavior. |
| F-1-29 | Build artifact wording maps to its deployment check. |
| F-1-30 | Runtime privacy is checked with complete request logging. |
| F-1-31 | Linux, macOS, and Windows download bytes are checked. |
| F-2-1 | Reset restores sample text, filters, file input, and two results. |
| F-2-2 | The 247-result text remains absent. |
| F-2-3 | Default-index behavior remains registered and checked. |
| F-2-4 | Folder-opening behavior remains registered and checked. |
| F-2-5 | The 12-command pack and crop-and-denoise command are checked. |
| F-2-6 | Index paths, times, editor, operations, and warnings are checked. |
| F-2-7 | Static files, native download, headers, and cache policy are checked. |
| F-2-8 | Malformed-sidecar text states the observed warning behavior. |
| F-2-9 | CLI command heading names its content. |
| F-2-10 | JSON output is named directly. |
| F-2-11 | Generated copy counts are current. |
| F-3-1 | The phone menu exposes all destinations and manages focus. |
| F-4-1 | Landing includes a self-hosted recording from the shipped CLI. |
| F-4-2 | Landing includes the limits and privacy section. |
| F-4-3 | First screen states the free MIT price. |
| F-4-4 | First screen states where sidecars remain. |
| F-4-5 | Inaccurate three-command wording is absent. |
| F-4-6 | Unmeasured large-archive wording is absent. |
| F-4-7 | Sample outcome appears immediately below its action. |
| F-4-8 | The subfolder instruction uses plain wording. |
| F-4-9 | Browser-local wording uses plain wording. |
| F-4-10 | The file-search heading names its content. |
| F-4-11 | The example-command heading is literal. |
| F-4-12 | The command-download heading is literal. |
| F-4-13 | The download control names the result. |
| F-4-14 | The example section heading is literal. |
| F-4-15 | The JSON tab names its result. |
| F-4-16 | Every native download begins with “Download for”. |
| F-4-17 | README links directly to `/demo/`. |
| F-4-18 | README names Rust 1.85 as the minimum. |

## Structure and access checks

- `/`, `/demo/`, `/privacy/`, `/terms/`, and `/404.html` each returned 200,
  had one h1 and one main landmark, and had their required route title,
  canonical URL, description, social metadata, favicon, and touch icon.
- A non-existent route returned HTTP 404 and the styled **Page not found**
  page with a route back to the product.
- Every internal destination, native download, and the two public repository
  links returned HTTP 200. `robots.txt`, `sitemap.xml`, and the manifest also
  returned 200.
- The shared header includes the skip link and the four expected destinations.
  The shared footer includes Privacy, Terms, version, and Built by Param
  Factory.
- Keyboard checks passed for the skip link, tabs, menu, Escape close, route
  focus, and visible focus. Axe checks in the browser suite reported no
  violations. Reduced-motion behavior and 200% text at 390 px passed.
- The 404 route, clipped ticket surfaces, hand-made operation marks, self-hosted
  night-market art, and cyan/pink/amber system follow the product-specific
  design direction rather than a generic application template.
- The first-load JavaScript is 6.37 kB gzip. The site uses self-hosted assets
  and no runtime third-party request.

## Product-scope check

The brief calls for local sidecar search, combination queries, output formats,
an offline report, and opening a matching source folder. The CLI provides the
query, JSON and CSV output, report, and `--open` behavior. The browser sample
offers an immediate try-out. An AI feature is not implied by this local search
job and no decorative AI control is present.

## What would make this perfect

Resolve F-5-1 by giving the no-sidecar state a direct instruction to paste or
choose a sidecar. Re-run the full empty-state browser check after that copy and
state change. With that one recovery path corrected, this review has no other
open finding.
