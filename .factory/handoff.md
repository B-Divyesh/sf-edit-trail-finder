# Edit Trail — adversarial review 4 handoff

## Status

**FAIL** — review 4 found 18 issues at
<https://edit-trail-finder.sociobot.in> against source commit
`0be15035f1ae6de6598e4aaca253796af9f50d46`. Product code was not modified.

The blocking issue is F-4-1: the one-click browser demo works, but this CLI
product has no landing-page terminal recording of the real `edit-trail demo`
flow. The remaining findings cover the missing limitations section,
first-screen facts, two unlisted claim-like headings, plain-language copy,
action labels, and the README demo link.

## What was checked

- Opened the live root cold at 390×844 and 1440×900 before scrolling.
- Exercised the one-click sample, complete reset, demo exit, real-storage
  sentinel, offline routes, history focus, mobile menu, 404, metadata, links,
  downloads, request log, and accessibility.
- Ran all 16 exact `.factory/claims.json` commands independently from a clean
  clone. All passed and every claim tag occurs exactly once.
- Ran the live Linux download with `edit-trail demo` in a fresh temporary
  directory; it created three sidecars and returned two matches.
- Ran `npm test`, `npm run build`, `cargo fmt --check`, strict Clippy, and
  `cargo package --allow-dirty` from the clean clone. All passed.
- Ran `/opt/fleet/lib/verify-url.sh` and the repository's Playwright Axe live
  audit. The live run completed 86 checks with 0 console errors, 0 external
  requests, and 0 Axe violations.
- Confirmed the live root HTML, JavaScript, and CSS byte-match the clean build.
- Read and rechecked every finding in reviews 1–3 and polish reports 1–3.
  None of those earlier findings regressed.
- Audited every landing-page and README sentence, heading, and action label.

## How to verify

```sh
npm ci
npm test
npm run build
node scripts/verify-live.mjs https://edit-trail-finder.sociobot.in /tmp/edit-trail-review-4-live
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo package --allow-dirty
```

Run each exact command in `.factory/claims.json` independently from a clean
clone. Run the downloaded Linux binary as
`edit-trail demo --output <new-temp-directory> --json`.

## Remaining work

Resolve F-4-1 through F-4-18 in `.factory/review-4.md`, register any retained
claims, and rerun the full adversarial checklist. Deployment remains the
factory's responsibility; no infrastructure or unrelated service was read or
changed during this review.
