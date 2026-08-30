# Adversarial first-read review 1: Edit Trail

**Verdict: FAIL**

Reviewed 30 August 2026 against the live deployment at
<https://edit-trail-finder.sociobot.in> and source commit
`63d20458787e0b11760f69c76219009d16350ade`.

The declared claims pass, the CLI works, the site is visually distinct, and
the first screen explains the job. The product still fails this review because
the one-click demo does not show results, its exit action does not leave demo
mode, and its file picker advertises a PP3 format that the browser parser
rejects.

## Cold first read

Fresh Chromium contexts were opened without scrolling at 390 × 844 and
1440 × 900.

- What it does: finds RAW photos by the editing operations recorded in local
  sidecar files.
- For whom: photographers who use RAW editors.
- What to click first: **Try it with sample data**.

All three questions are answerable from the first screen. The exact text that
does that work is “Find photos by their editing steps,” “For photographers
using RAW editors…,” and “Try it with sample data.” There is no blocking
first-read clarity failure.

At 390 px the first fact is visible and the second is clipped at the bottom.
At 1440 × 900 none of the three fact lines is visible. See F-1-4.

## Findings

### Blocking

#### F-1-1 — The one-click demo opens before it has shown a result

- Exact location/quote: first-screen **Try it with sample data** →
  `/?demo=1#demo`; the immediate status is “3 sidecars parsed locally. Choose
  operations, then search.” The results region contains zero records.
- Verification: only a second click on **Find matching files** produces “2 of
  3 sidecars match all selected operations” and the two realistic records
  `night-market-1842.NEF` and `lantern-0917.ARW`.
- Why this fails: the required path is one click and the first screen after
  that click must already show the product being used. This path is two clicks
  before any value is visible.
- Concrete fix: when `demo=1` loads, run the default crop-and-denoise search and
  render both result cards. Add a test that starts at `/`, clicks the hero CTA,
  and asserts the banner, status, and two cards without another action.

#### F-1-2 — “Start for real” does not leave demo mode

- Exact location/quote: demo banner link **Start for real**.
- Verification: activating it changes the URL from `/?demo=1#demo` to
  `/?demo=1#install`; `?demo=1` remains and the “Demo — sample data, nothing is
  saved” banner remains visible.
- Why this fails: the control promises a transition out of the sandbox but
  leaves the page in the demo namespace. A visitor cannot tell whether later
  work is real or disposable.
- Concrete fix: label it **View install options**, navigate to `/#install`
  without `demo=1`, discard demo state, and test the URL plus absent banner.

#### F-1-3 — The browser file picker advertises PP3 but rejects it

- Exact location/quote: **Choose sidecars** has
  `accept=".xmp,.dop,.pp3,text/xml"`; the site also says “3 sidecar families.”
- Verification: selecting the shipped
  `examples/sample-archive/after-rain-2201.RAF.pp3` produces “Could not parse
  after-rain-2201.RAF.pp3. Check that its XML is complete.” The browser parser
  only accepts XML, while PP3 is key/value data.
- Why this fails: the primary sandbox invites a supported real file and then
  reports that valid input is malformed. This makes the demo materially weaker
  than the product it represents.
- Concrete fix: implement PP3 parsing in the browser using the CLI's
  normalisation rules, seed the browser demo with XMP, DOP, and PP3, and add a
  claim test for all three. Until then, remove `.pp3` from the picker and state
  that the browser demo accepts XML sidecars only.

### Major

#### F-1-4 — The required three first-screen facts are below the fold

- Exact location: hero facts “Runs on your computer,” “Works offline after the
  first visit,” and “Free under the MIT License.”
- Verification: at 1440 × 900 all three start below the viewport; at 390 × 844
  only the first is fully visible. The desktop headline occupies five lines and
  452 px.
- Why this fails: privacy, offline capability, and price are required
  first-screen decision facts, not follow-up copy.
- Concrete fix: reduce the desktop headline measure/type or hero height and
  tighten mobile spacing so all three facts appear before the fold at both test
  sizes. Add viewport-bound assertions for the third fact.

#### F-1-5 — Demo-route heading and history focus do not match the route

- Exact location: `/?demo=1#demo` has title “Demo — Edit Trail,” but its sole
  `h1` remains “Find photos by their editing steps”; “Search sample editing
  steps” is an `h2` far down the document.
- Verification: entry focuses `#demo-title`, but browser Back returns focus to
  `BODY`, not the prior control. Scroll restoration worked.
- Why this fails: the title and primary heading describe different pages, and
  keyboard/screen-reader position is lost on history navigation.
- Concrete fix: make `/demo` a real route with “Search sample editing steps” as
  its one `h1`, or keep one page without changing the route title. Save and
  restore the triggering element's focus on Back/Forward and announce route
  changes in a polite live region.

#### F-1-6 — Required sharing and icon metadata is incomplete

- Exact location: `<head>` on `/`, `/?demo=1`, `/privacy/`, `/terms/`, and the
  designed 404.
- Verification: every route has zero Open Graph tags and zero Twitter-card
  tags. There is no 180 px apple-touch icon. The 404 has no meta description or
  canonical URL. The demo keeps the home canonical and description.
- Why this fails: shared links have no product-specific preview, and route
  metadata does not consistently identify the current page.
- Concrete fix: add route-specific title, description, canonical, Open Graph,
  and Twitter metadata; add a real 1200 × 630 image derived from the night
  market artwork and a 180 px touch icon. Give the demo a canonical `/demo`
  route or deliberately canonicalise it while still supplying demo-specific
  social metadata.

#### F-1-7 — Header and footer contracts change across routes

- Exact location: the home header has Try it/Docs/Recipes/Install; Privacy has
  Home/Terms; Terms has Home/Privacy; the 404 only has the wordmark. The home
  footer omits “Built by Param Factory”; legal footers omit the one-line product
  description and version, and omit the current legal-page link.
- Why this fails: repeated navigation moves or disappears, and the required
  ownership/version handoff is absent.
- Concrete fix: use one compact header and one footer component on all routes,
  with Demo, Privacy, Terms, product one-liner, version/build ID, and “Built by
  Param Factory.”

#### F-1-8 — The response policy does not prevent framing

- Exact location: live `Content-Security-Policy` and
  `site/public/staticwebapp.config.json`.
- Verification: the CSP is otherwise restrictive but has no
  `frame-ancestors` directive, and there is no equivalent anti-framing header.
- Why this fails: the site-structure contract explicitly requires
  `frame-ancestors` as a response header; this leaves the UI frameable.
- Concrete fix: append `frame-ancestors 'none'` to the response-header CSP and
  assert it in the response-policy test and against the live response.

### Minor — copy

#### F-1-9 — README sentence exceeds 22 words and front-loads jargon

- Quote: “It indexes XMP sidecars, normalises active edit operations across
  darktable, Adobe Camera Raw/Lightroom, and common generic schemas, then
  searches combinations such as ‘denoise + crop’.” (25 words)
- Why this fails: a first-time reader must unpack formats, products, schemas,
  normalisation, and the search action in one sentence.
- Rewrite: “It indexes XMP, DOP, and PP3 sidecars from common RAW editors. It
  normalises active edits, then searches combinations such as ‘denoise +
  crop’.”

#### F-1-10 — README exit-code sentence exceeds 22 words

- Quote: “Exit codes are `0` for success, `1` for I/O or parse failures, `2`
  for invalid CLI usage, and `3` when a `find` query has no matches.” (26 words)
- Why this fails: four outcomes are compressed into one scan-resistant line.
- Rewrite: “Exit codes are `0` for success, `1` for I/O or parse failures, and
  `2` for invalid usage. A `find` query with no matches returns `3`.”

#### F-1-11 — README index-content sentence exceeds 22 words

- Quote: “The index contains sidecar paths, inferred source-image paths,
  modification timestamps, editor family, active operation names, and
  warnings—never image bytes, EXIF location, captions, or other unrelated
  metadata.” (26 words)
- Why this fails: stored fields and excluded fields are separate decisions.
- Rewrite: “The index contains paths, timestamps, editor families, active
  operations, and warnings. It never contains image bytes, EXIF locations,
  captions, or unrelated metadata.”

#### F-1-12 — README deployment sentence exceeds 22 words

- Quote: “`site/public/staticwebapp.config.json` travels with that build and
  sets the production CSP, Permissions-Policy, downloadable-binary response
  headers, and immutable caching for hashed assets and the original WebP
  artwork.” (25 words)
- Why this fails: the sentence mixes security, downloads, caching, and artwork.
- Rewrite: “`site/public/staticwebapp.config.json` sets the CSP and Permissions
  Policy. It also sets download headers and caching for hashed assets and
  artwork.”

#### F-1-13 — A heading is vague and promotional

- Quote/location: CLI reference heading “Made for actual archives.”
- Why this fails: “actual” is an unsupported adjective and the heading does
  not name the behavior listed beneath it.
- Rewrite: **CLI behavior on large archives**.

#### F-1-14 — A heading uses subjective filler

- Quote/location: recipes heading “Two useful recipes.”
- Why this fails: “useful” adds no information and the heading is weaker out of
  context.
- Rewrite: **Example search recipes**.

#### F-1-15 — Operation terminology and spelling are inconsistent

- Exact locations: “Normalize modules,” “Normalises common module aliases,”
  “active operations,” “editing steps,” and README “edit operations.”
- Why this fails: “module,” “operation,” and “step” appear interchangeable,
  while “Normalize” and “Normalises” mix US and UK spelling on one page.
- Concrete fix: retain “editing step” for the user-facing concept, define once
  that editors store it as an “operation,” and use **Normalise operation names**
  everywhere technical.

#### F-1-16 — Several button labels do not name their result

- Exact locations: header **Try it**, demo **Start for real**, and six terminal
  or recipe buttons labeled only **Copy**.
- Why this fails: “it,” “real,” and “Copy” require nearby context and do not
  survive a controls-only screen-reader list.
- Concrete fix: use **Try sample data**, **View install options**, and **Copy
  command**. Keep the already clear **Try it with sample data**, **Find matching
  files**, and **Download audit recipes**.

### Minor — unlisted claims

Each item below is claim-like copy with no matching `.factory/claims.json`
entry. A nearby broad test is not a registry entry for the quoted behavior.

#### F-1-17 — MIT/free claim is unlisted

- Quote/location: landing fact “Free under the MIT License”; README “MIT © 2026
  Sociobot (Param Factory).”
- Concrete fix: add one `@claim:mit-license` test that checks the shipped
  license and visible copy, or remove the hero claim.

#### F-1-18 — 10,000-sidecar terminal result is unlisted

- Quote/location: CLI example “Indexed 10,000 sidecars (9,998 parsed, 2
  warnings).”
- Concrete fix: add a deterministic 10,000-sidecar claim test, including the
  stated counts, or replace the numbers with clearly labeled schematic output.

#### F-1-19 — 247-match terminal result is unlisted

- Quote/location: CLI example “MATCHES 247.”
- Concrete fix: test a fixture that returns exactly 247, or remove the number
  and label the pane as illustrative output.

#### F-1-20 — 10,000-record report result is unlisted

- Quote/location: CLI example “Report with 10,000 records written to
  audit.html.”
- Concrete fix: add an exact report-count test or use non-quantitative,
  explicitly illustrative output.

#### F-1-21 — 89-result automation example is unlisted

- Quote/location: the masking pipeline output is “89.”
- Concrete fix: add a fixture asserting 89 results or remove the unexplained
  number.

#### F-1-22 — Single-binary/runtime claim is unlisted

- Quote/location: README: “Edit Trail starts at `0.1.0` and ships as one binary
  with no runtime service.”
- Concrete fix: add a packaged-artifact test proving the single executable has
  no service dependency, or reduce this to the already tested download fact.

#### F-1-23 — Default-index behavior is unlisted

- Quote/location: README: “The default index is `.edit-trail.json` in the
  current directory.”
- Concrete fix: add `@claim:default-index-path` from a fresh temporary working
  directory or remove the promise.

#### F-1-24 — Synonym and vocabulary behavior is only partly tested

- Quote/location: README: “Use synonyms (`noise reduction` → `denoise`, `rotate
  and perspective` → `perspective`) or inspect the exact normalised
  vocabulary.”
- Verification: `local-sidecar-search` covers `denoiseprofile` → `denoise`, but
  does not test either documented phrase or the `operations` listing.
- Concrete fix: add a claim entry and assert both aliases plus the visible
  vocabulary, or document only the tested alias.

#### F-1-25 — Folder-opening behavior is unlisted

- Quote/location: README: “Build a self-contained, offline report and open the
  containing folder for a single result.”
- Concrete fix: split the sentence; keep the covered report claim and add a
  platform-safe `@claim:open-folder` test for `--open`.

#### F-1-26 — Index override and help completeness are unlisted

- Quotes/location: README: “The commands accept `--index <FILE>` when the index
  is stored elsewhere.” and “`edit-trail --help` and every subcommand’s help
  list all options.”
- Concrete fix: register and test the override and every help surface, or
  remove the completeness wording.

#### F-1-27 — Unknown-field behavior is unlisted

- Quote/location: README: “Unknown fields are ignored.”
- Concrete fix: add an unknown element and attribute to the sidecar claim
  fixture and assert a successful, unchanged result.

#### F-1-28 — Metadata-exclusion privacy claim is unlisted

- Quote/location: README says the index contains “never image bytes, EXIF
  location, captions, or other unrelated metadata.”
- Verification: the existing claim checks only that a separate RAW marker is
  absent; it does not seed or reject EXIF location or captions in a sidecar.
- Concrete fix: add those private fields to the fixture and assert their values
  are absent from JSON, CSV, and HTML outputs.

#### F-1-29 — Build-output locations are unlisted

- Quote/location: README: “Deployable output lands in `dist/`, with the site at
  `dist/site/index.html` and the Linux binary at
  `dist/site/downloads/edit-trail-linux-x86_64`.”
- Concrete fix: register this packaging claim and reuse the existing artifact
  verifier as its tagged test.

#### F-1-30 — Runtime-dependency claims are unlisted

- Quote/location: README: “No secrets, analytics, accounts, payment calls, or
  third-party runtime assets are required.”
- Concrete fix: add a claim entry whose test inspects the production bundle,
  storage, and request log, or narrow the sentence to the behaviors already
  covered by `browser-local`.

### Minor — missed leverage

#### F-1-31 — The install path serves only Linux users

- Exact location: first screen **Download for Linux**; README otherwise asks
  users to build from source.
- Why this matters: photographers commonly work on macOS and Windows, and a
  Rust toolchain is a disproportionate prerequisite for this narrow CLI.
- Concrete feature: publish versioned macOS arm64/x86_64 and Windows x86_64
  binaries beside Linux, verify each executable in isolated CI, and expose
  platform-named downloads. AI and sync are not justified here: local parsing,
  CSV/JSON export, and privacy are the product's advantage.

## Copy audit

Counts use whitespace-delimited words after Markdown/HTML punctuation is
removed; hyphenated terms count as one. Commands are not sentences. Every
sentence in the live landing page and README is listed below; headings,
controls, and claim fragments follow separately.

### Live landing-page sentences

| Words | Exact sentence |
| ---: | --- |
| 18 | For photographers using RAW editors, Edit Trail searches masking, denoise, crop, and other active operations across local sidecars. |
| 10 | The sample opens below with three sidecars ready to search. |
| 7 | Walk XMP, DOP, and PP3 files recursively. |
| 6 | Broken files become warnings, not roadblocks. |
| 18 | Edit Trail reads each supported sidecar, records active operations, and builds a small local index you can search. |
| 11 | Map editor-specific names and enabled states into one visible operation trail. |
| 15 | Require all operations or match any, then print paths, JSON, CSV, or a static report. |
| 6 | Paste XMP or choose local sidecars. |
| 9 | Parsing stays in this tab; files are never uploaded. |
| 11 | Files stay in browser memory and disappear when this tab closes. |
| 14 | Index an archive, find matching files, list operation names, or write an offline report. |
| 13 | The recipe pack covers masking, crop, denoise, reports, CSV, JSON, and hidden sidecars. |
| 6 | It is free with the CLI. |
| 11 | The download is generated in your browser and contains commands only. |
| 7 | No catalogue migration or upload is required. |
| 6 | Find photos by local editing steps. |
| 2 | Version 0.1.0. |

No landing-page sentence exceeds 22 words. No banned marketing word appears.

Dynamic sentences were also checked: “3 sidecars parsed locally.” (4),
“Choose operations, then search.” (4), “2 of 3 sidecars match all selected
operations.” (8), “No sidecar content yet.” (4), “Paste XML or choose a file.”
(6), “Could not parse pasted-sidecar.xmp.” (4), “Check that its XML is
complete.” (6), “No matching trails.” (3), and “Try ‘Any selected’ or choose
fewer operations.” (7). Hidden state copy was checked too: “Offline mode — the
demo and docs still work locally.” (9), “Command copied.” (2), “Could not
copy.” (4), “Select the command manually.” (4), and “This sidecar could not be
parsed.” (6).

### Live headings, controls, and claim fragments

| Words | Exact copy |
| ---: | --- |
| 5 | Local sidecar search / v0.1 |
| 6 | Find photos by their editing steps |
| 5 | Try it with sample data |
| 3 | Download for Linux |
| 3 | Copy install command |
| 4 / 6 / 5 | Runs on your computer / Works offline after the first visit / Free under the MIT License |
| 3 / 6 | How it works / Index editing steps in three commands |
| 2 / 2 / 2 | Scan sidecars / Normalize modules / Query combinations |
| 6 | Demo — sample data, nothing is saved |
| 2 / 3 | Reset demo / Start for real |
| 3 / 4 | Browser sidecar demo / Search sample editing steps |
| 2 / 2 / 2 | Choose sidecars / Reset sample / Match rule |
| 2 / 4 | Active operations / Find matching files |
| 2 / 3 | CLI reference / Use four commands |
| 4 | Made for actual archives |
| 4 / 4 / 4 | Continues past malformed sidecars / Honours darktable history boundaries / Normalises common module aliases |
| 7 / 5 | Uses exit code 3 for no matches / Produces a self-contained offline report |
| 5 | Read full CLI reference |
| 3 / 5 | Free command recipes / Download 12 archive audit recipes |
| 3 / 4 / 5 | 12 copy-ready commands / No account or payment / Plain text for any terminal |
| 3 / 3 | Download audit recipes / Two useful recipes |
| 3 / 4 / 4 | Install the CLI / Search your own sidecars / View install options |
| 2 / 3 / 3 / 2 | 100% local / 3 sidecar families / 0 pixels indexed / JSON automation ready |
| 7 | Indexed 10,000 sidecars (9,998 parsed, 2 warnings) |
| 2 / 7 / 1 | MATCHES 247 / Report with 10,000 records written to audit.html / 89 |

Navigation labels are **Try it**, **Docs**, **Recipes**, **Install**,
**Privacy**, **Terms**, and **Source**. Tab labels are **Index**, **Find**,
**Report**, and **Automate**. Operation labels are **color balance rgb**,
**crop**, **denoise**, **exposure**, and **masking**. The flagged headings and
controls are covered by F-1-13 through F-1-16.

### README sentences

| Words | Exact sentence |
| ---: | --- |
| 20 | Edit Trail is a local CLI for photographers who need to find RAW files by what was done to them. |
| **25** | It indexes XMP sidecars, normalises active edit operations across darktable, Adobe Camera Raw/Lightroom, and common generic schemas, then searches combinations such as “denoise + crop”. |
| 7 | It never reads or uploads image pixels. |
| 10 | The product site and live sidecar demo are at edit-trail-finder.sociobot.in. |
| 20 | Open the sample demo with one click; it runs in browser memory and does not save or upload selected files. |
| 9 | Download the prebuilt Linux executable from the product site. |
| 9 | Or build from source with a current Rust toolchain. |
| 14 | Edit Trail starts at 0.1.0 and ships as one binary with no runtime service. |
| 10 | Try the installed CLI without pointing it at your archive. |
| 14 | It creates a temporary three-sidecar archive, index, and offline report, then prints their paths. |
| 8 | Use `--output <DIRECTORY> --json` for a scripted run. |
| 7 | Index every supported sidecar under an archive. |
| 9 | The default index is `.edit-trail.json` in the current directory. |
| 7 | Find files where both modules are active. |
| 17 | Use synonyms (`noise reduction` → `denoise`, `rotate and perspective` → `perspective`) or inspect the exact normalised vocabulary. |
| 11 | Script against stable JSON, or export a spreadsheet without exposing pixels. |
| 14 | Build a self-contained, offline report and open the containing folder for a single result. |
| 11 | The commands accept `--index <FILE>` when the index is stored elsewhere. |
| 9 | `edit-trail --help` and every subcommand’s help list all options. |
| **26** | Exit codes are `0` for success, `1` for I/O or parse failures, `2` for invalid CLI usage, and `3` when a `find` query has no matches. |
| 10 | `--json` keeps stdout machine-readable; progress and diagnostics go to stderr. |
| 4 | Unknown fields are ignored. |
| 16 | Malformed sidecars are recorded as warnings, so one bad file does not stop a large archive. |
| **26** | The index contains sidecar paths, inferred source-image paths, modification timestamps, editor family, active operation names, and warnings—never image bytes, EXIF location, captions, or other unrelated metadata. |
| 7 | Requirements: Rust 1.85+, Node 20+, and npm. |
| 12 | `npm run build` compiles the release binary and the Vite documentation site. |
| 16 | Deployable output lands in `dist/`, with the site at `dist/site/index.html` and the Linux binary at `dist/site/downloads/edit-trail-linux-x86_64`. |
| 19 | Package readiness can be checked with `cargo package --allow-dirty` (the factory owns publishing credentials; this repository does not publish). |
| 14 | The factory deploys `dist/site` to Azure Static Web Apps at the static product domain. |
| **25** | `site/public/staticwebapp.config.json` travels with that build and sets the production CSP, Permissions-Policy, downloadable-binary response headers, and immutable caching for hashed assets and the original WebP artwork. |
| 12 | No secrets, analytics, accounts, payment calls, or third-party runtime assets are required. |
| 6 | MIT © 2026 Sociobot (Param Factory). |
| 2 | See LICENSE. |

README headings are **Edit Trail** (2), **Install** (1), **Usage** (1),
**Schema support and privacy** (4), **Develop and verify** (3), **Deployment**
(1), and **License** (1). Its four schema bullets contain 9, 11, 9, and 10
words respectively. The four over-limit sentences are F-1-9 through F-1-12.

## Claims verification

Dependencies were installed with `npm ci`. Every exact command from
`.factory/claims.json` was then run independently; all exited 0.

| Claim ID | Result | Observable evidence |
| --- | --- | --- |
| `sample-demo` | PASS | Desktop and mobile: two of three result records. |
| `linux-download` | PASS | Desktop and mobile: downloaded ELF, correct name, over 100 KB. |
| `recipe-download` | PASS | Desktop and mobile: text download contains 12 commands. |
| `browser-local` | PASS | Desktop and mobile: selected in-memory XMP parsed; no external request or browser-storage write. |
| `offline-reload` | PASS | Dedicated contexts reloaded offline and completed the two-of-three search. |
| `local-sidecar-search` | PASS | One desktop CLI run checked XMP/DOP/PP3, alias, history boundary, malformed input, combinations, and no RAW marker. |
| `cli-outputs` | PASS | One desktop CLI run parsed JSON, checked CSV schema, and found no external URL in the HTML report. |
| `cli-contract` | PASS | One desktop CLI run returned exit codes 0, 1, 2, and 3. |

No declared claim test failed and no declared claim remains untested. The
unlisted claims are F-1-17 through F-1-30.

## Sandbox and privacy evidence

- The live browser flow requested only
  `https://edit-trail-finder.sociobot.in`; selecting/parsing data made no
  request.
- Demo work stayed in memory. Session storage and IndexedDB remained empty. A
  pre-existing `real:test-sentinel` local-storage value remained unchanged.
- **Reset demo** restored the three-sidecar input after malformed input and
  cleared results. It does not auto-run the search, which is part of F-1-1.
- The release CLI was run as
  `edit-trail demo --output <new-temp-directory> --json`. It produced three
  sidecars, an index, and a self-contained report, with two matches. Reusing
  the directory was rejected with exit code 1.

## History verification

No earlier `.factory/review-*.md` or `.factory/polish-*.md` files exist. The
earlier `.factory/handoff.md` records three repair areas; each was checked in
both source and the live product:

| Earlier repair | Result |
| --- | --- |
| Linux link served landing HTML | Confirmed fixed: live 200 attachment, ELF bytes; `linux-download` passed. |
| Unregistered checkout/license flow | Confirmed fixed: no checkout, license, or Sociobot API reference in shipped source or live copy; recipe download passed. |
| Mobile type and direct targets | Confirmed fixed live at 390 px: body 17 px, brand and CLI-reference link 44 px, no horizontal overflow. |

The handoff's additional claims about the demo and routing are not all
satisfied: F-1-1 through F-1-3 and F-1-5 describe the current live behavior.

## Structure, accessibility, and visual identity

- Root, Privacy, Terms, and the designed 404 return the expected 200/404
  statuses, have `lang="en"`, one `h1`, and one `main`. Root and legal titles
  follow the required pattern. The demo mismatch is F-1-5.
- Every discovered internal and GitHub link returned 200; the intentionally
  missing route returned the designed 404 with a way home.
- Browser Back restored the prior URL and scroll position but not focus.
- `/opt/fleet/lib/verify-url.sh` passed with a 719 ms load, no console errors,
  one `h1`, one main landmark, and no missing alt or button names.
- Live Playwright axe checks found zero WCAG 2 A/AA violations, including zero
  serious/critical violations, on home, demo, Privacy, Terms, and 404.
- The sidecar-night-market art, clipped-ticket geometry, cyan/pink/amber
  palette, mono type, and dense result rhythm are recognisably product-specific
  rather than a generic SaaS template. Asset provenance is recorded in
  `.factory/design.md`.
- The landing-page JS is 12.20 KB before gzip (4.83 KB gzip), below budget.

## Missed-leverage conclusion

The product already imports local sidecars and exports JSON, CSV, and offline
HTML. Sync would contradict its local/private value, and an AI feature would
not improve deterministic metadata search. Cross-platform prebuilt binaries
are the one obvious missing extension; see F-1-31.

## What would make this perfect

Resolve every finding above: make the sample results truly one click, make the
demo exit real, either support PP3 in-browser or stop advertising it there,
keep all three facts above the fold, repair route semantics/focus and metadata,
standardise the shell and response policy, rewrite every flagged string, and
register or remove every unlisted claim. Add macOS and Windows release
artifacts with tests. Re-run this entire review from fresh mobile and desktop
contexts; PASS requires zero remaining findings.
