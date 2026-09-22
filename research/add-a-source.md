# Add a source

Source data belongs under `research/data/sources/<source-id>`.

1. Add `source.json` with a stable lowercase source id, immutable artifact URLs,
   license, and redistribution status.
2. Capture and verify the snapshot:

   ```bash
   uv run --project research eval-frontier capture <source-id>
   uv run --project research eval-frontier verify
   ```

3. Add the source's Python adapter under
   `research/src/eval_frontier/sources/adapters/` and pin its snapshot in
   `research/data/canonical/pins.json`.
4. Add `crosswalk.json` mapping source labels to the canonical IDs in
   `src/eval_frontier/catalog/`.
5. Rebuild through Moon:

   ```bash
   moon run research:build
   ```

Capture never overwrites an existing snapshot. The build reads pinned snapshot
bytes and writes `research/data/canonical/evidence.parquet`.
