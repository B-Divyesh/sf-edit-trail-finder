# Independent verification 12 — PASS

Verified candidate: `390253a2695107473415e3afa6804d128eb4d731`
Live URL: <https://edit-trail-finder.sociobot.in/>
Verification date: 1 September 2026

## Verdict

**PASS.** The candidate satisfies the researched brief and release contract. The
local CLI, browser sample, static report, privacy boundary, accessibility,
offline behavior, native downloads, documentation, and deployment identity were
confirmed from a clean checkout and the live URL. No release-blocking defect was
found. One low-severity empty-state wording issue is recorded below.

## Required claims preflight

`.factory/claims.json` is present with 18 entries. After the locked dependency
install, every exact `test` command in the manifest completed with exit code 0.
Each claim tag occurs exactly once in the test sources.

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

The live page and README were checked against the manifest. No material product
claim lacks a corresponding claim entry and observable test.

## First-read gate

The cold live first screen passes. It says **“Find RAW photos by editing
steps,”** identifies photographers using RAW editors, and makes **“Try it with
sample data”** the first action. The nearby sentence says that it opens three
samples and shows two matches. One click opens `/demo/` with two
crop-and-denoise matches and the persistent sample-data notice.

## Clean checkout and build evidence

- The checkout began clean at the exact candidate commit.
- `npm ci`: passed; 62 packages installed and npm reported 0 vulnerabilities.
- `npm test`: passed. Results include 6 Rust library tests, 3 Rust CLI tests,
  1 doctest, 12 Vitest tests, and 53 Playwright tests. Seven duplicate mobile
  CLI cases were intentionally skipped.
- `npm run copy:audit:check`: passed; the longest audited sentence has 18 words.
- `cargo fmt --check`: passed.
- `cargo clippy --all-targets --all-features -- -D warnings`: passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed and produced `dist/site` with the static site and four
  native downloads.
- `cargo package --allow-dirty`: passed; 16 files, 68.2 KiB unpacked and
  19.8 KiB compressed.
- The packaged crate installed into a new temporary Cargo environment. Its
  public `--help`, `demo --json`, and crop-plus-denoise query all passed.

## End-to-end product checks

The independently installed CLI created its isolated three-sidecar demo,
indexed XMP, DOP, and PP3 data, produced its offline report, and returned two
crop-and-denoise records. Normal JSON output was parseable.

Boundary and recovery checks confirmed:

- a whitespace-only operation returns code 2 and names a valid example;
- a missing index returns code 1 and says to index the archive first;
- a query with no matches returns code 3 and suggests listing operations;
- an existing demo directory returns code 1 and asks for a new directory;
- malformed sidecars become warnings while valid records remain searchable;
- the browser demo reports incomplete XML, supports a zero-sidecar state, and
  returns to two sample results after **Reset demo**.

A generated 10,000-sidecar archive indexed in **243 ms**. A crop query returned
all 10,000 records in **30 ms**, well below the brief's 30-second success
measure.

## Live deployment, privacy, and identity

`/opt/fleet/lib/verify-url.sh` passed: HTTP 200 in 685 ms, the expected title,
`lang=en`, one h1, a main landmark, complete image alternatives, named buttons,
and no console errors.

`node scripts/verify-live.mjs` passed 114 checks with zero console errors, zero
third-party runtime requests, and zero Axe WCAG 2 A/AA findings across home,
demo, privacy, terms, and 404. Independent desktop and 390 px sessions also had
zero page errors and zero serious/critical Axe findings. Keyboard checks
confirmed the skip link, main-content focus, navigation behavior, and a 3 px
cyan focus indicator. Reduced-motion mode reduced the tested transition and
animation durations to effectively zero and used automatic scrolling.

The repaired 390 × 844 / 200%-text state passes. The document and hero are both
390 px wide; the headline uses its 342 px content width and stays within the
hero. The first action, facts, proof strip, command tabs, and footer remain
available. The command tabs retain intentional local horizontal scrolling.

All **32 of 32** publicly served build files match `dist/site` byte-for-byte.
`staticwebapp.config.json` correctly returns 404 rather than being public. The
live Linux executable matches the local production artifact with SHA-256
`c3819a1a2deb86e034e0d24fa2f26e809cd4febf6876146a73edd96ea665c8e4`.
That downloaded executable completed the demo and returned two matches.

The live root and legal pages return the declared CSP, HSTS,
`X-Content-Type-Options`, `Referrer-Policy`, and `Permissions-Policy` headers.
Hashed assets use `public, max-age=31536000, immutable`; HTML and native
downloads use 30-second revalidation, and downloads have attachment filenames
and binary content types. Internal routes, the sitemap routes, and the two
GitHub destinations return successful responses; an unknown route returns the
designed HTTP 404 page.

The full demo flow made requests only to the product origin. The source check
found no analytics, account, payment, license, or sign-in runtime. The product
is static and has no server-side product endpoint, so a request-allowance 429
check is not applicable. It also has no sign-in flow, so an identity-provider
check is not applicable. Deterministic local sidecar parsing is appropriate for
the job; no missing model-assisted step was identified.

The service worker reached `activated`, had no waiting or installing worker,
and used cache `edit-trail-v6`. With the browser offline, `/demo/` reloaded with
its own title, three samples, and two results. Privacy and terms also reloaded
offline in the full live verifier.

## Performance and budgets

The live 390 px first load transferred 6,448 bytes of JavaScript, 5,948 bytes
of CSS, 21,472 bytes of fonts, and a 43,790-byte hero image. All are within the
supplied budgets. A browser-side search updated its result in 1 ms.

Mobile Lighthouse results:

- Performance: 98
- Accessibility: 100
- Best practices: 100
- SEO: 100
- FCP: 1.2 s
- LCP: 1.6 s
- CLS: 0
- TBT: 140 ms
- Total transfer: 128 KiB

## Findings by severity

### Critical

None.

### High

None.

### Medium

None.

### Low — zero-sidecar guidance names filters before input

After clearing the pasted sidecar data and choosing **Find matching files**, the
demo correctly reports `0 of 0 sidecars`. Its empty message says to use **Any
selected** or choose fewer operations. Those changes cannot produce a result
without sidecars. The paste field and **Choose sidecars** action remain visible,
so recovery is available, but the message should first say to paste or choose a
sidecar.

## Evidence

Browser captures and machine-readable live results are under
`.factory/evidence/verification-12-live/` and
`.factory/evidence/verification-12-url/` in the verification workspace. These
paths are excluded from commits by repository policy.
