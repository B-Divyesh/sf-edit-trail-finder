# Edit Trail

Edit Trail is a fast, local-first CLI for photographers who need to find RAW
files by **what was done to them**. It indexes XMP sidecars, normalises active
edit operations across darktable, Adobe Camera Raw/Lightroom, and common
generic schemas, then searches combinations such as “denoise + crop”. It never
reads or uploads image pixels.

The product site and live sidecar demo are at
[edit-trail-finder.sociobot.in](https://edit-trail-finder.sociobot.in).

## Install

Prebuilt Linux binaries are attached to releases. Or build from source with a
current Rust toolchain:

```sh
cargo install --path .
```

Edit Trail starts at `0.1.0` and ships as one binary with no runtime service.

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

Unknown fields are ignored and malformed sidecars are recorded as warnings so
one bad file does not stop a large archive. The index contains sidecar paths,
inferred source-image paths, modification timestamps, editor family, active
operation names, and warnings—never image bytes, EXIF location, captions, or
other unrelated metadata.

## Develop and verify

Requirements: Rust 1.85+, Node 20+, and npm.

```sh
npm install
npm test
npm run build
```

`npm run build` compiles the release binary and the Vite documentation site.
Deployable output lands in `dist/`, with the site at `dist/site/index.html` and
the Linux binary at `dist/downloads/edit-trail-linux-x86_64`. Package readiness
can be checked with `cargo package --allow-dirty` (the factory owns publishing
credentials; this repository does not publish).

## Deployment

The factory deploys `dist/site` to the static product domain. No secrets,
analytics, or third-party runtime assets are required. Billing uses only the
hosted Sociobot checkout and verification API; it is not needed by the CLI.

## License

MIT © 2026 Sociobot (Param Factory). See [LICENSE](LICENSE).
