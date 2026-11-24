# Hurricane Sally public project cost audit

Retrieved November 24, 2026. OpenFEMA Public Assistance Funded Projects Details v2, Alabama declaration 4563. The catalog's v1 path returned HTML; v2 returned HTTP 200 JSON. No records were added to the Property Record or deployed.

```sh
curl -fsSG 'https://www.fema.gov/api/open/v2/PublicAssistanceFundedProjectsDetails' \
  --data-urlencode '$filter=disasterNumber eq 4563' \
  --data-urlencode '$top=1000' \
  --data-urlencode '$inlinecount=allpages' \
  -o sally-projects.json
```

The snapshot contained 386,164 bytes, SHA-256 `669bc2b33408f71ab50f6da8d7dfe2efde35b91419476a5fa276a0d017680dd6`. All 490 returned rows matched the declared count and disaster number, with 490 unique Grants Manager project IDs. Searched titles for lodge, interpretive, colonial, Gulf State Park, pier and boardwalk; also reviewed all seven rows sharing the two matching park projects' applicant ID.

| Worksheet | Match | FEMA project amount | Federal share obligated |
|---|---|---:|---:|
| 510 | Gulf State Park Pier, closed out in the dataset | $15,296,303.03 | $13,629,365.27 |
| 509 | Gulf State Park, multiple locations/sites | $1,335,455.90 | $1,201,910.31 |

The state separately describes the pier as a completed $13.6 million repair and enhancement project and confirms reopening August 19, 2024. It is a different asset from the Lodge and Interpretive Center. The FEMA record identifies Montgomery County, while the facility is on the Gulf Shores coast; use a separate facility identity source rather than the worksheet county to geolocate. The public round figure, FEMA project amount, and federal obligation have different definitions; no payment ledger was verified. The multi-site worksheet is ineligible for attribution to an individual building without scope or itemization. Zero direct title matches for the three named protected sites is a result of this screen, not proof of zero assistance.

Sources: [Federal dataset catalog](https://catalog.data.gov/dataset/public-assistance-funded-projects-details), [OpenFEMA terms](https://www.fema.gov/about/openfema/terms-conditions), [state completion account](https://www.outdooralabama.com/articles/rebuilt-gulf-state-park-pier-officially-reopened), [state reopening notice](https://outdooralabama.com/articles/gulf-state-park-pier-reopens-public).

Decision: public recovery economics belong in a facility/event record with explicit amount types (project amount, obligated share, announced contract, verified payment). This test produced zero verified paid costs for the protected cohort. The strongest independent data path is facility-specific public closeout/payment records for a defined public-asset portfolio, with installed protections verified separately. Customer uploads are unnecessary. Commercial release and NWF/IP gate are unchanged.
