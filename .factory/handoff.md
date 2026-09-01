# Edit Trail — review 5 handoff

## Status

**FAIL — one minor finding remains.** Review 5 checked the live product and a
clean clone on 1 September 2026 without changing product code.

## What was checked

- Cold 390 px and desktop visits stated the job, audience, first action, and
  sample outcome before scrolling.
- The one-click demo immediately showed two matches from three sample sidecars.
  Its banner, reset action, browser-memory isolation, and request behavior
  were checked.
- The CLI demo ran in a newly created temporary output directory and created
  the three sidecars, index, and offline report.
- Every exact command in `.factory/claims.json` completed successfully from a
  clean clone. The complete `npm test` suite reported 60 browser checks passed.
- `npm run build`, `cargo fmt --check`, strict Clippy, TypeScript checking, and
  `cargo package --allow-dirty` passed. `dist/site` was created.
- Routes, route metadata, 404 status, links, downloads, focus, responsive
  layout, reduced motion, offline reload, self-hosted assets, and request
  behavior were checked. Earlier review findings remain resolved.

## Open finding

`F-5-1` in `.factory/review-5.md`: with zero loaded sidecars, the demo says to
change match filters instead of naming the required next action to paste or
choose a sidecar. Update that specific empty state and add a browser check for
the replacement message.

## Run and verify

```sh
npm ci --include=dev
npm test
npm run build
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
npx tsc --noEmit
cargo package --allow-dirty
```

## Next step

Resolve F-5-1, then repeat the complete review checklist.
