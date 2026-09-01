# Independent verification 11 — FAIL

Verified candidate: `5283a4ef664d4c1664816e0cea013e2036de4267`  
Live URL: <https://edit-trail-finder.sociobot.in/>  
Verification date: 1 September 2026

## Verdict

**FAIL.** The core CLI, demo, privacy boundary, deployment identity, and standard
accessibility checks pass. The candidate is not ready to release because the
390 px first screen loses visible content when text is enlarged to 200%. The
hero clips the word “editing” at its right edge. This does not meet the required
accessibility baseline that text resize must preserve content.

## Required claims preflight

`.factory/claims.json` is present with 18 entries. After `npm ci`, every exact
`test` command in the manifest completed with exit code 0. Each claim tag occurs
exactly once in the test sources.

| Claim | Result |
| --- | --- |
| `sample-demo` | PASS |
| `linux-download` | PASS |
| `cross-platform-downloads` | PASS |
| `recipe-download` | PASS |
| `browser-local` | PASS |
| `no-runtime-third-parties` | PASS |
| `browser-sidecar-formats` | PASS |
| `offline-reload` | PASS |
| `local-sidecar-search` | PASS |
| `cli-private-read-only` | PASS |
| `cli-outputs` | PASS |
| `cli-contract` | PASS |
| `mit-license` | PASS |
| `cli-demo-recording` | PASS |
| `local-only-boundary` | PASS |
| `default-index-path` | PASS |
| `open-folder` | PASS |
| `deployment-artifact` | PASS |

The live page and README were also compared with this manifest. No material
product claim was found without a corresponding claim entry and observable
test.

## First-read gate

The cold live first screen passes. It says **“Find RAW photos by editing
steps,”** identifies photographers using RAW editors, and shows **“Try it with
sample data”** with the nearby outcome **“Opens three samples and shows two
matches.”** One click opens `/demo/` with two crop-and-denoise matches from
three samples and the persistent sample-data notice.

## Clean checkout and build evidence

- The checkout began clean at the exact candidate commit.
- `npm ci`: passed; 62 packages installed and npm reported 0 vulnerabilities.
- `npm test`: passed. Results include 6 Rust library tests, 3 Rust CLI tests,
  1 doctest, 12 Vitest tests, and 51 Playwright tests; 7 duplicate mobile CLI
  cases were intentionally skipped.
- `cargo fmt --check`: passed.
- `cargo clippy --all-targets --all-features -- -D warnings`: passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed and produced `dist/site` with the static site and
  native downloads.
- `cargo package --allow-dirty`: passed; the crate contained 16 files, was
  67.3 KiB unpacked and 19.7 KiB compressed.
- The packaged crate installed into a new temporary Cargo root. The installed
  `edit-trail 0.1.0` completed `demo --json`, created three sidecars, and found
  two matches.

## CLI product checks

The normal workflow indexed the bundled XMP, DOP, and PP3 files, found the
expected crop-and-denoise records, emitted JSON and CSV, and wrote a standalone
HTML report. The downloaded live Linux executable completed the same demo and
query with two matches.

Additional checks confirmed that:

- uppercase `.XMP` files are included;
- hidden files are excluded by default and included with `--include-hidden`;
- a followed symbolic-link cycle becomes a warning and does not stop the scan;
- malformed sidecars become warnings while valid records remain searchable;
- operation aliases and letter case normalize as documented;
- report text escapes special filename characters;
- invalid match modes return 2 with the allowed values;
- an unreadable index, missing archive, or reused demo directory returns 1
  with a recovery instruction.

A generated 10,000-sidecar archive indexed in **242 ms**. A crop query returned
all 10,000 records in **35 ms**, below the brief's 30-second success measure.

## Live deployment, privacy, and identity

The factory URL check returned HTTP 200 in 942 ms with the expected title,
`lang=en`, one h1, one main landmark, complete image alternatives, named
buttons, and no console or page errors.

`node scripts/verify-live.mjs` passed 114 checks with zero console errors, zero
cross-origin runtime requests, and zero Axe WCAG 2 A/AA findings across home,
demo, privacy, terms, and 404. Independent desktop and 390 px browser sessions
also recorded no console errors, page errors, cross-origin requests, or Axe
serious/critical findings. Keyboard checks confirmed the skip link, navigation,
forms, and 3 px cyan focus indicator. Reduced-motion mode left no meaningful
animation or transition duration.

All **31 of 31** served build artifacts matched `dist/site` byte-for-byte,
including route HTML, JS, CSS, fonts, artwork, the service worker, and all four
native executables. The live Linux binary SHA-256 was
`2e7eac299870c3ce22c92f1373080df13377b3cad0d00bf42038875de7ead98e`.

The root and legal routes return the declared CSP, HSTS,
`X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` headers.
Hashed assets use `public, max-age=31536000, immutable`; downloads have binary
content types and attachment names. The `edit-trail-v6` service worker updated
without a waiting worker, and `/demo/` reloaded offline with two results.

This is a static product with no server-side product endpoint, sign-in, paid
feature, or product-unlock call. Request-allowance/429 and identity-provider
checks are therefore not applicable. The shipped product is explicitly free
and MIT licensed.

## Performance

The live mobile transfer used 6,448 bytes of JS, 5,910 bytes of CSS, 21,472
bytes of fonts, and a 43,790-byte hero image. These are within the supplied
budgets. The search interaction changed the painted result in 62 ms.

Mobile Lighthouse results:

- Performance: 99
- Accessibility: 100
- Best practices: 100
- SEO: 100
- LCP: 1.5 s
- CLS: 0.032
- TBT: 100 ms
- Total transfer: 128 KiB

## Findings by severity

### High — 200% text resize clips first-screen content

At a 390 × 844 viewport, enlarging computed text sizes to 200% makes the
document 512 px wide. The hero reports 390 px available width, 442 px scroll
width, and `overflow-x: hidden`. The visible headline is cut off during the
word “editing,” with no way to reveal the hidden portion inside the hero.

Evidence:
`.factory/evidence/verification-11-live/home-mobile-text-200.png` (ignored by
repository policy). Confirm the repair at 390 px with text at 200%, including
the headline, first action, facts, proof strip, command tabs, and footer.

### Low — blank operation values are treated as no-match queries

`edit-trail find --operation '   '` returns exit code 3 and prints a blank
operation in “No matches for …”. A blank operation is invalid input and should
return exit code 2 with a direct instruction to provide an operation name.

## Required next step

Allow enlarged hero text and its grid item to wrap within the viewport instead
of being clipped, then add a 390 px, 200%-text regression check. Also validate
normalized operation names before querying. Rerun all 18 manifest commands,
the complete quality gates, and the live accessibility checks after deployment.
