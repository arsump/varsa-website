# Citywide Fort Collins lookup — November 24, 2026

## Architecture

The static preview resolves user-entered exact Fort Collins street addresses through the State of Colorado public address service, querying only requested fields and never requesting owner names. An address point is spatially checked against public parcel geometries and the City of Fort Collins city limits service. Multiple matches, missing parcel, outside-city and upstream failures are surfaced. The result is assembled into a source-linked Property Record in the browser, and both Protect and Operate receive the selected record. A browser-local JSON export provides a reviewable record. City Hall is the retained independently cross-checked example; other addresses are queried on demand. No bulk address/parcel data is published or stored in the app. This is a live development preview, not a comprehensive coverage or data-quality guarantee.

Terms: State commercial application use with attribution permitted, source dataset resale prohibited. City boundary source is used for a linked jurisdiction check; city data copyright and use limitations remain subject to separate verification.

## Weather history

Five pinned NOAA annual Storm Events archives for 2020–2024 downloaded and processed, filtered to Larimer County hail and thunderstorm wind reports. The archive revisions, byte counts, SHA-256 and retrieval timestamps appear in data/history.json. 71 distinct events passed unique-ID checks. County reports remain area context, with no direct building-impact inference. Weld County sites have no historical archive coverage.

## Wildfire

Official USDA Forest Service Research Data Archive publication [RDS-2020-0016-2](https://doi.org/10.2737/RDS-2020-0016-2) permits reuse without additional permission or fees. The official community summary ArcGIS item [USFSRMResearchStation](https://www.arcgis.com/home/item.html?id=40aad45f98cd41579ba6c8b7963789c2) expressly identifies CC0. Its exact Fort Collins community row (GEOID 0827425, 2023 Census boundary vintage) was retrieved and parsed from the federal publisher's service. National burn-probability rank 85.80%; risk-to-homes rank 85.60%; wildfire hazard potential rank 76.20%. These are comparative modeled community ranks; the percentage does not represent the probability of fire at the searched address, actual damage, or insurance outcomes. Data and metadata SHA-256, bytes, query URL and limitations are recorded in data/wildfire.json.

The alternative official workbook returned HTTP 403; the federal community summary feature query succeeded. The raw nationwide grid archive is large, and the imagery service documentation says values were altered for display, so property-level quantitative raster extraction is still pending.

## Tests

Eight JavaScript unit tests and five Python tests passed. Expanded sample record JSON Schema validation passed. Government address service CORS header confirmed against preview origin. Local headless Chromium remains blocked by runtime socket restriction; deployed browser integration checks will be reported in the pull request. Live addresses are resolved using a government point-in-polygon query; survey accuracy, units and data completeness remain uncertain.

The ten-address live government-service sample returned seven unique address points with one intersecting parcel and confirmed city boundary each, two addresses with zero or ambiguous exact matches, and one HTTP 503 service error. See audit/address-validation.json. This is a small convenience sample, not an estimate of citywide coverage.
