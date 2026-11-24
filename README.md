# varsa — Front Range staging candidate

Measure what lasts. Resilience intelligence for the built world.

Open index.html in a browser. It is a portable generated build for review. The editable source lives in web/ (markup, theme and app), src/ (record assembly, ingest and build), data/ (pinned normalized evidence, schemas and verified pilot reference), and tests/.

Try Acquire and search 300 Laporte Ave or Fort Collins City Hall. Only this one sourced address is covered. The record associates 13 2024 Larimer County reported events by county. No parcel geometry, wildfire rating, actual damage or insurance outcome is known. Protect and Operate are synthetic workflows. Learn is research.

## Reproduce
- python src/ingest.py (downloads pinned NOAA CSV gzip), or python src/ingest.py --archive /path/to/pinned.csv.gz
- python src/build.py
- node --test tests/record.test.mjs
- python -m unittest discover -s tests -v
- python tests/smoke_preview.py (requires Playwright and Chromium)

## Integration
The existing repository was inspected, including its main HTML and Concept A logo. This staging candidate uses the established warm ivory, sage, sand, cognac and cool accent palette. Proposed changes are isolated to a development branch. Netlify account configuration and preview access have not been verified.

## Architecture
Static portable frontend today. Next: read-only API with validated core records (GET /v1/properties/{id}), PostgreSQL/PostGIS for parcels, geography and effective-dated local rules, Python scheduled ingestion with checksums, immutable raw snapshots and quality indicators. Add geocoding only after data rights are confirmed. Separate authenticated tenant database/storage and scoped access policies for private records; the provided private schema is design only. No private data collection yet. Add monitoring for ingestion failures, freshness and coverage before production. Evaluate existing Netlify costs and deployment before committing to hosting.

## Review priorities
1. Connect GitHub and inspect existing repository, visual identity and Netlify preview capability.
2. Confirm NOAA reuse terms; secure authoritative parcel/municipal boundary data and WUI risk layer metadata and rights.
3. Verify local amendments, wildfire map and jurisdiction applicability through authoritative sources.
4. Expand address lookup to verified parcels and explicit spatial match quality; build ten independently reviewed sample records.
5. Obtain outside-business/IP clearance and explicit production release approval before commercialization.

## Government data checkpoint
Run `python src/retrieve_pilot.py`, then `python src/ingest.py --archive audit/raw/storm-2024.csv.gz` and `python src/validate_pilot.py`, then `python src/build.py`. Download results are captured in audit/downloads.json. The operational MRMS file is rolling, so use the preserved raw snapshot for repeat validation if it expires. The archive of raw downloads is kept outside the public repository. See docs/DATA_CHECKPOINT_2026-11-24.md.

## Citywide live lookup
The preview uses government GIS queries in-browser for exact Fort Collins street addresses; source availability and data completeness apply. It does not bulk republish Colorado parcel data. Run `python src/ingest_history.py` to reproduce five-year NOAA archive normalization, and `python src/validate_addresses.py` to reproduce the bounded address sample checks. See docs/CITYWIDE_CHECKPOINT.md.
