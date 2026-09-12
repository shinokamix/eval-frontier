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
