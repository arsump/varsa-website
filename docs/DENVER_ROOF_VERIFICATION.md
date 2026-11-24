# Denver roof verification

November 24, 2026. Reran the 25-parcel Denver audit. Confirmed eight commercial construction repair/replace records with a final date across five assessor schedule numbers. Their listed work addresses span eight entries, including several on the same parcel.

| Permit work address | Commercial record |
|---|---|
| 4255 N Kittredge St, building 1 | 2016-COMMCON-0001625 |
| 7604 E 29th | 2017-COMMCON-0000385 |
| 7596 E 29th | 2017-COMMCON-0000384 |
| 7592 E 29th Ave | 2017-COMMCON-0000383 |
| 2849 N Syracuse | 2020-COMMCON-0000913 |
| 7607 E 28th Ave | 2020-COMMCON-0000903 |
| 12635 E Albrook Dr | 2020-COMMCON-0002167 |
| 12185 E Albrook Dr | 2020-COMMCON-0002093 |

The [commercial GIS feed](https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/ArcGIS/rest/services/ODC_DEV_COMMERCIALCONSTPERMIT_P/FeatureServer/317) is limited to COMMCON and cannot establish roof scope from the repair class. Denver's [roofing guidance](https://www.denvergov.org/Government/Agencies-Departments-Offices/Agencies-Departments-Offices-Directory/Community-Planning-and-Development/Plan-Review-Permits-and-Inspections/Quick-Permits) says roof permits are applied for separately. The [public permit search](https://aca-prod.accela.com/DENVER/Cap/CapHome.aspx?TabName=Home&module=Development) returned an explicit Cloudflare block before any address lookup. No roof permit or inspection result was independently verified for this cohort. A blocked lookup is recorded as unavailable, not as no permit. Building, roof work, installed protection, and completion claims require a roof-specific record and a structure match.
