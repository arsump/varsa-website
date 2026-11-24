# VARSA Core Record checkpoint

November 24, 2026 · Fort Collins, Colorado · development preview

## Try the address-only workflow

Enter **300 Laporte Ave** in [Acquire](https://deploy-preview-1--varsa-website.netlify.app/#acquire), then open Protect and Operate without changing the selection. The shared record resolves to parcel **9711127901**. The documented 1978 completion refers to the named municipal building.

| View | Decision output | Evidence boundary |
|---|---|---|
| Acquire · Sites and Build | Parcel and location match, flood and event screens, building chronology and current permit context | Address point versus building footprint; requirements depend on work and application date |
| Protect · Broker and Lend | Protection evidence and its limits, plus comparative material economics for collateral review | Installed roof assembly, certification, policy terms and actual losses unknown |
| Operate · Assets, Change and Events | Address-point map status, municipal approval milestone and nearest reported event | The approval does not establish completion. The NOAA point does not establish damage, interruption or recovery. |
| Learn · Performance | Evidence methodology and outcome research | Published reference evidence only. No property-level outcome score. |

## Audit and data register

The previous build already supported an address/parcel lookup, downloadable JSON/PDF, local map screening and a session portfolio. Protect and Operate largely repeated the selected property label. The optional property history wrote user-entered notes into Core JSON and showed their count in the portfolio. The updated preview keeps those legacy notes in browser storage exclusively. Neither property lookup nor Core assembly requires notes, sign-in or uploaded files. A production Private Record requires separately permissioned storage and explicit sharing controls; this preview only supports local notes and no document uploads.

| Intelligence layer | Real structured data in the application | Reviewed sources added for this address | Distribution and principal gaps |
|---|---|---|---|
| Identity and building | Colorado address and parcel records, cross-checked against city address GIS; seven curated sites and a live lookup within Fort Collins | City Historic Preservation, named building completed in 1978 | Preserve State attribution and geometry precision. City historical fact summarized with link. Footprint-to-building matching, roof assembly and construction details need direct evidence. |
| Hazards | Five NOAA Storm Events annual files, 2020–2024, with point and county/forecast-zone context; two NOAA radar-derived hail footprint dates; FEMA NRI all 18 hazards at county scale; USFS modeled wildfire community ranks; live address-point flood map checks | Closest NOAA report selected by great-circle distance within five miles, generated from existing data | NOAA attribution, FEMA terms and attribution, USFS CC0, live query provenance; see [SOURCES.md](SOURCES.md). CSFS parcel-scale WUI adoption/boundary matching and building exposure remain gaps. MRMS exploratory files are not part of the product inference. |
| Protection and standards | Existing local requirement summaries and official references | City project MA260017 matched by street address and parcel; city 2024 code editions/local amendments effective for applications from April 1, 2026 | Link and summarize official facts. Bulk municipal permit rights need confirmation. Obtain final-inspection or completion evidence, verified installed products and certifications. |
| Performance | No property-specific outcomes | IBHS controlled tests show variability among new asphalt shingles under 2-inch laboratory hail | Paraphrase and link. Recover product and assembly identity, age, installation evidence and sufficiently comparable event intensity before applying the study. Collect documented damage and recovery observations independently where authorized. |
| Economics | No property-specific loss, premium or cost data | The same IBHS study reports material cost from seven US markets and a 9% average difference for higher-performing shingles in its sample | Paraphrase and link. Local installed costs, interruption, loss and coverage terms are unknown. Use authorized or explicitly redistributable datasets before distributing economic records. |

Existing ingestion and checks are documented in [SOURCES.md](SOURCES.md), [DATA_CHECKPOINT_2026-11-24.md](DATA_CHECKPOINT_2026-11-24.md), and [CITYWIDE_CHECKPOINT.md](CITYWIDE_CHECKPOINT.md). The new building, approval, code and research findings are manually reviewed structured entries in [core-evidence.json](../data/core-evidence.json). The build does not yet automatically harvest those pages. The City Hall permit approval concerns exterior lights and supplies no evidence of a hail upgrade.

## Shared data model and commercial priorities

Core schema 0.2.0 adds a versioned resilience graph with source-linked findings, scope, dates, reuse descriptions, explicit gaps and typed relationships. The assembler applies property evidence only to the selected site and parcel, places code evidence at jurisdiction scope, and keeps benchmark applicability conditional. The three views use that same object. Public Research and self-service stay visible. A versioned JSON export is available now; an authenticated API, source-rights enforcement for licensing and longitudinal records remain proposed.

1. Resolve municipal building identity and commercial reuse. Seek machine-readable completion and final-inspection status, address and parcel join quality, and installed assembly/certification evidence.
2. Test matched field outcomes on one hazard/assembly pair. Record event time and intensity, protection at event time, independently documented damage, downtime and recovery. Define missingness and comparable cohorts before estimating effects.
3. Find paired, lawful economic records. Retain denominators, currency year, location, insured sample and policy restrictions. Avoid turning public benchmarks into property quotes.
4. Validate with buyers, brokers, lenders and asset operators whether sourced change and observed outcome linkage alters real decisions. [Cotality](https://www.cotality.com/products/building-permits) already combines permits with property data, and [First Street](https://firststreet.org/enterprise) offers modeled damage and financial risk. Differentiation remains a hypothesis around linking verified installed protection, comparable exposure and observed outcomes over time, with evidence suitable for audit.

No production release or commercial clearance is represented. NWF outside-business and IP review remains an unresolved release gate.
