# Multifamily building identity coverage

November 24, 2026. Ran the municipal [address point](https://services1.arcgis.com/dLpFH5mwVvxSN4OE/ArcGIS/rest/services/Addresses/FeatureServer), [city limit](https://services1.arcgis.com/dLpFH5mwVvxSN4OE/ArcGIS/rest/services/City_Limits/FeatureServer), and [building footprint](https://services1.arcgis.com/dLpFH5mwVvxSN4OE/ArcGIS/rest/services/Buildings/FeatureServer) joins against the existing 865 distinct assessor situs addresses.

| Conservative exact-situs result | Addresses |
|---|---:|
| One address point, inside city, one footprint | 26 |
| One address point, inside city, no footprint | 14 |
| One address point outside city limits | 11 |
| More than one city address point | 438 |
| No exact city address point | 376 |
| Total | 865 |

Distinct coordinates are counted per normalized address. Several distinct points can belong to one structure. Coincident points are collapsed for screening. A spatial hit is a candidate link; it does not verify the assessor improvement ID, permit scope, or installation. No source geometries or individual addresses are redistributed in this report. Reproduce with `python src/audit_building_links.py /path/to/inventory.sqlite`. The audit output includes the inventory fingerprint.

Next evaluate parcel-based links and the city's base and unit identifiers. For permit matching, retain project and parcel evidence separately until an improvement or structure can be identified.
