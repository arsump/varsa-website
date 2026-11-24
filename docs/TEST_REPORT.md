# First staging test report

2026-11-24

- Reproducible NOAA import executed successfully: 13 unique records, pinned source checksum in events.json.
- Node tests: 3 passed (lookup, county association, unique/provenance).
- Python tests: 3 passed (schema fields, unknown location, zone exclusion).
- Property Record JSON Schema validation: passed.
- Chromium smoke test was written but could not launch because the runtime denied its socket creation. Six route, lookup, fallback and viewport checks remain unverified.
- Source URLs inspected via web retrieval; exhaustive link status automation, accessibility audit and independent validation still pending.
- Repository and visual identity inspected; branded development candidate generated. Netlify preview and parcel-level lookup pending.

## Second checkpoint
- Nine automated unit tests passed (four JS, five Python).
- Checksums, one exact state address and city address, a unique intersecting parcel polygon, 4,173 EFC feature dates and geometry types, GRIB2 framing and Property Record JSON Schema validated.
- Prior preview live browser smoke passed all six routes and lookup/fallback; latest deployment smoke pending.

## Citywide checkpoint
13 automated tests passed; example record schema validated. Five annual NOAA archives were downloaded, and 71 unique records normalized. Government live address sample: 7 successful unique parcel and boundary matches, 2 unresolved addresses, 1 HTTP 503. USDA community summary query returned one exact CC0 city row. Live browser integration verification recorded in pull request.
