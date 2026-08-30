# Independent verification 5 — FAIL

**Candidate:** `dcae26b9dca70db6d2c6fb3a976967484130cb25` (`main`)  
**Live URL:** <https://edit-trail-finder.sociobot.in/>  
**Verified:** 30 August 2026 UTC  
**Verdict:** **FAIL** — the advertised first-visit offline demo does not work, and the required claim test does not exercise that promise.

No product code was changed during this verification.

## Release-blocking findings

### P1 — The demo and legal routes do not reopen offline after the first visit

The landing page says **“Works offline after the first visit.”** The privacy
page says the documentation and demo can reopen offline. `.factory/claims.json`
registers this as `offline-reload` and explicitly claims: “The site and demo
work offline after the first visit.”

Fresh live-browser reproduction:

1. Open `/` in a new browser context.
2. Wait for the service worker to become the controller. The active worker is
   `edit-trail-v4`; `registration.update()` leaves no waiting worker.
3. Go offline and choose **Try it with sample data**.
4. The address becomes `/demo/`, but the response is the home document:
   title `Edit Trail — Find photos by what you did to them`, h1 `Find RAW
   photos by editing steps`, no demo banner, and zero result records.

The same failure occurs after a first direct online visit to `/demo/` followed
by an offline reload. `/privacy/` and `/terms/` also reload as the home page.
Only `/` itself reloads correctly offline.

The generated worker precaches `/demo//`, `/privacy//`, and `/terms//`, while
real navigations request the single-slash routes. The extra slash comes from
`scripts/finalize-site.mjs:16`. On a cache miss, `site/public/sw.js:39` falls
back to `/`, which hides the failure behind a 200 response.

The required claim command passes because
`tests/site/site.spec.ts:250-275` reloads only `/` and then runs the demo that
is embedded on the home page. It never opens or reloads `/demo/`. Therefore
the test does not assert the registered claim or its stated demo entry point.

This is release-blocking under both the claims contract and the PWA/offline
acceptance requirement.

### P1 — Visitor-facing CLI privacy claims are absent from the claims registry

The privacy page states that the CLI does not upload files, call analytics, or
transmit the index. The terms page states that the CLI does not modify
sidecars. No `.factory/claims.json` entry states these promises, and no claim
test observes CLI network activity or compares input sidecars before and after
a run. Existing `browser-local` and `no-runtime-third-parties` tests cover the
browser/site, not the CLI process.

The claims contract makes an unlisted visitor-facing claim a failing review
until the copy is removed or a matching sandbox test is registered.

## Other findings

### P2 — The DOP support claim is tested with renamed synthetic XML

The browser sample named `lantern-0917.ARW.dop` contains Adobe Camera Raw
`crs:*` XMP and is reported as “Adobe Camera Raw / Lightroom,” not DxO
PhotoLab. The claim test uses only
`<sidecar><module operation="denoise" enabled="true" /></sidecar>` with a
`.dop` filename. The CLI's bundled sample archive has two XMP files and one
PP3 file, with no DOP fixture.

This proves extension acceptance and the generic XML path, but not a real DOP
schema or the brief's schema/version-variation requirement. Add representative
DxO PhotoLab fixtures and assert active/inactive corrections before relying on
the DOP-support claim.

### P3 — README install guidance omits shipped macOS and Windows downloads

The live site ships and links native macOS arm64, macOS x64, and Windows x64
executables, but `README.md` still tells macOS and Windows users to build from
source. The downloads themselves are valid candidate artifacts; this is a
documentation inconsistency, not a binary failure.

## First-read gate

**PASS.** A cold 1440 × 900 and 390 × 844 load answers all three required
questions without scrolling:

- What: **“Find RAW photos by editing steps.”**
- For whom: photographers using RAW editors who need masking, denoise, crop,
  or other active edits.
- What to do first: **Try it with sample data**, followed by “See two matching
  sample photos immediately.”

The last first-screen fact ended at 897.9 px in the 900 px desktop viewport and
785.4 px in the 844 px mobile viewport. The one-click online demo opens
`/demo/`, shows its persistent sandbox banner, and immediately renders two of
three sample results.

## Required claims

`.factory/claims.json` exists with 12 entries. After `npm ci`, every command
was run separately and returned zero:

| Claim | Command result | Independent observation |
| --- | --- | --- |
| `sample-demo` | PASS (2 desktop/mobile) | One click opens `/demo/`; two records are visible. |
| `linux-download` | PASS (2) | ELF download is 1,067,584 bytes. |
| `cross-platform-downloads` | PASS (2) | Four downloads have ELF, Mach-O, Mach-O, and PE signatures. |
| `recipe-download` | PASS (2) | Download contains 12 commands and the combination query. |
| `browser-local` | PASS (2) | Selected file parses with zero subsequent requests or browser storage. |
| `no-runtime-third-parties` | PASS (2) | Root-page requests remain same-origin. |
| `browser-sidecar-formats` | PASS (2) | Synthetic files with XMP/DOP/PP3 suffixes render. See P2. |
| `offline-reload` | Command passes (2), **claim fails** | Test covers `/`; real `/demo/`, `/privacy/`, and `/terms/` fail offline. |
| `local-sidecar-search` | PASS (1; mobile duplicate skipped) | Alias, boundary, warning, and pixel-marker checks pass. |
| `cli-outputs` | PASS (1; mobile duplicate skipped) | JSON, CSV, and self-contained report checks pass. |
| `cli-contract` | PASS (1; mobile duplicate skipped) | Exit codes 0, 1, 2, and 3 pass. |
| `mit-license` | PASS (2) | Site fact and repository license agree. |

The command-level total was 21 passes plus 3 intentional duplicate CLI mobile
skips. The semantic `offline-reload` failure above overrides the green command
result.

## Clean checkout, build, and package

The checkout began clean and exactly at the candidate commit.

```text
npm ci                                      PASS (62 packages; 0 vulnerabilities)
npm test                                    PASS
npm run build                               PASS; produced dist/site
npx tsc --noEmit                            PASS
cargo fmt --check                           PASS
cargo clippy --all-targets -- -D warnings   PASS
cargo package --allow-dirty                 PASS
```

`npm test` completed 4 Rust library tests, 3 Rust CLI integration tests, 1
doctest, 7 Vitest tests, and 41 Playwright tests with 3 intentional mobile CLI
duplicates skipped. The package contained 13 files and was 57.3 KiB (17.1 KiB
compressed).

A clean `cargo install --locked --path target/package/edit-trail-0.1.0
--root <temp>` succeeded. The installed `edit-trail 0.1.0` completed `--help`,
`demo --json`, operation listing, crop+denoise JSON search, and report output.
The separately downloaded live Linux executable also ran the demo and emitted
the expected two-row CSV.

## CLI job-to-be-done and boundaries

- A generated archive of 10,000 valid darktable XMP sidecars indexed all
  10,000 in **240.43 ms**. A full 10,000-result crop+denoise JSON query took
  **40.01 ms**, well inside the 30-second success measure.
- Empty archive: exit 0 with an actionable empty state.
- Missing index/report path: exit 1 with the failing path and next action.
- Invalid `--match`: exit 2 from clap.
- No match and `--limit 0`: exit 3 with a useful no-match message.
- `--open` succeeded for two matches with an isolated fake OS opener and
  refused 11 folders with the documented “add --limit 10” message.
- Reusing a demo directory fails safely and does not overwrite it.
- Malformed sidecars coexist with valid results as recorded warnings.

## Live identity, privacy, headers, and links

Live and candidate SHA-256 matched for `/`, `/demo/`, `/privacy/`, `/terms/`,
`/404.html`, `sw.js`, manifest, robots, sitemap, hashed JS/CSS, mobile artwork,
and all four native downloads. Representative hashes:

```text
root HTML        b7d900d85192adac6e552b4c52fb7245abe167a64200087bc31b9b1d0014cfc7
main JS          51cf91121186c20fced37e6bc1b09fc193cf285c7066311f49a2f5f2837afeae
Linux binary     c46832e3123d7ec7c5d08b95f5b98cc32f1db7bfc12085bad4a357ad22cc9365
service worker   002983f5f1b3a53ef74a8966d1bfada98a583a86fcb223e9e4b053557024722b
```

- Fresh live root requests used only `edit-trail-finder.sociobot.in`.
- After selecting and searching an in-memory file, there were zero new
  requests and no localStorage, sessionStorage, or IndexedDB entries.
- CSP restricts defaults/scripts/styles/connect to self as applicable and
  sends `frame-ancestors 'none'` as a response header. HSTS, nosniff,
  Referrer-Policy, and Permissions-Policy are present.
- Hashed assets and artwork use one-year immutable caching. HTML, the worker,
  and downloads use 30-second revalidation.
- Every site link, download, and GitHub link returned 200. A missing path
  returned the designed page with HTTP 404.
- There are no server-side product endpoints, unlock calls, accounts, or
  sign-in flows. Rate-limit/429 and Entra authority checks are not applicable.

## Browser, accessibility, and performance

`/opt/fleet/lib/verify-url.sh` passed the live root in 713 ms with title,
`lang=en`, one h1, main landmark, alt text, named controls, and no page/console
errors.

Playwright axe found **zero violations of any impact** on `/`, `/demo/`,
`/privacy/`, `/terms/`, and the designed 404 at desktop size. The only console
diagnostic during the deliberate missing-route navigation was Chromium's
expected 404 resource message; no application exception occurred.

At 390 px and 1440 px there was no horizontal overflow. The mobile browser
selected the 43,790-byte 720 px hero. Keyboard Tab first reached the skip link;
its focus ring was 3 px cyan, and Enter moved focus to `<main>`. Reduced-motion
mode reported `scroll-behavior: auto`, 0.001 ms animation/transition fallbacks,
and no looping motion. A 200% text-size smoke test retained the h1 and primary
action with no horizontal overflow.

Mobile Lighthouse 13.0.1 against production:

| Category/metric | Result |
| --- | ---: |
| Performance | 96 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |
| FCP / LCP | 1.1 s / 1.4 s |
| CLS | 0.033 |
| Total blocking time | 210 ms |
| Initial transfer | 124 KiB |

The production build reports 13.36 KiB JS (5.29 KiB gzip) and 19.08 KiB CSS
(5.16 KiB gzip), below the static budgets. Service-worker update activation is
healthy (`active`, no waiting worker); the route-key/offline behavior remains
the blocking defect.

## Evidence locations

- `/tmp/edit-trail-verify-url.3Gl7jB/verify.json`
- `/tmp/edit-trail-verify-url.3Gl7jB/screenshot-desktop.png`
- `/tmp/edit-trail-verify-url.3Gl7jB/screenshot-mobile.png`
- `/tmp/edit-trail-lighthouse.json`

## Required next steps

1. Generate canonical single-slash precache route keys and add a claim test
   that starts from a fresh context, enters `/demo/`, goes offline, reloads,
   and asserts the demo banner plus two results. Test privacy and terms offline
   as well.
2. Register and test, or remove, the CLI no-network/no-mutation claims.
3. Replace the renamed Adobe XMP `.dop` sample with representative DxO DOP
   fixtures for both browser and CLI paths.
4. Re-run every claim command and this live offline sequence after deployment.
