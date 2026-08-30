# Changelog

All notable changes follow [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Fixed

- Replace Vite's test preview process with a lifecycle-owned static server so
  concurrent native-download checks cannot lose the preview socket.
- Exercise every platform download in parallel and verify the preview remains
  available before Playwright shuts it down gracefully.
- Cache the canonical demo, privacy, and terms routes so each page reopens
  with its own content while offline.
- Parse DxO PhotoLab's DOP table format and preserve active and inactive
  correction states in the CLI index.
- Verify that CLI indexing, searching, and reporting make no network calls
  and leave source sidecars unchanged.
- Make the work-order `build:site` command compile, copy, and verify the Linux
  executable before deployment.
- Prevent missing extensionless downloads from falling through to landing-page
  HTML, and serve the executable with binary attachment headers.
- Raise mobile body text and direct-link targets to the required baseline.
- Replace the unavailable external supporter checkout with the same audit
  recipe pack as a free browser download.

### Added

- Add a representative DxO PhotoLab DOP file to the browser and CLI demos.
- Add an isolated `edit-trail demo` command with bundled sample sidecars.
- Add executable-content, mobile sizing, privacy, offline, and claim
  regressions.

## [0.1.0] - 2026-08-27

### Added

- Local recursive XMP, DOP, and PP3 sidecar indexing.
- Normalised active-operation queries with `all` and `any` matching.
- Table, JSON, CSV, folder-opening, and self-contained HTML report output.
- Static documentation and browser-only demo.

### Fixed

- Parse malformed browser-demo sidecars without triggering CSP console
  violations from Chromium's generated XML error document.
