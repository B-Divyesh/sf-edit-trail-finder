# Edit Trail

Edit Trail is a local CLI for photographers who need to find RAW
files by **what was done to them**. It indexes XMP sidecars, normalises active
edit operations across darktable, Adobe Camera Raw/Lightroom, and common
generic schemas, then searches combinations such as “denoise + crop”. It never
reads or uploads image pixels.

The product site and live sidecar demo are at
[edit-trail-finder.sociobot.in](https://edit-trail-finder.sociobot.in). Open
[the sample demo](https://edit-trail-finder.sociobot.in/?demo=1#demo) with one
click; it runs in browser memory and does not save or upload selected files.

## Install

Download the prebuilt Linux executable from the product site. Or build from
source with a current Rust toolchain:

```sh
cargo install --path .
```

Edit Trail starts at `0.1.0` and ships as one binary with no runtime service.

Try the installed CLI without pointing it at your archive:

```sh
edit-trail demo
```

It creates a temporary three-sidecar archive, index, and offline report, then
prints their paths. Use `--output <DIRECTORY> --json` for a scripted run.

## Usage

Index every supported sidecar under an archive. The default index is
`.edit-trail.json` in the current directory:

```sh
edit-trail index ~/Pictures
```

Find files where both modules are active:

```sh
edit-trail find --operation denoise --operation crop --match all
```

Use synonyms (`noise reduction` → `denoise`, `rotate and perspective` →
`perspective`) or inspect the exact normalised vocabulary:

```sh
edit-trail operations
```

Script against stable JSON, or export a spreadsheet without exposing pixels:

```sh
edit-trail find -o masking --json
edit-trail find -o exposure --format csv > exposure-audit.csv
```

Build a self-contained, offline report and open the containing folder for a
single result:

```sh
edit-trail report --output edit-trail-report.html
edit-trail find -o contrast --limit 1 --open
```

The commands accept `--index <FILE>` when the index is stored elsewhere.
`edit-trail --help` and every subcommand’s help list all options. Exit codes are
`0` for success, `1` for I/O or parse failures, `2` for invalid CLI usage, and
`3` when a `find` query has no matches. `--json` keeps stdout machine-readable;
progress and diagnostics go to stderr.

## Schema support and privacy

- darktable history entries, including enabled state and history boundaries
- Adobe Camera Raw / Lightroom crop, denoise, masks, and development settings
- generic XML elements that expose `operation`/`module`/`tool` and
  `enabled`/`active` attributes
- `.xmp`, `.XMP`, `.dop`, and `.pp3` sidecars (PP3 support is key/value based)

Unknown fields are ignored. Malformed sidecars are recorded as warnings, so
one bad file does not stop a large archive. The index contains sidecar paths,
inferred source-image paths, modification timestamps, editor family, active
operation names, and warnings—never image bytes, EXIF location, captions, or
other unrelated metadata.

## Develop and verify

Requirements: Rust 1.85+, Node 20+, and npm.

```sh
npm ci
npm test
npm run build
```

`npm run build` compiles the release binary and the Vite documentation site.
Deployable output lands in `dist/`, with the site at `dist/site/index.html` and
the Linux binary at `dist/site/downloads/edit-trail-linux-x86_64`. Package readiness
can be checked with `cargo package --allow-dirty` (the factory owns publishing
credentials; this repository does not publish).

## Deployment

The factory deploys `dist/site` to Azure Static Web Apps at the static product
domain. `site/public/staticwebapp.config.json` travels with that build and
sets the production CSP, Permissions-Policy, downloadable-binary response
headers, and immutable caching for hashed assets and the original WebP artwork.
No secrets, analytics, accounts, payment calls, or third-party runtime assets
are required.

## License

MIT © 2026 Sociobot (Param Factory). See [LICENSE](LICENSE).
