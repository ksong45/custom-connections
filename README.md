# Custom Connections

Play! https://custom-connections-2.vercel.app/

![Screenshot of Custom Connections](https://raw.githubusercontent.com/zsrobinson/custom-connections/main/public/screenshot.png)

A tool to allow you to create and share your own versions of the New York Time's connections game. All game data is embedded in the URL, so there's no need for a database to keep track of it.

## API Endpoints

In addition to the web UI, this app exposes two read-only JSON endpoints for external consumers to pull puzzle data without needing to parse the site's URL-encoding scheme.

### `GET /api/data`

Returns the most recently published puzzle. This is schedule-independent.
It walks backward from today (up to 14 days) to find whatever the latest
puzzle is, so it keeps working correctly even if the posting cadence changes.

**Query params (optional):**
- `date` (`YYYY-MM-DD`) - return a specific past puzzle instead of the most recent one

**Response `200`:**
```json
{
  "date": "2026-07-29",
  "articleUrl": "https://www.cavalierdaily.com/article/...",
  "puzzle": {
    "names": ["category 1", "category 2", "category 3", "category 4"],
    "words": [["w1", "w2", "w3", "w4"], ["..."], ["..."], ["..."]],
    "author": "...",
    "title": "..."
  }
}
```

**Response `404`:**
```json
{ "error": "No recent puzzle found" }
```
(or, with a `date` param, `"No puzzle found for {date}"`)

---

### `GET /api/archive`

Returns which days in a given month have a published puzzle. Does **not**
include full puzzle content. use `/api/data?date=...` to fetch a specific
day's puzzle once selected.

**Query params (optional):**
- `year` - defaults to the current year
- `month` (1–12) - defaults to the current month

**Response `200`:**
```json
{
  "year": 2026,
  "month": 7,
  "count": 5,
  "dates": [
    { "date": "2026-07-01", "articleUrl": "..." },
    { "date": "2026-07-08", "articleUrl": "..." }
  ]
}
```

Since each request only checks one month at a time, there's no cap on how
far back the archive can go; callers can just request earlier months as
needed (e.g. as a user scrolls back on a calendar).

### `GET /data?options=<base64>`

Takes the same `options` value as the iframe link in the article and returns
the decoded puzzle directly, with no article scraping. Just swap `/play` for
`/data` in the iframe URL:

- `https://custom-connections-2.vercel.app/play?options=XXXX` (iframe)
- `https://custom-connections-2.vercel.app/data?options=XXXX` (JSON)

**Response `200`:** `{ "names": [...], "words": [[...], ...], "author": "...", "title": "..." }`
**Response `400`:** `{ "error": "..." }` if `options` is missing or invalid.

---

### How it works

Puzzles aren't stored in a database - each one is embedded as base64-encoded
JSON in a URL (see `/play?options=...`), and that URL gets manually posted in
a dated Cavalier Daily article (e.g. `cavalier-clusters-july-29`). These
endpoints work by computing the expected article URL for a given date,
fetching that page, and extracting + decoding the puzzle link from it - no
separate database or manual publishing step required.
