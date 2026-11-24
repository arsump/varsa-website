# VARSA interactive explorer checkpoint

The preview provides address search from the landing page, an interactive Leaflet map with OpenStreetMap attribution, map event-family and year filters, a modeled hail overlay, record tabs, event history filters, a session-scoped portfolio, source-linked JSON export, and print layout. The four suites remain visible. Learn is a research roadmap and Protect continues as a workflow preview.

## Data

- FEMA National Risk Index county ArcGIS service tested and retrieved with the founder's authorization under its terms. Two county records, Larimer and Weld, contain all 18 source-defined hazard ratings per county. Source vintage December 2025. Ratings are county-scale planning context, and "Not Applicable" is a FEMA classification. Source query, version, date, checksum and required attribution are present in data/nri.json and the UI.
- NOAA Storm Events pinned 2020–2024 archives were reprocessed. 102 matching Larimer County reports and 215 reports from three regional forecast zones whose published names include Larimer. Zone reports have no point coordinates or county assignment. Mapped dots use only NOAA-reported county event points, with positional accuracy unknown. No event establishes property damage.
- NOAA Event Footprint Catalog July 20 and 21, 2024 UTC files, 4,173 and 3,384 source polygons respectively, reduced by explicit Front Range bbox to 64 relevant polygons. The preview evaluates the reported address point against these two dates only, and distinguishes modeled hail from reported event locations.
- Fort Collins building footprint and current permit metadata were retrieved from the city's ArcGIS items. Their terms describe internal design purpose and liability limits without granting clear commercial reuse. Building and permit values are held pending rights and matching review. No roof, construction type, permit or property outcome is inferred.
- USFS wildfire remains community-scale. Property-level wildfire, flood zones, heat, seismic and other hazard screening are pending. Sea-level rise, erosion, subsidence and snow load are explicitly outside the current index coverage. No portfolio data are saved server-side.

Run `python src/retrieve_nri.py`, `python src/ingest_multihazard.py` after historical archive retrieval, `python src/retrieve_footprints.py`, and `python src/build.py`. Bounded raw extracts remain outside the branch. Use the Netlify preview or a local static HTTP server.

OpenStreetMap online basemap tiles are used for the low-volume preview, with visible attribution and no tile prefetch. Tile availability is best effort.
