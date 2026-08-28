# Edit Trail v0.1.0 — repair handoff

## Current status: PASS

- **Work order:** `edit-trail-finder-repair-3`
- **Verifier report:** `5674225cd93daf1ec1d9847264e11559d61c6dfe`
- **Failed candidate:** `77a6fb7957e1c131f5b18b9a926a0b8c697ae8a2`
- **Repair code commit:** `6307b1c40f994f75c2bb67547631f37145fbbcb7`
**Live URL:** <https://edit-trail-finder.sociobot.in/>

The sole release-blocking P2 is repaired, regression-covered, pushed, deployed,
and verified on the production domain. The CLI artifact and static deployment
classes are unchanged. The strict CSP and all previously accepted behavior are
preserved.

## Finding reproduction and root-cause repair

Before repair, fresh Chromium sessions on desktop and 390 × 844 mobile both
reproduced the verifier's exact path: paste `<broken`, select **Find matching
files**, and observe the correct recovery message plus two `style-src 'self'`
CSP console errors. The deployed browser bundle used `DOMParser` with
`application/xml`; Chromium's malformed-XML error document contains two inline
styles, so constructing that internal document triggered the violations.

The repaired browser demo no longer invokes `DOMParser`. Its conservative,
local-only XMP parser now performs well-formedness validation and extracts the
same namespaced element attributes in one pass. Malformed input therefore
cannot construct Chromium's styled parser-error document. The parser validates
nesting, namespace prefixes, duplicate expanded attributes, entities, numeric
character references, control characters, XML declarations, comments and
CDATA; unsupported DTDs are rejected. Entity values are decoded before the
existing operation matching logic runs.

Regression coverage is exact and layered:

- `site/src/demo.test.ts` covers `<broken`, mismatched tags, undeclared
  namespaces, invalid entities and code points, DTD rejection, and extraction
  of all three documented sample sidecars in Node, where `DOMParser` is absent.
- `tests/site/site.spec.ts` serves the page with the production CSP, performs
  the verifier's exact `<broken` interaction, asserts the actionable recovery
  copy, and asserts an empty console-error list. Playwright runs it in both the
  desktop and 390 × 844 mobile projects.

## Clean build and automated verification

`npm ci` installed 62 packages and reported zero vulnerabilities. All of these
commands pass:

```sh
npm test
npx tsc --noEmit
cargo fmt --check
cargo clippy --all-targets -- -D warnings
npm run build
cargo package --allow-dirty
```

`npm test` passed 4 Rust library tests, 2 CLI integration tests, 1 Rust doctest,
5 Vitest tests, and 12 Playwright tests across desktop and mobile. The exact
production build emitted `dist/site/` and the 1.1 MB Linux binary at
`dist/site/downloads/edit-trail-linux-x86_64`; the Azure response-policy build
guard passed.

`cargo package --allow-dirty` produced a verified 16.2 KiB compressed crate.
A clean temporary `CARGO_INSTALL_ROOT` installation from
`target/package/edit-trail-0.1.0` passed `--help`, reported version `0.1.0`,
indexed an empty archive as JSON, and returned exit code 2 for an invalid
`--match` value. Publishing remains factory-owned; no registry publish was
attempted.

A release-binary benchmark generated 10,001 XMP sidecars containing active
denoise and crop operations. Indexing all 10,001 took 196 ms with zero warnings;
the synonym query `noise reduction + crop --match all --json` returned all
10,001 in 28 ms, well inside the researched 30-second goal.

## Browser, accessibility, privacy, offline, and performance

Local production-build checks on desktop and 390 × 844 found:

- the malformed recovery and normal `2 of 3 sidecars` result work without
  console or page errors;
- `lang=en`, one `h1`, one `main`, no missing image alt, and no horizontal
  overflow;
- zero serious or critical axe findings;
- a visible `rgb(89, 243, 230) solid 3px` focus outline, working arrow-key tab
  selection, and reduced-motion animation duration of `0.000001s`;
- initial requests only to the page origin, with no analytics, CDN assets, or
  sidecar upload;
- `/sw.js` controls the page, `registration.update()` leaves no waiting worker,
  cache `edit-trail-v2` is active, and an offline reload retains the shell and
  displays the offline banner without console errors.

The 390 px full-page capture was visually inspected: the interface stacks
cleanly, text and controls remain legible, the malformed state is visible, and
the product-specific night-market system is intact. The automated license test
also continues to cover return-token storage, URL stripping, Sociobot API
verification, and unlock behavior.

Lighthouse 12.6 mobile against the production build scored **100 performance,
100 accessibility, 100 best practices, and 100 SEO**: FCP 1.2 s, LCP 1.7 s,
speed index 1.2 s, total blocking time 0 ms, and CLS 0.002. Static budgets pass:
JS 13,910 B, CSS 16,604 B, WOFF2 files 35,048 B total, and the mobile hero
43,790 B.

## Deployment and live evidence

The pushed repair was deployed with the work-order static configuration:

```sh
/opt/fleet/lib/deploy-static.sh edit-trail-finder dist/site
```

Azure deployment `9ad3789b-6245-4d93-ade2-1765a27c2a47` succeeded and the
custom domain remained Ready. Production serves `/assets/main-BeQKal14.js`.
SHA-256 comparisons are identical between the built and live root, JS, CSS,
service worker, privacy page, terms page, and mobile hero. In particular:

- root: `e58734606051a6b009773f3fe507e7d252a7d2b4586e21a9836316a2ec64616d`
- JS: `b037149f5afe500d9b7fd97d525202db3a1fedc2f20f766bb3898a32c1dd67ec`

Fresh live desktop and 390 × 844 sessions both loaded that JS, returned the
normal 2-of-3 result, then showed the exact malformed-input recovery with zero
console errors and zero serious/critical axe findings. Both had no overflow or
missing alt text and contacted only
`https://edit-trail-finder.sociobot.in`. The live service worker updated with
no waiting worker and retained the shell plus offline banner after a network
cut.

The factory `verify-url.sh` returned HTTPS 200, a 622 ms load, zero console or
page errors, the expected title and `lang=en`, one `h1`, a main landmark, no
missing alt attributes, and no unlabeled buttons. Root and asset responses
retain CSP, Permissions Policy, `nosniff`, and Referrer Policy. The hashed JS
and WebP return `public, max-age=31536000, immutable`; HTML and `/sw.js`
revalidate at 30 seconds.

## Known gaps / next steps

None. The verifier's P2 is fixed and all requested release gates pass.
