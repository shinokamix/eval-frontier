# Adding a raw source

Raw capture preserves published material before we interpret it. It does not
normalize values, map names, define comparisons, or calculate scores.

## One common unit

Treat every downloaded file or response as an artifact. An artifact is the exact
published bytes plus provenance and a SHA-256 checksum.

The same structure works for:

- a PDF;
- an HTML article;
- a JSON or CSV API response;
- a repository archive pinned to a commit;
- a manually downloaded file.

A source may need several artifacts. A paper, for example, may include its PDF,
an appendix, and a CSV file.

## Layout

Choose a stable, lowercase source ID:

```text
data/sources/<source-id>/
  source.json
  raw/<snapshot-id>/
    manifest.json
    artifacts/
      <captured files>
```

`source.json` lists the source and the HTTP artifacts to capture. Artifact URLs
must point to immutable versions when the publisher provides them:

```json
{
  "schemaVersion": 1,
  "id": "example-benchmark-paper",
  "title": "Example benchmark paper",
  "canonicalUrl": "https://example.org/paper",
  "license": "CC-BY-4.0",
  "redistribution": "allowed",
  "artifacts": [
    {
      "path": "paper.pdf",
      "role": "primary",
      "url": "https://example.org/paper-v1.pdf"
    }
  ]
}
```

A generated manifest records what the server returned:

```json
{
  "schemaVersion": 1,
  "snapshotId": "...",
  "sourceId": "example-benchmark-paper",
  "title": "Example benchmark paper",
  "canonicalUrl": "https://example.org/paper",
  "capturedAt": "2026-09-17T18:00:00Z",
  "license": "CC-BY-4.0",
  "redistribution": "allowed",
  "artifacts": [
    {
      "path": "artifacts/paper.pdf",
      "role": "primary",
      "mediaType": "application/pdf",
      "sha256": "...",
      "acquisition": {
        "type": "http",
        "url": "https://example.org/paper.pdf",
        "finalUrl": "https://example.org/paper.pdf",
        "method": "GET",
        "status": 200
      }
    }
  ]
}
```

Derive the snapshot ID from artifact paths and checksums. Capture time must not
affect it. Capturing the same bytes twice should produce the same snapshot ID.

## Capture methods

### HTTP

Use HTTP for PDFs, articles, and APIs. Save the response body without parsing or
reformatting it. Record the URL, method, relevant request body, response status,
media type, and checksum.

Dynamic pages often load their data from a JSON endpoint. In that case, capture
the JSON response as another artifact. The initial HTML may not contain the
published results.

Never store cookies, authorization headers, API keys, or other secrets.

### Git repository

Record the repository URL and full commit SHA. A branch or tag is not enough
because its target may change. Save an archive of that commit when the license
permits redistribution.

### Manual download

Use a manual capture when browser interaction or access restrictions prevent an
automated request. Keep the downloaded file unchanged. Record its original URL,
the reason for manual capture, repeatable download steps, and checksum.

Do not copy table values into a hand-written raw JSON file. Preserve the page,
PDF, screenshot, or attachment first. Transcription belongs to a later step.

## Adding a source

1. Choose a stable source ID.
2. Add its `source.json` and list every artifact needed to support the published
   results.
3. Review redistribution rights.
4. Capture the source:

   ```bash
   pnpm data:capture <source-id>
   ```

5. Verify all committed snapshots without network access:

   ```bash
   pnpm data:verify
   ```

Never overwrite a snapshot. Add another snapshot when the article, API response,
PDF, or repository changes.

## Raw capture stops here

Do not add canonical model IDs, unit conversions, corrected values, inferred
values, study membership, rankings, or scores during capture.

The current implementation supports only this operation:

```text
capture HTTP artifacts -> write manifest -> verify checksums offline
```

Local file and Git capture can be later commits.
