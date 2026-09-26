# Color

Page color lives in `src/app/styles.css` as theme tokens. Use the utility
instead of the hex value.

| Token        | Utility           | Value     | Use                                          |
| ------------ | ----------------- | --------- | -------------------------------------------- |
| `background` | `bg-background`   | `#090909` | Page background and panels sitting on it     |
| `foreground` | `text-foreground` | `#f4f4f4` | Default text and diagram strokes             |
| `surface`    | `bg-surface`      | `#151515` | A raised fill inside a diagram               |
| `muted`      | `text-muted`      | `#8d8a82` | Secondary labels                             |

`white` and `black`, including opacity, are for hairline borders, chart grid
lines, subdued chart labels, and overlays on photography. A new hex color needs
a token in the theme.

# Spacing and sizing

Use Tailwind's spacing scale for padding, margins, gaps, and control sizes. The
default step is `0.25rem`. Use `gap-6`, not `gap-[24px]`. In CSS, use
`--spacing(6)` to reference the same scale.

Shared layout values live in `src/app/styles.css`:

| Value             | Mobile            | `md` and wider    |
| ----------------- | ----------------- | ----------------- |
| `--page-gutter`   | `4`               | `12`              |
| `--content-width` | `--container-5xl` | `--container-5xl` |

Use `page-gutter` for page edges and `content-layout` for centered content.
Technical articles use `Article` from `@/shared/components/article`. It sets
page gutters, a centered `max-w-3xl` column, and vertical padding. Its section
gap and vertical padding use `16` on mobile and `20` at `md` and wider.

Use `ArticleSection` from `@/shared/components/article-section` inside it. This
is a plain `section` with `gap-6` between its heading and paragraphs. Neither
component has variants, borders, or first/last section rules. Keep article
headings and paragraphs as ordinary `Text` children. Do not add side labels or
separate columns for section numbers.

Use `gap-6` between paragraphs and `gap-8` between blocks. Compact controls and
tables use smaller steps such as `2`, `3`, and `4`. Keep widths on Tailwind's
container scale, such as `max-w-xl`, `max-w-3xl`, and `max-w-5xl`. Custom grid
columns should reference the spacing scale, as in
`grid-cols-[--spacing(10)_1fr]`.

Pixel values are allowed for thin borders, icon alignment, and blur effects.
Fluid font sizes belong in `Text`, not in layout spacing tokens. Keep tap
targets at least `size-11`, even when the visible icon is smaller.

# Typography

The app uses two font families. Instrument Sans is for prose. Commit Mono is for
values that readers compare or copy.

The typography system does not include a third font family. A font change must
also update this file.

## Instrument Sans

Instrument Sans is the font for headings, body text, navigation, and chart
captions.

The app loads weights 400 and 600. Body text, navigation, and captions use
weight 400. Headings use weight 600.

## Commit Mono

Commit Mono is the font for metrics, model names, harness labels, benchmark IDs,
tabular numbers, and short technical annotations.

The app loads weight 400. Only the value uses Commit Mono, not its surrounding
section. Ligatures are off so that IDs and labels display literal characters.
Numbers use tabular figures.

## Font tokens

`--font-sans` resolves to Instrument Sans, then `system-ui`, then `sans-serif`.
`--font-mono` resolves to Commit Mono, then `ui-monospace`, then `monospace`.

The `body` element uses `--font-sans`. Values use `--font-mono`.

`src/app/main.tsx` loads both font families from `@fontsource/instrument-sans`
and `@fontsource/commit-mono`.

## Text component

All visible UI copy uses `Text` from `@/shared/components/text`. The `variant`
prop accepts these values:

| Variant   | Element | Use                                                    |
| --------- | ------- | ------------------------------------------------------ |
| `title`   | `h1`    | Page titles                                            |
| `heading` | `h2`    | Section headings                                       |
| `body`    | `p`     | Body copy                                              |
| `inline`  | `span`  | Copy inside links, labels, buttons, and other controls |
| `value`   | `span`  | Values set in Commit Mono                              |

`body` is the default variant. Typography classes belong to the variant and must
not be overridden at the call site.

Use `tone="subtle"` for subdued chart labels. The `Text` component owns their
color so call sites do not need a text color class.

Mobile navigation labels use `variant="inline"` with `size="navigation"`. This
keeps control copy semantically inline while applying the larger navigation type
scale through the shared component.
