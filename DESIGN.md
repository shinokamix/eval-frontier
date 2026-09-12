# Design

## Type

Two families. Instrument Sans for reading. Commit Mono for values you compare or
copy.

Do not add a third family. Do not swap either face without changing this file.

### Instrument Sans

Use for headings, body text, navigation, and chart captions.

Weights 400 and 600 only. Body, nav, and captions use 400. Headings use 600, not
a different sans.

### Commit Mono

Use for metrics, model names, harness labels, benchmark IDs, tabular numbers,
and small technical annotations.

Weight 400 only. Put it on the value, not on the section around it. Keep
ligatures off on IDs and labels so characters stay literal. Tabular figures stay
on for numbers.

### Tokens

`--font-sans` is Instrument Sans, then `system-ui, sans-serif`. `--font-mono` is
Commit Mono, then `ui-monospace, monospace`.

`body` uses `--font-sans`. Apply `--font-mono` on the metric, name, label, ID,
number, or annotation.

Load the faces from `@fontsource/instrument-sans` and `@fontsource/commit-mono`
in `src/app/main.tsx`.
