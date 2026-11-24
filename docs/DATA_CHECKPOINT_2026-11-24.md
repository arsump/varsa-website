# VARSA — government data checkpoint (November 24, 2026)

## Retrieval and validation

All sizes below are actual downloaded byte counts, with URLs, timestamps, SHA-256, HTTP status and content type recorded in [downloads.json](../audit/downloads.json). Raw snapshots are retained separately for reproducibility. ArcGIS data may change; the query results are dated snapshots.

| Source | Actual artifact | Size | Version / coverage | Validation | Reuse decision |
|---|---|---:|---|---|---|
| NOAA Storm Events | CSV.gz | 15,978,220 bytes | 2024 details, archive revision 2026-11-19 | gzip/CSV parsed, 13 unique Larimer County hail and thunderstorm wind records | KEEP; federal data generally public domain, credit NOAA, verify third-party rights before commercial redistribution |
| NOAA Event Footprint Catalog | GeoJSON | 2,159,331 bytes | July 20, 2024, 4,173 national modeled hail polygons | Parsed; dated features; address-point intersection checked | KEEP; Data.gov catalog specifies CC0, cite NOAA NCEI, disclose radar-based estimates |
| NOAA EFC documentation | Markdown | 9,639 bytes | Current retrieved README, 2026-11-24 | Read and reviewed schema | KEEP |
| NOAA operational MRMS MESH | GRIB2.gz | 34,176 bytes | 2026-11-24 18:54:38 UTC, 00.50 product | gzip decompressed, GRIB edition 2, file length and terminator verified; raster values not decoded | KEEP research only; not linked to 2024 event; dataset-specific terms and decoding pending |
| Colorado Public Addresses | Esri JSON query | 1,309 bytes | State service queried 2026-11-24 | two candidate rows, exact address match object 2231386 | KEEP; commercial application use with attribution, resale prohibited |
| Fort Collins GIS Addresses | Esri JSON query | 1,886 bytes | City service queried 2026-11-24 | three candidates; exact base-address match object 62860, two building variants excluded | KEEP cross-check; copyright City of Fort Collins GIS; separate redistribution rights pending |
| Colorado Public Parcels | GeoJSON query | See manifest | State service queried 2026-11-24; county received 03/27/2026 | one polygon intersected published state address point; matching situs address | KEEP; commercial application use with attribution, resale of individual service prohibited |
| Fort Collins code and permits | HTML | 129,770 / 319,519 bytes | Retrieved 2026-11-24 | city code page and permit guidance; not a professional applicability determination | KEEP source-linked facts; model code and legal determination pending |
| CSFS wildfire risk viewer and WUI tile metadata | HTML / JSON | 1,973 / 5,440 bytes | Viewer version 2.0.7; tile service metadata | Browser opened disclaimer, read only; no modeled grid downloaded | PARK for commercial use: viewer information expressly noncommercial. Seek separately licensed alternative |
| NOAA MRMS documentation | HTML attempt | — | NOAA NSSL and NOAA VLab | HTTP 410 Gone (NSSL), HTTP 403 Forbidden (VLab), public search returned official documentation; NCEP alternative index and GRIB downloaded | PARK documentation capture; no values integrated |

## License evidence

- [NOAA EFC metadata/data.gov](https://catalog.data.gov/dataset/event-footprint-catalog) identifies CC0. [Dataset source README](https://storage.googleapis.com/noaa-ncei-ipg/datasets/event-catalog/EFC_Dataset_README.md) describes hail-size bins, date, hour and MRMS source.
- [NOAA general copyright guidance](https://oceanservice.noaa.gov/about/faq.html) says most NOAA material is public domain subject to exceptions and attribution. Avoid implied endorsement.
- [State public address service](https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Addresses/FeatureServer) and [parcel service](https://gis.colorado.gov/public/rest/services/Address_and_Parcel/Colorado_Public_Parcels/MapServer) copyright text permits commercial application use with attribution and forbids resale of the source data. Parcel service clarifies that subscription applications are allowed, but downloading, repackaging and reselling the individual service is forbidden. Use derived records with source attribution, defer raw data resale/API sublicensing.
- State of Colorado Public addresses and parcels were accessed on 2026-11-24 from https://gis.colorado.gov/public/rest/services/Address_and_Parcel.
- [Colorado Wildfire Risk Viewer](https://tra-co-pub.coloradoforestatlas.org/) disclaimer explicitly limits information to noncommercial purposes. Its current UI describes a quarter-mile landscape screening buffer, version 2.0.7. No agreement accepted and no CSFS screening value obtained. Official [USFS Wildfire Risk to Communities downloads](https://wildfirerisk.org/download/) are a candidate alternative; rights and coverage still require review.
- [Fort Collins adopted code guidance](https://www.fortcollins.gov/Government/City-Code-and-Charter/Building-Code) says 2024 code editions apply to permit submissions on or after April 1, 2026; [roof guidance](https://www.fortcollins.gov/Business/Permits-and-Licensing/Building-Permits) states the class 4 asphalt shingle replacement threshold. Verify local amendments and application with jurisdiction before commercial use.

## Validated example

**Fort Collins City Hall** — 300 Laporte Ave, Fort Collins, CO 80521.
- State-published address point: 40.58987705000004, -105.08157321899995; city GIS base-address point differs approximately 27.3 meters. Coordinate precision and survey accuracy unknown.
- State parcel identifier **9711127901**; polygon contains state address point and situs address matches. Land-use field is reported as exempt; building features, ownership and physical condition are unknown.
- County context: 13 2024 hail/wind storm reports. NOAA event **1186168** reported 1 inch hail on July 20, 2024 at 17:53 local reported time, FT COLLINS, point 40.57, -105.05. This is an event report, not verification of property impact.
- Modeled footprint: the daily July 20 EFC file contains 4,173 polygons. The state address point intersected zero polygons. This is a point-screening result for one file, and actual exposure and damage remain unknown. Date boundaries and data completeness require additional validation before using it as a risk measure.
- Wildfire, roof, insurance, damage, downtime, repairs, financial outcomes and code compliance remain unknown.
- Shared record is used by Acquire, and the clearly labeled Protect/Operate workflow demonstrations. Learn remains research.

## Failed attempts and alternatives

- State address FeatureServer query initially returned HTTP 200 with ArcGIS JSON error 400, "Unable to complete operation." A MapServer query with string address number returned zero rows. The alternate full-address wildcard MapServer query returned the exact match.
- CSFS data page direct HTTP 403; official search and browser viewer reached. Held commercial values because the disclaimer prohibits commercial use.
- NSSL MRMS direct HTTP 410 and VLab HTTP 403; the NCEP operational MESH directory and a dated GRIB2 file succeeded.
- NOAA EFC official product page was accessible; official Google Cloud Storage listed the bucket and downloaded the 2024 daily file.
- MRMS sample is a recent operational download; source files roll out of the directory. Retain the checksummed snapshot. Historical raster extraction remains pending.

## Next gate

Review this source/record checkpoint before expanding region coverage, building a larger application, or commercializing. Independent review of terms, parcel precision, code applicability, historical MRMS and wildfire layer rights remains necessary. No private customer records are collected.
