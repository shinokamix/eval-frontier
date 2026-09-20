# Add a source

Source data belongs under `research/data/sources/<source-id>`.

1. Add `source.json` with a stable lowercase source id, immutable artifact URLs,
   license, and redistribution status.
2. Capture and verify the snapshot:

   ```bash
   uv run --project research eval-frontier capture <source-id>
   uv run --project research eval-frontier verify
   ```

3. Add the source's Python adapter and pin its snapshot in
   `research/data/canonical/pins.json`.
4. Add `crosswalk.json` and any catalog entries needed by the observations.
5. Add a study definition to `research/data/canonical/studies.json`.
6. Rebuild through Moon:

   ```bash
   moon run research:build
   ```

Capture never overwrites an existing snapshot. The build reads pinned snapshot
bytes and writes `research/build/research.json`.
