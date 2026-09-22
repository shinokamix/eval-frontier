# DeepSWE v1.1 source notes

This source uses the official [v1.1 leaderboard data](https://deepswe.datacurve.ai/data/v1.1).
The captured `leaderboard-live.json` reports a generation time of
`2026-09-22T06:27:15.860279+00:00`. Its URL can change. The manifest records
the capture time and SHA-256 hash, and `pins.json` selects the captured bytes.

The adapter reads 70 configuration aggregates for 28 models with
`mini-swe-agent`. It stores pass@1 over scored attempts, the share of tasks
with at least one passing scored attempt, reported mean cost per scored attempt,
and mean duration per scored attempt. The source excludes provider, verifier,
and network errors from scored attempts, so some tasks have fewer than four
scored attempts. Context-window failures and agent timeouts count as failures.
A row locator points to the configuration line in the captured JSON.

The official leaderboard does not state a license or redistribution terms for
this JSON file. The Apache-2.0 license in the separate `deep-swe` code repository
does not establish terms for the leaderboard results. This source records that
uncertainty rather than assigning the code license to the results.
