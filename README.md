# Edit Trail

Edit Trail is a local CLI for photographers who need to find RAW files by
their editing steps. It indexes XMP, DOP, and PP3 sidecars from common RAW
editors. It normalises active editing steps, then searches combinations such
as `denoise + crop`.

It never reads or uploads image pixels. Open the product site and sample demo
at [edit-trail-finder.sociobot.in](https://edit-trail-finder.sociobot.in).
The demo uses browser memory and does not upload selected sidecars.

## Install

Download the native executable for Linux x64, macOS arm64, macOS x64, or
Windows x64 from the product site. You can also build from source with a
current Rust toolchain:

```sh
cargo install --path .
```

Try the installed CLI without pointing it at your archive:

```sh
edit-trail demo
```

It creates a temporary three-sidecar archive, index, and offline report. Use
`--output <DIRECTORY> --json` for a scripted run.

## Usage

Index every supported sidecar under an archive:

```sh
edit-trail index ~/Pictures
```

Find files where both editing steps are active:

```sh
edit-trail find --operation denoise --operation crop --match all
```

Export JSON, or export a spreadsheet without exposing pixels:

```sh
edit-trail find -o masking --json
edit-trail find -o exposure --format csv > exposure-audit.csv
```

Build a self-contained offline report:

```sh
edit-trail report --output edit-trail-report.html
```

Exit codes are `0` for success, `1` for I/O or parse failures, and `2` for
invalid usage. A `find` query with no matches returns `3`.

## Schema support and privacy

- darktable history entries, including enabled state and history boundaries
- Adobe Camera Raw / Lightroom crop, denoise, masks, and development settings
- generic XML elements with editing-step and enabled-state attributes
- `.xmp`, `.XMP`, `.dop`, and `.pp3` sidecars

Malformed sidecars become warnings, so one file does not stop an archive scan.
The index contains paths, timestamps, editor families, active editing steps,
and warnings. It does not contain image bytes.

## Develop and verify

Requirements: Rust 1.85+, Node 20+, and npm.

```sh
npm ci
npm test
npm run build
```

`npm run build` compiles the release binary and documentation site. Run
`cargo package --allow-dirty` to check package readiness. The factory owns
publishing credentials; this repository does not publish.

## Deployment

The factory deploys `dist/site` to Azure Static Web Apps. The deployment
configuration sets security headers, download headers, and asset caching.

## License

MIT © 2026 Sociobot (Param Factory). See [LICENSE](LICENSE).
