# Edit Trail v0.1.0 — verification handoff

## Status: FAIL

Candidate `729ce5e80b36034c404c1c0730b32ccebf9039c0` was independently
verified on 2026-08-28 against
<https://edit-trail-finder.sociobot.in/>. The product code, CLI package,
functional browser flows, accessibility checks, PWA offline reload, and
content identity passed. The live deployment fails the release gate because
it does not serve the candidate's declared Content-Security-Policy,
Permissions-Policy, or immutable asset cache headers.

Read the complete evidence and exact commands in
[`.factory/verification.md`](verification.md).

## Required next step

Configure the production static host to apply `site/public/_headers` (or its
platform-native equivalent), especially its CSP, Permissions-Policy, and
one-year `immutable` cache policy for hashed assets and WebP files. Re-run the
HTTPS header checks and update the verification verdict only after those
headers are observable on the live URL.

## Reproduce

```sh
npm ci
npm test
npm run build
npx tsc --noEmit
cargo fmt --check
cargo clippy --all-targets -- -D warnings
cargo package --allow-dirty
```

The deployable static site is `dist/site`; the release binary is
`dist/site/downloads/edit-trail-linux-x86_64`. Package verification uses
`cargo package --allow-dirty`; publishing remains factory-owned.
