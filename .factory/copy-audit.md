# Copy audit — 30 August 2026

Every visitor-facing sentence in the landing page and README was checked after
the polish. No sentence exceeds 22 words. No banned marketing word appears.

## Landing page

| Words | Sentence |
| ---: | --- |
| 15 | For photographers using RAW editors who need to find masking, denoise, crop, or other active edits. |
| 7 | See two matching sample photos immediately. |
| 12 | Edit Trail reads each supported sidecar, records active operations, and builds a small local index you can search. |
| 14 | Map editor-specific names and enabled states into one visible editing step. |
| 15 | Require all operations or match any, then print paths, JSON, CSV, or a static report. |
| 10 | Paste XMP or choose local sidecars. Parsing stays in this tab; files are never uploaded. |
| 13 | Index an archive, find matching files, list operation names, or write an offline report. |
| 14 | The recipe pack covers masking, crop, denoise, reports, CSV, JSON, and hidden sidecars. |
| 6 | It is free with the CLI. |
| 11 | The download is generated in your browser and contains commands only. |
| 10 | Choose a native download, or build from source with Rust. |

Dynamic states are also concise: “2 of 3 sidecars match all selected
operations.” (9), “No matching trails.” (3), and “Could not parse
filename.pp3.” (4).

## README

| Words | Sentence |
| ---: | --- |
| 18 | Edit Trail is a local CLI for photographers who need to find RAW files by their editing steps. |
| 13 | It indexes XMP, DOP, and PP3 sidecars from common RAW editors. |
| 10 | It normalises active editing steps, then searches combinations such as denoise plus crop. |
| 8 | It never reads or uploads image pixels. |
| 12 | The demo uses browser memory and does not upload selected sidecars. |
| 10 | Download the Linux executable from the product site. |
| 12 | On macOS or Windows, build from source with a current Rust toolchain. |
| 13 | It creates a temporary three-sidecar archive, index, and offline report. |
| 11 | Exit codes are 0 for success, 1 for I/O or parse failures, and 2 for invalid usage. |
| 10 | A find query with no matches returns 3. |
| 13 | Malformed sidecars become warnings, so one file does not stop an archive scan. |
| 14 | The index contains paths, timestamps, editor families, active editing steps, and warnings. |
| 7 | It does not contain image bytes. |

## Terminology

| Concept | One term |
| --- | --- |
| User-visible edit | editing step |
| Stored editor field | operation |
| Supplemental editor file | sidecar |
| Translation into shared names | normalise operation names |
