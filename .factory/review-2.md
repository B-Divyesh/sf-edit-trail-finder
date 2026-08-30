# Adversarial first-read review 2: Edit Trail

**Verdict: FAIL**

Reviewed 30 August 2026 against the live deployment at
<https://edit-trail-finder.sociobot.in> and source commit
`48ce9e022ef716e1e3123cc39df9443811e7b0eb`.

The first screen is clear, the one-click demo immediately shows two realistic
results, all 13 registered claim commands pass, and the site structure is
sound. The product still fails because **Reset demo** does not reset the demo,
and three claims from review 1 remain exposed without claim coverage despite
being marked fixed.

## Cold first read

Fresh Chromium contexts were opened without scrolling at 390 × 844 and
1440 × 900.

- What it does: finds RAW photos by editing steps stored in local sidecars.
- For whom: photographers who use RAW editors and search by edits such as
  masking, denoise, and crop.
- What to click first: **Try it with sample data**.

All three answers are available from the first screen. The exact copy is
“Find RAW photos by editing steps,” “For photographers using RAW editors who
need to find masking, denoise, crop, or other active edits,” and “Try it with
sample data.” The adjacent sentence says what follows: “See two matching
sample photos immediately.”

All three facts are visible without scrolling. Their final edges are 785.44 px
in the 844 px mobile viewport and 897.89 px in the 900 px desktop viewport.
There is no horizontal overflow and no console error on either normal load.

## Findings

### Blocking

#### F-2-1 — Reset demo does not restore the initial demo state

- Exact location/quote: `/demo/` banner, **Reset demo**; the same handler is
  also exposed as **Reset sample**.
- Verification: change **Match rule** from **All selected** to **Any selected**
  and run the search. The status becomes “3 of 3 sidecars match any selected
  operations.” Activate **Reset demo**. The rule remains **Any selected**, the
  status remains the three-result “any” result, and all three result cards
  remain visible.
- Code evidence: `site/src/main.ts` calls `reset(true)`, but `reset()` only
  replaces the text input. `renderOptions()` deliberately preserves checked
  operations, and no code restores the match radio. There is no reset test.
- Why this fails: “Reset demo” promises a return to the known sample state.
  It currently reloads only one part of that state. The supplied demo contract
  makes a working reset mandatory.
- Concrete fix: make reset restore the bundled text, **All selected**, crop and
  denoise selections, the two-result output, and any file-input state. Use the
  single label **Reset demo**. Add a test that changes every control, resets,
  and asserts the complete initial state.

#### F-2-2 / F-1-19 — The unproved 247-result claim remains visible

- Exact location/quote: desktop first-screen query card, “active denoise +
  crop **247 →**”; source `site/index.html` in `.floating-query`.
- Verification: the number is prominently visible over the hero artwork. It
  has no `.factory/claims.json` entry and no fixture that returns 247 results.
- History: review 1 recorded F-1-19 for the unlisted “MATCHES 247” result.
  `.factory/polish-1.md` says the count was removed, but it was removed only
  from the terminal panel and survives in the hero. F-1-19 is therefore
  reopened as blocking.
- Why this fails: a specific result count looks like real product output. A
  visitor cannot distinguish it from tested evidence.
- Concrete fix: remove the number and show a non-quantitative result marker,
  or register a claim and add a deterministic 247-result sandbox test.

#### F-2-3 / F-1-23 — The default-index promise remains unregistered

- Exact locations/quotes: landing CLI output “→ `.edit-trail.json`”; Privacy
  “Delete `.edit-trail.json` to remove a CLI index.”
- Verification: no claim entry tests the default index path or deletion
  guidance. `src/main.rs` still defines `DEFAULT_INDEX` as
  `.edit-trail.json`, but source truth is not claim coverage.
- History: review 1 F-1-23 required a `default-index-path` claim or removal.
  The polish removed the README sentence but left the same promise on two live
  surfaces. F-1-23 is therefore reopened as blocking.
- Why this fails: users may rely on the displayed path when locating or
  deleting their index, yet the verifier never checks that default behavior.
- Concrete fix: register `default-index-path` and test index, find, and delete
  guidance from a fresh working directory, or remove both live references.

#### F-2-4 / F-1-25 — Folder opening is still documented but untested

- Exact location/quote: the live **Download audit recipes** output contains
  `edit-trail find -o denoise --limit 1 --open`.
- Verification: `recipe-download` checks the line count and one combination
  command only. No claim entry or test runs `--open` or confirms which folder
  opens. The implementation remains in `src/main.rs`.
- History: review 1 F-1-25 required a platform-safe `open-folder` claim or
  removal. The README prose was removed, but the shipped recipe continues to
  advertise the same behavior. F-1-25 is therefore reopened as blocking.
- Why this fails: the downloaded pack is user documentation. A command in it
  is still a product promise even when the landing paragraph omits that
  promise.
- Concrete fix: add an `open-folder` claim with a platform-safe opener stub
  that asserts the exact target, or remove the `--open` recipe.

### Major

#### F-2-5 — The recipe-pack sentence claims more than its registered test proves

- Exact quote: “The recipe pack covers masking, crop, denoise, reports, CSV,
  JSON, and hidden sidecars.”
- Verification: `recipe-download` claims only “12 plain-text commands without
  an account.” Its test asserts 12 command lines and one crop-and-denoise
  command. It does not assert commands for every named category or execute
  them. In particular, `--include-hidden` is never tested.
- Why this fails: seven capabilities are presented as usable recipes without
  matching claim coverage.
- Concrete fix: expand the claim text and test to assert and run a safe fixture
  for every named recipe family, or narrow the landing sentence to exactly the
  tested contents.

### Minor

#### F-2-6 — The README index-schema claim is not fully registered or asserted

- Exact quote: “The index contains paths, timestamps, editor families, active
  editing steps, and warnings.”
- Verification: `local-sidecar-search` checks paths, editor, operations, and a
  warning, but its registered claim does not state this schema and the test
  never asserts a timestamp.
- Concrete fix: add the schema to that claim and assert every named field,
  including a timestamp, or remove fields that are not part of the contract.

#### F-2-7 — README build and deployment claims are outside the claim registry

- Exact quotes: “`npm run build` compiles the release binary and documentation
  site.” “The factory deploys `dist/site` to Azure Static Web Apps.” “The
  deployment configuration sets security headers, download headers, and asset
  caching.”
- Verification: these statements have no `.factory/claims.json` entry. The
  build and response-policy checks pass, but unregistered tests do not satisfy
  the claims contract.
- Concrete fix: register a packaging/deployment-artifact claim tied to the
  existing build and response-policy checks, or remove operational assertions
  that are not intended as product commitments.

#### F-2-8 — Landing copy uses a metaphor instead of the observable behavior

- Exact quote: “Broken files become warnings, not roadblocks.”
- Why this fails: “roadblocks” is metaphorical and does not state whether the
  scan continues, which is the useful behavior.
- Rewrite: “Malformed sidecars are recorded as warnings, and scanning
  continues.”

#### F-2-9 — “Use four commands” does not identify the section out of context

- Exact location: CLI reference `h2`, “Use four commands.”
- Why this fails: a screen-reader headings list does not say which commands or
  what they accomplish.
- Rewrite: **CLI commands for sidecar searches**.

#### F-2-10 — “JSON automation ready” is vague promotional shorthand

- Exact location: product-facts strip, “JSON automation ready.”
- Why this fails: “ready” does not name an output or action and “automation” is
  broader than the tested JSON export.
- Rewrite: **Exports JSON**.

#### F-2-11 — The repository copy audit reports incorrect word counts

- Exact location: `.factory/copy-audit.md`.
- Verification: it records “See two matching sample photos immediately” as 7
  words; it has 6. It records the 18-word “Edit Trail reads each supported
  sidecar…” sentence as 12. Several other rows are similarly inaccurate.
- Why this fails: the required proof of simplicity is not reproducible even
  though no current sentence exceeds the 22-word cap.
- Concrete fix: regenerate counts with a documented tokenizer, include dynamic
  strings and copy fragments, and fail CI when the checked-in audit differs.

## Copy audit

Counts below use lexical, whitespace-separated words. Hyphenated compounds,
paths, flags, and versions count once; punctuation-only symbols do not. No
sentence exceeds 22 words and no banned marketing word appears.

### Live landing-page sentences

| Words | Exact sentence | Flag |
| ---: | --- | --- |
| 16 | For photographers using RAW editors who need to find masking, denoise, crop, or other active edits. | — |
| 6 | See two matching sample photos immediately. | — |
| 18 | Edit Trail reads each supported sidecar, records active operations, and builds a small local index you can search. | — |
| 7 | Walk XMP, DOP, and PP3 files recursively. | — |
| 6 | Broken files become warnings, not roadblocks. | F-2-8 |
| 11 | Map editor-specific names and enabled states into one visible editing step. | — |
| 15 | Require all operations or match any, then print paths, JSON, CSV, or a static report. | — |
| 6 | Paste XMP or choose local sidecars. | — |
| 9 | Parsing stays in this tab; files are never uploaded. | — |
| 11 | Files stay in browser memory and disappear when this tab closes. | — |
| 14 | Index an archive, find matching files, list operation names, or write an offline report. | — |
| 7 | Indexed local sidecars; warnings are recorded → `.edit-trail.json`. | F-2-3 / F-1-23 |
| 5 | Offline report written to `audit.html`. | — |
| 13 | The recipe pack covers masking, crop, denoise, reports, CSV, JSON, and hidden sidecars. | F-2-5 |
| 6 | It is free with the CLI. | — |
| 11 | The download is generated in your browser and contains commands only. | — |
| 10 | Choose a native download, or build from source with Rust. | — |
| 6 | Find RAW photos by editing steps. | — |
| 4 | Built by Param Factory. | — |

Dynamic landing/demo strings are also visitor-facing:

| Words | Exact sentence or template | Flag |
| ---: | --- | --- |
| 4 | 3 sidecars parsed locally. | — |
| 5 | Choose editing steps, then search. | — |
| 8 | 2 of 3 sidecars match all selected operations. | — |
| 4 | No sidecar content yet. | — |
| 6 | Paste a sidecar or choose files. | — |
| 3 | No matching trails. | — |
| 7 | Try “Any selected” or choose fewer operations. | — |
| 4 | Could not parse `[name]`. | — |
| 6–7 | Check that its XML, DOP, or PP3 data is complete. | — |
| 7 | This DOP does not identify DxO PhotoLab. | — |
| 6 | No DxO correction states were found. | — |
| 9 | Offline mode — the demo and docs still work locally. | — |
| 2 | Command copied. | — |
| 3 | Could not copy. | — |
| 4 | Select the command manually. | — |
| 6 | This sidecar could not be parsed. | — |

### Landing headings, controls, and fragments

The headline is 6 words. The remaining headings are **Index editing steps in
three commands**, **Scan sidecars**, **Normalise operation names**, **Query
combinations**, **Search sample editing steps**, **CLI behavior on large
archives**, **Download 12 archive audit recipes**, **Example search recipes**,
and **Search your own sidecars**. They pass except **Use four commands**
(F-2-9).

Action labels are **Try sample data**, **Install**, **Try it with sample data**,
**Download for Linux**, **Copy install command**, **Reset demo**, **View install
options**, **Choose sidecars**, **Reset sample**, **Find matching files**,
**Copy command**, **Download audit recipes**, and the four platform-named
downloads. They name an action or destination. The two reset labels describe
the same handler inconsistently and are included in F-2-1.

Claim fragments are **Local sidecar processing**, **Works offline after the
first visit**, **MIT licensed**, **3 sidecar families**, **0 pixels indexed**,
and **JSON automation ready**. The first five map to registered claims. The
last is flagged in F-2-10. The visible **247 →** fragment is F-2-2 / F-1-19.

### README sentences

| Words | Exact sentence | Flag |
| ---: | --- | --- |
| 18 | Edit Trail is a local CLI for photographers who need to find RAW files by their editing steps. | — |
| 11 | It indexes XMP, DOP, and PP3 sidecars from common RAW editors. | — |
| 12 | It normalises active editing steps, then searches combinations such as `denoise + crop`. | — |
| 7 | It never reads or uploads image pixels. | — |
| 9 | Open the product site and sample demo at edit-trail-finder.sociobot.in. | — |
| 11 | The demo uses browser memory and does not upload selected sidecars. | — |
| 18 | Download the native executable for Linux x64, macOS arm64, macOS x64, or Windows x64 from the product site. | — |
| 11 | You can also build from source with a current Rust toolchain. | — |
| 10 | Try the installed CLI without pointing it at your archive. | — |
| 10 | It creates a temporary three-sidecar archive, index, and offline report. | — |
| 8 | Use `--output <DIRECTORY> --json` for a scripted run. | — |
| 7 | Index every supported sidecar under an archive. | — |
| 8 | Find files where both editing steps are active. | — |
| 9 | Export JSON, or export a spreadsheet without exposing pixels. | — |
| 5 | Build a self-contained offline report. | — |
| 17 | Exit codes are `0` for success, `1` for I/O or parse failures, and `2` for invalid usage. | — |
| 8 | A `find` query with no matches returns `3`. | — |
| 13 | Malformed sidecars become warnings, so one file does not stop an archive scan. | — |
| 12 | The index contains paths, timestamps, editor families, active editing steps, and warnings. | F-2-6 |
| 6 | It does not contain image bytes. | — |
| 7 | Requirements: Rust 1.85+, Node 20+, and npm. | — |
| 10 | `npm run build` compiles the release binary and documentation site. | F-2-7 |
| 8 | Run `cargo package --allow-dirty` to check package readiness. | — |
| 10 | The factory owns publishing credentials; this repository does not publish. | — |
| 9 | The factory deploys `dist/site` to Azure Static Web Apps. | F-2-7 |
| 11 | The deployment configuration sets security headers, download headers, and asset caching. | F-2-7 |
| 5 | MIT © 2026 Sociobot (Param Factory). | — |
| 2 | See LICENSE. | — |

README headings all name their sections. Its four schema-list fragments have
9, 10, 8, and 5 words. Commands are excluded from sentence counts but were
checked as product documentation; the downloaded `--open` recipe is F-2-4.

Terminology is otherwise consistent: **editing step** is the user concept,
**operation** is the editor/index field, **sidecar** is the supplemental file,
and **normalise operation names** is the translation action.

## Demo and sandbox verification

- One click from the hero opens `/demo/`, with the persistent “Demo — sample
  data, nothing is saved” banner, the two-of-three status, and realistic
  darktable and DxO PhotoLab result records already visible.
- **View install options** opens `/#install`, removes the banner, and leaves no
  demo query or route state.
- A pre-existing `real:test-sentinel` local-storage value stayed unchanged.
  Session storage and IndexedDB stayed empty. The demo made no external
  request. The service worker uses Cache Storage only for site assets.
- Live offline navigation and reload passed for `/demo/`, `/privacy/`, and
  `/terms/`; the demo retained its own heading, banner, and two-result output.
- Reset fails as described in F-2-1.
- The clean-clone CLI command
  `edit-trail demo --output /tmp/.../cli-demo --json` created a unique
  three-sidecar archive, JSON index, and self-contained report with two
  matches. Reusing that directory was rejected with exit code 1.

## Claims verification

A no-local clone of the reviewed commit was created at
`/tmp/edit-trail-review2.rScy3A/repo`. `npm ci` succeeded. Every exact `test`
command from `.factory/claims.json` was run independently from that clone.

| Claim ID | Result | Observable evidence |
| --- | --- | --- |
| `sample-demo` | PASS | 2 desktop/mobile tests; two of three records visible after one click. |
| `linux-download` | PASS | 2 tests; attachment name, ELF signature, and size checked. |
| `cross-platform-downloads` | PASS | 2 tests; Linux, both macOS builds, and Windows have native signatures. |
| `recipe-download` | PASS | 2 tests; 12 lines and one combination command checked. Coverage gap: F-2-5. |
| `browser-local` | PASS | 2 tests; in-memory upload produced no request or browser-data write. |
| `no-runtime-third-parties` | PASS | 2 tests; all root-page requests stayed same-origin. |
| `browser-sidecar-formats` | PASS | 2 tests; XMP, DxO DOP, and PP3 parsed and rendered. |
| `offline-reload` | PASS | 2 dedicated contexts; demo and legal routes reloaded offline. |
| `local-sidecar-search` | PASS | 1 CLI run, 1 mobile duplicate skipped; formats, aliases, history boundary, warning, and pixel marker checked. |
| `cli-private-read-only` | PASS | 1 CLI run, 1 duplicate skipped; no network attempt or source mutation. |
| `cli-outputs` | PASS | 1 CLI run, 1 duplicate skipped; JSON, CSV, and self-contained HTML checked. |
| `cli-contract` | PASS | 1 CLI run, 1 duplicate skipped; exit codes 0, 1, 2, and 3 checked. |
| `mit-license` | PASS | 2 tests; site fact and shipped MIT text checked. |

Every claim tag occurs exactly once. No registered test failed. The unlisted or
under-specified claims are F-2-2 through F-2-7. The complete clean-clone gate
also passed: 5 Rust unit tests, 3 Rust CLI tests, 1 doctest, 8 Vitest tests,
and 42 Playwright tests passed; 4 duplicate mobile CLI executions were skipped.

## Earlier-finding verification

Every finding in `.factory/review-1.md` was checked against both live behavior
and current source. “Fixed” below means independently confirmed, not copied
from `.factory/polish-1.md`.

| Earlier ID | Result in review 2 |
| --- | --- |
| F-1-1 | Fixed: the one-click route immediately shows two results. |
| F-1-2 | Fixed: **View install options** exits demo mode. |
| F-1-3 | Fixed: live and local tests parse XMP, DOP, and PP3. |
| F-1-4 | Fixed: all three facts fit both tested first screens. |
| F-1-5 | Fixed: `/demo/` has its own title/h1; Back restores the trigger and Forward focuses the demo h1. |
| F-1-6 | Fixed: every route has description, canonical, OG/Twitter metadata, and icons. |
| F-1-7 | Fixed: header and footer content is consistent on all routes and 404. |
| F-1-8 | Fixed: live response CSP contains `frame-ancestors 'none'`. |
| F-1-9 | Fixed: README introduction is split; maximum sentence length is 18. |
| F-1-10 | Fixed: exit-code copy is split and tested. |
| F-1-11 | Fixed for sentence length; separate schema coverage gap is F-2-6. |
| F-1-12 | Fixed for sentence length; separate claim-registration gap is F-2-7. |
| F-1-13 | Fixed: heading is **CLI behavior on large archives**. |
| F-1-14 | Fixed: heading is **Example search recipes**. |
| F-1-15 | Fixed: editing step/operation terminology and UK spelling are consistent. |
| F-1-16 | Fixed: controls use result-naming labels. |
| F-1-17 | Fixed: `mit-license` is registered and passes. |
| F-1-18 | Fixed: the 10,000-sidecar count is absent. |
| F-1-19 | **Not fixed:** visible hero still shows 247; reopened as F-2-2 / F-1-19. |
| F-1-20 | Fixed: the 10,000-record report count is absent. |
| F-1-21 | Fixed: the 89-result output is absent. |
| F-1-22 | Fixed: the single-binary/runtime-service promise is absent. |
| F-1-23 | **Not fixed:** `.edit-trail.json` remains live and unregistered; reopened as F-2-3 / F-1-23. |
| F-1-24 | Fixed: the detailed synonym/vocabulary promise is absent; current alias claim test covers multiple formats. |
| F-1-25 | **Not fixed:** the downloaded recipe still advertises `--open`; reopened as F-2-4 / F-1-25. |
| F-1-26 | Fixed: index-override and exhaustive-help promises are absent. |
| F-1-27 | Fixed: unknown-field promise is absent. |
| F-1-28 | Fixed: EXIF/caption exclusion promise is absent; no-pixel claim remains tested. |
| F-1-29 | Fixed: exact build-output location promise is absent. |
| F-1-30 | Fixed: runtime-request assertions are registered and pass. |
| F-1-31 | Fixed: four native downloads are live and signature-tested. |

## Structure, accessibility, and visual identity

- `/`, `/demo/`, `/privacy/`, `/terms/`, and the designed 404 have the correct
  status, `lang="en"`, one `h1`, one `main`, route-specific titles,
  descriptions, canonicals, OG/Twitter metadata, SVG favicon, and 180 px touch
  icon. Root title is 48 characters and follows “Product — what it does.”
- Every discovered navigation, legal, source, fragment, and binary-download
  link returned its expected 200. The deliberate missing URL returned the
  designed 404 with a way home.
- Browser Back restored focus to **Try it with sample data**; Forward focused
  “Search sample editing steps.” Deep routes reload with their own content.
- `/opt/fleet/lib/verify-url.sh` passed in 736 ms with no console/page errors,
  one h1, one main, complete alt text, and named buttons.
- Playwright axe reported zero WCAG 2 A/AA violations on all five routes at
  desktop and mobile sizes. Reduced motion changes smooth scrolling to auto
  and transitions to 0.000001 s. No tested route overflows at 390 px.
- Initial JS is 15.17 kB (6.01 kB gzip). The night-market artwork, clipped
  tickets, cyan/pink/amber palette, mono typography, and dense sidecar-result
  treatment are product-specific rather than a generic SaaS template.

## Missed leverage

No new AI, sync, or import feature is justified. Deterministic local parsing is
the product's advantage; AI would add cost and weaken privacy. The tool already
imports the three intended sidecar families, exports JSON/CSV/offline HTML,
and ships native binaries for all named desktop platforms. Folder opening is
already implemented, but its documentation/test gap is F-2-4 rather than a
missing feature.

## What would make this perfect

Make **Reset demo** restore the complete initial state and test it. Remove or
test the surviving 247, default-index, and folder-opening promises. Bring every
remaining recipe, index-schema, build, and deployment statement into the claim
registry. Replace the metaphor, vague heading, and “automation ready” phrase,
then regenerate an accurate copy audit. PASS requires zero remaining findings.
