# Source diligence — 24 November 2026

Internal pilot; release permissions remain pending.

| Source | Retrieval and evidence | License / redistribution | Decision |
|---|---|---|---|
| NOAA NCEI Storm Events | [Bulk CSV archive](https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/), [user guide](https://www.ncei.noaa.gov/access/storm-events-database/assets/pdf/Storm_Events_Database_User_Guide.pdf). Downloaded 2024 details revision 2026-11-19, 16 MB gzip. 13 unique Larimer County hail/wind reports. | Federal information generally public domain unless otherwise indicated; [NOAA usage guidance](https://oceanservice.noaa.gov/about/faq.html). Preserve attribution, review dataset-specific conditions and any third-party material before commercial redistribution. | KEEP internal; production pending |
| Colorado State Forest Service | [Forest Atlas viewer](https://tra-co-pub.coloradoforestatlas.org/), [data tools](https://csfs.colostate.edu/data/), [viewer documentation](https://help.coloradoforestatlas.org/public/overview-of-wildfire-risk-viewer). Fire intensity, burn probability, WUI and building damage potential layers identified; nearby-point screening within half-mile context. | Viewer accessible with disclaimer; exported risk data and layer-specific licenses/metadata need confirmation. No layer imported or parcel inference. | PARK |
| Colorado wildfire regulatory map | [DFPC](https://dfpc.colorado.gov/); authoritative map, adoption status, applicability and local amendments require review; access blocked in web indexing. | Pending | PARK |
| Fort Collins building department | [Code editions](https://www.fortcollins.gov/Government/City-Code-and-Charter/Building-Code), [roofing permit guidance](https://www.fortcollins.gov/Business/Permits-and-Licensing/Building-Permits?lang_update=639217061117399231&mobile_pref=0). 2024 editions effective April 1, 2026 for new permit submissions; class 4 asphalt shingles trigger at 50% roof replacement. Summarized source-linked guidance. | Public facts summarized; underlying model code text and local amendments require license and legal applicability review. | KEEP internal |
| Fort Collins city address | [Official contact page](https://www.fortcollins.gov/Government/Contact-Us). City Hall, 300 Laporte Ave. One published address, no verified parcel or coordinates. | Public factual reference; assessor/parcel dataset rights pending. | KEEP internal |
| Colorado OIT parcel and jurisdiction layers | [Candidate parcel catalog](https://gis.colorado.gov/public/rest/services/GOV/PropertyTaxParels/MapServer/0/iteminfo). Coverage and accuracy untested. | Commercial redistribution and coverage unverified. | PARK |
| FEMA NFHL / HMA | Held per scope gate. | Pending | PARK |

## NOAA mapping and validation

- STATE + CZ_TYPE + CZ_NAME select Colorado county records for Larimer; STATE_FIPS and CZ_FIPS concatenate to 08069.
- EVENT_ID unique key; EVENT_TYPE classification; BEGIN_DATE_TIME and CZ_TIMEZONE retained as published local date/time; BEGIN_LAT/LON are reported event start points of unknown positional accuracy, not footprints. SOURCE retained; MAGNITUDE converted to numeric, hail inches and wind knots. Missing magnitude or coordinates become null.
- Source archive revision and SHA-256 stored in events.json. Publication timestamp unavailable, ingestion timestamp recorded. County-scale association only. No annual risk rate inferred.
- Manual spot check of downloaded archive: event 1186168, 20 July 2024 at 17:53 as reported, FT COLLINS, 1.00-inch hail at reported 40.57, -105.05. Events 1186038 and 1186039 share CAMPION coordinates and time but distinct wind and hail event types, so both retained. No assignment to City Hall damage.
- Coverage gaps, bias, update cadence, uptime, exact spatial precision and comprehensive event completeness unquantified. NOAA archive may revise historic rows; pinned version reproducible while retained. No rate limits or uptime commitments verified.
- Wildfire/WUI data retrieval and municipal amendment text verification remain future diligence.
