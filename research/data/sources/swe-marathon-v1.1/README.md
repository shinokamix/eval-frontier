# SWE-Marathon v1.1 source notes

The official [SWE-Marathon website](https://www.swe-marathon.org/) publishes
v1.1 trial results as a JSON object inside its JavaScript bundle. The server
supports HTTP byte ranges. The captured artifact contains only that JSON
object, from bytes 1,054,612 through 5,121,794 of the published file. It has
20 task records and 7,810 trial records. The manifest records the source URL,
byte range, capture time, and SHA-256 hash. The URL includes a build hash, and
`pins.json` fixes the captured bytes used by the pipeline.

The adapter reads each trial's binary `reward`, exact `tokensRaw`, reported
`duration`, and `costUsd` when present. It emits 30,478 evidence rows. Cost is
missing for 762 trials, so the adapter leaves those measurements absent. It
does not use the site's partial scores because the site calls them uncalibrated.
The `condition` field retains the published trial status. A `row:N` locator
identifies the Nth trial in task, configuration, then trial order inside the
bundle's v1.1 JSON object, starting at 1.

The [official website](https://www.swe-marathon.org/) says "Open-source under
Apache 2.0" in its footer. The related code repository and the
[Hugging Face task dataset](https://huggingface.co/datasets/rdesai2/swe-marathon)
also state Apache 2.0. None of these sources separately labels the trial
results JSON or states its redistribution terms, so `source.json` records those
terms as unstated. The captured range contains result records only. It excludes
the site's code and task text.
