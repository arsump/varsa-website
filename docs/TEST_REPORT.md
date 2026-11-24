# First staging test report

2026-11-24

- Reproducible NOAA import executed successfully: 13 unique records, pinned source checksum in events.json.
- Node tests: 3 passed (lookup, county association, unique/provenance).
- Python tests: 3 passed (schema fields, unknown location, zone exclusion).
- Property Record JSON Schema validation: passed.
- Chromium smoke test was written but could not launch because the runtime denied its socket creation. Six route, lookup, fallback and viewport checks remain unverified.
- Source URLs inspected via web retrieval; exhaustive link status automation, accessibility audit and independent validation still pending.
- Repository and visual identity inspected; branded development candidate generated. Netlify preview and parcel-level lookup pending.
