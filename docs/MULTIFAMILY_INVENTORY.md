# Fort Collins multifamily inventory checkpoint

November 24, 2026. Ingested the [Larimer County Assessor](https://www.larimer.gov/assessor/publicdata) 2026 account and improvement CSVs (~93 MB combined) into a repeatable, internal SQLite pilot. Selection: real property accounts with Fort Collins situs city and an improvement classified as Apartment ≤3 Stories or Apartment >3 Stories. This is an assessor-defined cohort; situs city is not a verified city boundary and codes can omit mixed-use buildings and other rental configurations. One account may cover several improvement IDs, and repeating addresses may cover several accounts. This is not a project/operator roster or a physical footprint join.

| Evidence | Coverage |
|---|---:|
| Apartment accounts and unique parcels | 871 each |
| Distinct situs addresses | 865 |
| Unique account/improvement IDs | 1,665 |
| Year built populated | 1,665 |
| Roof cover populated | 1,650 |
| Remodel year populated | 124 |
| Exact account situs matches to current, roof-keyword permit rows | 0 of 12 rows |

Roof cover and remodel dates are assessor descriptors, not installed-product verification or proof of roof work. Permit exact matching uses normalized punctuation/whitespace and deliberately retains ambiguous matches. A permit search miss does not establish that work did not occur: unit and secondary addresses, historical records and building footprint joins are outstanding. No storm-damage or completion inference was made.
 A manual spot check found current-permit rows for 1620 Azalea Dr and an assessor situs of 1620 Azalea Dr A-H. This is a secondary-address candidate, excluded from exact matches pending structure verification.

## Reproduce

Download county `assessor-public-account.csv` and `assessor-public-improvement.csv` from the county portal into a scratch directory. Save the city Current Building Permits query result as `permits.json`. Query layer 0 of [Building Permits](https://services1.arcgis.com/dLpFH5mwVvxSN4OE/arcgis/rest/services/Building_Permits/FeatureServer/0) with:

```sql
UPPER(B1_WORK_DESC) LIKE '%REROOF%' OR UPPER(B1_WORK_DESC) LIKE '%RE-ROOF%'
OR UPPER(B1_WORK_DESC) LIKE '%ROOF REPLACEMENT%' OR UPPER(PERMITTYPE) LIKE '%ROOF%'
```

Use `outFields=OBJECTID,ADDRESS,PERMITNUM,PERMITTYPE,B1_APPL_STATUS,B1_WORK_DESC`, `returnGeometry=false`, `f=json`. Run `python src/audit_multifamily.py /path/to/input --database /path/to/internal.sqlite`. The aggregate output records byte sizes and SHA-256 fingerprints. Retain the snapshot date and attribution. Source rows, contacts, and the internal database are excluded from the public preview. County data is for assessment purposes with accuracy/completeness disclaimers. Commercial redistribution rights were not established for the county and municipal rows.

Acquire uses the same decision rule across its existing Core Records, starting with address-point flood overlap when observed and otherwise surfacing unresolved roof capital evidence. The internal inventory is not yet served by the lookup. Next join the inventory to municipality boundaries and footprint/secondary-address identifiers, then test historical permit and completion coverage before integrating records into the preview.
