# Project instructions

## Research data

When changing extraction, canonicalization, or the evidence schema, read
`docs/DATASETS.md` and `research/README.md`. The Pydantic models in
`research/src/eval_frontier/schemas/` define the row contract.

Keep captured source snapshots immutable. Preserve each row's source artifact
and locator through extraction and canonicalization. Generate Parquet outputs
through the pipeline instead of editing them by hand.

Before interpreting or presenting results, check `docs/README.md` and the
implementation to confirm that the required analysis exists.

## Web UI

Read `DESIGN.md` when changing layout or typography. Use `Text` from
`@/shared/components/text` for all visible UI copy. Choose its `title`,
`heading`, `body`, `inline`, or `value` variant instead of styling text with
`className`. Put `inline` inside links, labels, buttons, and other controls.

## Verification

Run `moon run check` from the repository root, or the relevant tasks in
`apps/web/moon.yml` or `research/moon.yml`. `moon run fix` applies formatter
and lint fixes. After a research data build, compare row counts before
and after for each affected source. Check its `source_id` and `snapshot_id`
against the pinned snapshot, and its `source_path` and `source_locator`
against the captured artifact. Explain changes to rows from other sources.

The research analysis will write the graph's coordinates to
`research/build/research.json`; nothing produces it yet. The web app only
draws them. When changing how research data reaches the web app, read
`apps/web/scripts/sync-research.mjs` and check the generated
`apps/web/public/data/research.json` against
`apps/web/src/module/explore/schema/research.ts`. Report which checks ran
and any remaining verification gap.
