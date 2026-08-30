# Edit Trail — visual thesis

## Direction: the sidecar night market

Edit Trail treats a photo archive like a night market after dark: the contact
sheets and folders are the unlit stalls, while each edit operation is a small
hand-painted neon sign that makes one trail visible. This fits the product’s
job precisely—the interface does not show or decorate private photographs; it
illuminates the otherwise invisible decisions stored beside them.

The site is intentionally single-mode and paints every surface explicitly.
It is not a generic “dark SaaS” gradient: narrow signboards, clipped ticket
corners, warm paper labels, electric rules, and a dense index-table rhythm
borrow from market directories and film-lab work orders.

## Palette

- `ink-950` `#09090B`: page background, like unexposed film.
- `ink-900` `#111116`: raised work surfaces.
- `ink-800` `#1C1B22`: rules and inactive controls.
- `paper-100` `#FFF7E6`: primary text; warm rather than screen-white.
- `paper-300` `#CFC5B4`: supporting text (7.8:1 on ink-950).
- `neon-cyan` `#59F3E6`: primary action and focus (13.4:1 on ink-950).
- `neon-pink` `#FF5CA8`: operation chips and active trail markers.
- `lantern` `#FFC857`: warnings and indexing highlights.
- `market-green` `#66E38F`: success and verified license state.
- `danger` `#FF7B72`: errors, always paired with an icon or text label.

White text is never placed directly on neon fills. Button text uses ink-950.
All body text and control boundaries meet WCAG AA contrast.

## Type

- Display and UI: `Azeret Mono`, self-hosted WOFF2 subset, chosen because the
  squared terminals recall file indexes and painted condensed shop signs.
- Reading: system sans (`Inter`-like native stack) for fast, familiar body
  copy without a second font download.
- The scale is 14 / 16 / 20 / 28 / clamp(40–72) px, with body text never under
  16 px. Numeric counts and paths use tabular figures.

## Spacing and shape

The base rhythm is 4 px, with working intervals of 8, 12, 16, 24, 32, 48,
64, and 96 px. Content maxes at 1180 px; prose at 68 characters. Controls are
at least 44 px. Corners are mostly 2–6 px, not soft dashboard pills. Cards are
used only for independent result records. Ticket-like clipped corners mark
commands and report samples.

## Interaction grammar

- Cyan is “act”: install, copy, search, reset, and download.
- Pink is “edit trail”: active modules, selections, and matches.
- Amber is “scan”: indexing, file counts, and cautions.
- A single animated cyan trace draws from sidecar to result in the hero, so
  motion explains indexing rather than decorating the page.
- Copy actions change label to “Copied” and announce through a live region.
- Tabs behave as real ARIA tabs with arrow-key navigation. Focus uses a 3 px
  cyan outer ring with a 2 px ink gap.
- On narrow screens, the shared navigation folds into a cyan-edged market
  directory. Its squared panel and pink offset shadow reuse the work-order
  language; Escape closes it and returns focus to its labeled trigger.
- The warm clipped ticket now contains free audit recipes. It keeps the
  work-order shape language without advertising an unavailable paid service.

Motion lasts 160–260 ms and uses only opacity/transform. Nothing flashes or
loops indefinitely. With `prefers-reduced-motion: reduce`, the trace is fully
drawn, entrances are immediate, and smooth scrolling is disabled.

## Original asset plan and provenance

`site/public/edit-trail-night-market.webp` is the hero’s atmospheric layer: an
original editorial illustration of translucent sidecar sheets hanging like
night-market signs, with operation glyphs connected by a luminous route. It
contains no photographs, faces, brands, or rendered words; HTML supplies all
meaningful text. It is generated specifically for Edit Trail with the factory
image generator, then resized/encoded as WebP at or below 300 KB. Prompt:

> Use case: stylized-concept. Asset type: wide landing-page hero atmosphere.
> Scene: a midnight open-air photo-lab market, abstract hanging translucent
> sidecar metadata sheets and small module switches forming a navigable lane.
> Style: tactile editorial gouache plus crisp screenprint grain, hand-built,
> not 3D SaaS art. Composition: 3:2 landscape, luminous trail sweeping from
> lower left toward upper right, generous dark negative space on the left.
> Palette: near-black ink, warm paper, electric cyan, hot pink, one amber
> lantern. No people, cameras, photographs, legible text, logos, gradients,
> UI mockups, or watermarks.

The route diagram, icons, wordmark, and operation tokens are hand-authored in
HTML/CSS/SVG inside the repository and are MIT-licensed with the product.
The raster was generated on 27 August 2026 with the factory `factory-image`
deployment, then stripped and converted from PNG to a 148 KB WebP using
ImageMagick. The final asset is original to this product and distributed under
the repository’s MIT license. Responsive 720 px (43 KB) and 1080 px (87 KB)
derivatives accompany the 1440 px source so mobile never downloads the desktop
hero unnecessarily. `edit-trail-share-card.webp` and `apple-touch-icon.png`
are deterministic 1200×630 and 180×180 crops of that original artwork, made
on 30 August 2026 with ImageMagick; they add no external asset or license.
