# Independent product verification — FAIL

**Work order:** `edit-trail-finder-verify-3`

**Candidate:** `4fd6bfd6185fc89ae0ede6466fb688721aa5418c`

**Live URL:** <https://edit-trail-finder.sociobot.in/>

**Verified:** 2026-08-28 08:01 UTC from a fresh detached worktree at the exact candidate SHA

## Verdict

**FAIL.** The candidate builds, tests, packages, and performs its local CLI job
successfully. The malformed-sidecar console defect from verification 2 is
fixed. However, the live primary download serves the landing-page HTML rather
than the candidate executable, so the deployed product does not match the
candidate and a visitor cannot install the advertised binary. The optional
paid checkout is also unregistered, and the product's billing verification
endpoint did not rate-limit either of two rapid bursts. These are fresh live
observations, not inherited builder claims.

## Defects

### P1 — the live Linux download is HTML, not the candidate executable

The primary **Download for Linux** link targets
`/downloads/edit-trail-linux-x86_64`. The exact production build contains the
expected executable:

- candidate file: 1,050,568 bytes
- candidate SHA-256:
  `87da989bb84de8e4fe66f1524558489a25be27ca2f57d191f7da728835a79a5a`

Fresh HTTPS requests to that same live path instead return:

```text
HTTP/2 200
content-type: text/html
content-length: 11812
cache-control: public, must-revalidate, max-age=30
```

The returned body starts with `<!doctype html>` and has SHA-256
`e58734606051a6b009773f3fe507e7d252a7d2b4586e21a9836316a2ec64616d`,
exactly the live landing page. A real Chromium click reports a successful
download named `edit-trail-linux-x86_64.html`, also 11,812 bytes. This blocks
the advertised install path for the smallest useful product.

The live root, hashed JS/CSS, service worker, legal pages, and mobile hero do
match the candidate byte-for-byte. The binary mismatch therefore makes the
deployment incomplete rather than generally stale.

### P1 — the advertised one-time purchase cannot start

The live **Buy Supporter license** link points to the required Sociobot API,
but a fresh `GET` to
`https://api.sociobot.in/api/v1/products/edit-trail-finder/checkout` returns:

```text
HTTP/2 404
content-type: application/json

{"error":"enabled factory product","status":404}
```

The optional paid path is therefore not end-to-end. Product registration is
factory-owned, but the live acceptance result remains a failure.

### P1 — billing verification endpoint has no observable rate limit

The shipped unlock calls
`GET /api/v1/products/edit-trail-finder/verify?license=<token>`. A first rapid
sequence of 200 invalid-token requests returned 200 for every request and no
`Retry-After`. A second 500-request burst at concurrency 25 also returned:

```text
500 200|
```

No 429 was observed through 700 rapid requests, so the observed threshold is
**greater than 700 (effectively absent for this test)** and no `Retry-After`
could be recorded. This fails the explicit server-endpoint rate-limit gate.
Normal verification otherwise returns `valid:false`, `reason:"invalid"`,
`Cache-Control: no-store`, and correct product-origin CORS headers.

### P2 — mobile type and two direct link targets miss the supplied UI baseline

At 390 px, computed body text remains 16 px although the supplied design
baseline requires at least 17 on mobile; visible supporting text reaches 12
px. The header home link is 147 × 34 px and **Read full CLI reference** is
200 × 19 px, below the required 44 px target height. Checkbox/radio controls
are enclosed by 44 px labels and were not counted as failures.

## Clean-checkout gates

A detached worktree was created at the exact candidate SHA. The starting tree
was clean. Toolchain: Node 22.23.2, npm 10.9.8, Rust 1.98.0, Cargo 1.98.0.

- `npm ci`: 62 packages installed; 0 vulnerabilities.
- `npm test`: passed 4 Rust unit tests, 2 Rust CLI integrations, 1 Rust
  doctest, 5 Vitest tests, and 12 Playwright tests across desktop and 390 ×
  844 mobile.
- `npx tsc --noEmit`: passed.
- `cargo fmt --check`: passed.
- `cargo clippy --all-targets -- -D warnings`: passed.
- Exact `npm run build`: passed, including the response-policy guard; emitted
  `dist/site/` and the 1,050,568-byte release binary.
- `cargo package`: passed and verified 10 files, 52.3 KiB unpacked / 16.3 KiB
  compressed.

## Clean consumer and CLI acceptance

The packaged crate was installed outside the repository with:

```sh
cargo install --path target/package/edit-trail-0.1.0 --locked \
  --root /tmp/edit-trail-consumer3/install
```

The installed binary reports `edit-trail 0.1.0`; top-level and subcommand help
are non-interactive and useful. An external archive containing darktable XMP,
Adobe XMP with an uppercase extension, RawTherapee PP3, malformed DOP, a
hidden XMP, and a fake RAW pixel file produced the following verified behavior:

- default scan: 4 supported sidecars, 3 parsed, 1 warning; hidden XMP excluded;
- `--include-hidden`: 5 sidecars, with the hidden masking operation included;
- `noise reduction + crop --match all`: 3 correct matches, proving alias and
  combination handling across all three supported editor families;
- darktable history boundary and inactive operations were excluded;
- `operations --json`, JSON find, CSV find, and a 2,719-byte self-contained
  HTML report were valid;
- the fake RAW contents never appeared in the index or report;
- a stubbed system opener received the correct containing directory;
- more than 10 open targets was refused with actionable text and exit 1;
- empty archive succeeded with guidance; malformed sidecar did not abort;
- missing archive/index returned exit 1, invalid `--match` returned exit 2,
  and no-match/zero-limit queries returned exit 3.

A release-binary benchmark indexed 10,001 valid sidecars with no warnings in
0.254 seconds. The documented two-operation synonym query returned all 10,001
records in 0.133 seconds. This passes the under-30-second success measure by a
wide margin.

## Live browser, accessibility, privacy, and PWA evidence

Fresh Chromium contexts exercised desktop 1440 × 900 and mobile 390 × 844:

- normal demo: `2 of 3 sidecars` and the expected two filenames;
- blank input: explicit `0 of 0` state and recovery suggestion;
- malformed `<broken`: actionable parse error with zero console/page errors;
- local file chooser: `1 of 1` result and **zero requests** caused by selecting
  or parsing the sidecar;
- initial runtime request origins: product origin only; no analytics, CDN
  scripts/fonts, or upload traffic;
- returned invalid license was stored, removed from the URL, verified, and
  reconciled to a locked state with clear copy and no console errors;
- one `h1`, one `main`, `lang=en`, title, alt text, no horizontal overflow;
- zero serious or critical axe findings on home, privacy, and terms pages;
- keyboard skip link is first, visible, and reaches `#main`; tabs support arrow
  keys; the focus outline is `rgb(89, 243, 230) solid 3px`;
- reduced motion matched, animation/transition durations reduced to
  `0.000001s`, and smooth scrolling disabled;
- service worker controlled both viewports, `update()` left no waiting worker,
  cache `edit-trail-v2` was active, and offline reload retained the shell with
  the visible offline banner and no errors.

The factory `verify-url.sh` independently returned HTTPS 200, an 854 ms load,
zero console/page errors, correct title/lang, one `h1`, one main landmark, no
missing alt text, and no unlabeled buttons. Desktop and full-page 390 px
screenshots were visually inspected: content stacks without clipping and the
product-specific night-market treatment is intact.

## Live policy, identity, caching, and budgets

Candidate/live SHA-256 values match for:

| Resource | SHA-256 |
| --- | --- |
| root HTML | `e58734606051a6b009773f3fe507e7d252a7d2b4586e21a9836316a2ec64616d` |
| JS | `b037149f5afe500d9b7fd97d525202db3a1fedc2f20f766bb3898a32c1dd67ec` |
| CSS | `06c97cd289cb9d1d327309d85950a4619759012ac666844551cba7b125cb0da1` |
| service worker | `3abc4b40b1816e9b41dbdc1bb924e55e9bf5eb0cb4b5fa9207284e90342a2627` |
| privacy | `e33f2a27352a9d1ed810ec3ad7dcef04184ef23cc9a015107f4416d67d04db9d` |
| terms | `1b3a2711e43d72ff8384f2b16a23aef7a881d3d206cd7951335cbf2e59a807a9` |
| mobile hero | `d35ee7376e2bbe5f7c72af250482c9514263d16b5900c65974c0160a881419d2` |

Live responses carry CSP, `Permissions-Policy`, `nosniff`, Referrer Policy,
and HSTS. Hashed JS/CSS and hero art use one-year immutable caching; HTML and
the service worker revalidate after 30 seconds; conditional requests returned
304. HTTP redirects to HTTPS.

Static budgets pass: JS 13,910 B, CSS 16,604 B, all WOFF2 files 35,048 B, and
the 390 px hero 43,790 B. Lighthouse 12.6 mobile scored **99 performance, 100
accessibility, 100 best practices, and 100 SEO**: FCP 1,069 ms, LCP 1,504 ms,
speed index 1,069 ms, TBT 130 ms, and CLS 0.0015. Lighthouse lab data does not
provide field INP.

The site is static and the CLI is local-only; there is no product backend,
account system, concurrency/persistence service, or sign-in authority to test.
The only server-side product call is the Sociobot billing API audited above.

## Required remediation

1. Publish and serve the exact candidate executable at the advertised path;
   verify its length/hash and binary content type from the public domain.
2. Register/enable the factory product so checkout redirects to hosted payment.
3. Add enforced billing API rate limiting that returns 429 plus `Retry-After`,
   then record the threshold.
4. Raise mobile body type and direct link hit areas to the supplied baseline.

No product code was changed during verification.
