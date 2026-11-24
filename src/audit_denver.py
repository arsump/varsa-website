"""Measure permit coverage for a fixed assessor-defined Denver sample."""
import json
from datetime import date
from urllib.parse import urlencode
from urllib.request import urlopen

BASE = 'https://services1.arcgis.com/zdB7qR0BtYrg0Xpl/ArcGIS/rest/services/'


def query(layer, **params):
    with urlopen(BASE + layer + '/query?' + urlencode(dict(f='json', returnGeometry='false', **params)), timeout=25) as response:
        data = json.load(response)
    if 'features' not in data or (data.get('exceededTransferLimit') and 'resultRecordCount' not in params):
        raise ValueError('Incomplete response: ' + layer)
    return [item['attributes'] for item in data['features']]


parcels = query('ODC_PROP_PARCELS_A/FeatureServer/245',
                where="D_CLASS_CN IN ('RESIDENTIAL-APARTMENT','RESIDENTIAL-MULTI UNIT APTS') AND TOT_UNITS >= 5 AND (COM_ORIG_YEAR_BUILT BETWEEN 1800 AND 2014 OR RES_ORIG_YEAR_BUILT BETWEEN 1800 AND 2014) AND SCHEDNUM IS NOT NULL",
                outFields='SCHEDNUM', orderByFields='SCHEDNUM ASC,OBJECTID ASC', resultRecordCount=25)
keys = {row['SCHEDNUM'] for row in parcels}
if len(keys) != 25 or any(not k.isdigit() for k in keys):
    raise ValueError('Expected 25 unique numeric schedule numbers')
permits = query('ODC_DEV_COMMERCIALCONSTPERMIT_P/FeatureServer/317',
                where="SCHEDNUM IN (" + ','.join("'" + key + "'" for key in sorted(keys)) + ')',
                outFields='SCHEDNUM,PERMIT_NUM,FINAL_DATE,CLASS')
assert all(row['SCHEDNUM'] in keys for row in permits)
repair = [row for row in permits if row['CLASS'] == 'Repair/Replace']
final_repairs = [row for row in repair if row['FINAL_DATE'] is not None]
print(json.dumps({
    'retrieved': date.today().isoformat(),
    'sample_parcels': len(keys),
    'parcels_with_commercial_permits': len({row['SCHEDNUM'] for row in permits}),
    'matched_permits': len(permits),
    'repair_replace_permits': len(repair),
    'repair_replace_with_final_date': len(final_repairs),
    'parcels_with_final_dated_repair_replace': len({row['SCHEDNUM'] for row in final_repairs}),
    'permits_with_final_date': sum(row['FINAL_DATE'] is not None for row in permits),
    'parcels_with_dated_final': len({row['SCHEDNUM'] for row in permits if row['FINAL_DATE'] is not None}),
    'matched_permit_classes': sorted({row['CLASS'] for row in permits if row['CLASS']})
}, indent=2))
