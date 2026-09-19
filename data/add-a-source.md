# Add a source

File shapes, snapshot rules, and stage limits are in [Data pipeline](README.md).

## Capture published files

1. Pick a stable lowercase source id such as `kroda-coding-agent-baselines`.
2. Create `data/sources/<source-id>/source.json`.
3. List every HTTP artifact that supports the published results.
4. If the publisher pins a version, put that immutable URL in `source.json`.
5. Review the license.
6. Set `redistribution` to `allowed`, `unknown`, or `restricted`.
7. Run:

   ```bash
   pnpm data:capture <source-id>
   ```

   The command prints `Captured <source-id>: <snapshot-id>`.

8. Run:

   ```bash
   pnpm data:verify
   ```

   The command prints `Verified <n> snapshots.`

If a page loads results from a JSON endpoint, add that endpoint as another
artifact.

If the published files change, capture again. Capture writes a new snapshot id.
It does not overwrite `raw/<snapshot-id>/`.

If `extract.ts` and `crosswalk.json` still hold for the new snapshot, point
`canonical/pins.json` at that snapshot.

## Add the source to the build

If you only need the bytes in git, stop after capture.

To publish studies from the source:

1. Add `extract.ts` next to `source.json`.
2. Export `artifactPath` and `extract` from that file.
3. Pin the snapshot in `canonical/pins.json`.
4. Run `pnpm data:extract <source-id>` to write `observations.json`.
5. Add `crosswalk.json` next to `source.json`.
6. Map every native string that appears in `observations.json`.
7. If the catalog lacks an id, add it to `canonical/models.json`,
   `harnesses.json`, or `metrics.json`.
8. Add a study to `canonical/studies.json`.
9. Run:

```bash
pnpm data:build
```

The command writes `data/build/research.json` and prints `Wrote <path>`.

10. Run:

```bash
pnpm data:test
```

If the results exist only as a PDF table, draft the table. Review every cell.
Commit the reviewed table under `extracted/<snapshot-id>/`. Do not copy numbers
from a chart.
