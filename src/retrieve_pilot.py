"""Fetch the small pilot subset and document each attempt; no paid/API credentials."""
import argparse, concurrent.futures, datetime, hashlib, json, pathlib, urllib.parse, urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1]
RAW=ROOT/'audit'/'raw'
def query(url, **params):return url+'?'+urllib.parse.urlencode(params)
STATE='https://gis.colorado.gov/public/rest/services/Address_and_Parcel'
FC='https://services1.arcgis.com/dLpFH5mwVvxSN4OE/arcgis/rest/services/Addresses/FeatureServer/0'
SOURCES={
'storm-2024.csv.gz':'https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/StormEvents_details-ftp_v1.0_d2024_c20261119.csv.gz',
'footprint-2024-07-20.geojson':'https://storage.googleapis.com/noaa-ncei-ipg/datasets/event-catalog/hail/mrms_hail_data_2024-07-20.geojson',
'footprint-readme.md':'https://storage.googleapis.com/noaa-ncei-ipg/datasets/event-catalog/EFC_Dataset_README.md',
'mrms-20261124.grib2.gz':'https://mrms.ncep.noaa.gov/data/2D/MESH/MRMS_MESH_00.50_20261124-185438.grib2.gz',
'mrms-doc.html':'https://vlab.noaa.gov/web/mrms',
'state-address-terms.json':STATE+'/Colorado_Public_Addresses/FeatureServer?f=pjson',
'state-parcel-terms.json':STATE+'/Colorado_Public_Parcels/MapServer?f=pjson',
'state-address-query.json':query(STATE+'/Colorado_Public_Addresses/MapServer/0/query',where="AddrFull LIKE '300%Laporte%' OR AddrFull LIKE '300%LAPORTE%'",outFields='OBJECTID,AddrFull,PlaceName,Zipcode,County,ParcelID,MOD_DATE',returnGeometry='true',outSR=4326,f='json',resultRecordCount=20),
'fc-address-query.json':query(FC+'/query',where="NUMBER_ = 300 AND STRNAME LIKE '%LAPORTE%'",outFields='OBJECTID,ADDRESS,FULL_ADDRESS,CITY,STATE,ZIP,LAST_EDITED_DATE',returnGeometry='true',outSR=4326,f='json',resultRecordCount=20),
'fc-address-meta.json':FC+'?f=pjson',
'fc-code.html':'https://www.fortcollins.gov/Government/City-Code-and-Charter/Building-Code',
'fc-roof.html':'https://www.fortcollins.gov/Business/Permits-and-Licensing/Building-Permits',
'csfs-viewer.html':'https://tra-co-pub.coloradoforestatlas.org/',
'csfs-wui-meta.json':'https://tiles.arcgis.com/tiles/KNdRU5cN6ENqCTjk/arcgis/rest/services/WUI_Risk_WTL1/MapServer?f=pjson',
}
def fetch(item):
 name,url=item
 row={'name':name,'url':url,'retrieved_at':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 try:
  with urllib.request.urlopen(url,timeout=60) as response:
   data=response.read(30_000_001)
   if len(data)>30_000_000:raise ValueError('Response exceeded 30 MB retrieval bound')
   (RAW/name).write_bytes(data)
   row.update(http_status=response.status,bytes=len(data),sha256=hashlib.sha256(data).hexdigest(),content_type=response.headers.get('Content-Type'),status='downloaded',final_url=response.url)
   if name.endswith(('.json','.geojson')):
    obj=json.loads(data)
    if 'error' in obj:row.update(status='service_error',error=obj['error'])
    elif 'features' in obj:row['feature_count']=len(obj['features'])
 except Exception as e:row.update(status='failed',error=str(e))
 return row
if __name__=='__main__':
 RAW.mkdir(parents=True,exist_ok=True)
 with concurrent.futures.ThreadPoolExecutor(max_workers=6) as executor: manifest=list(executor.map(fetch,SOURCES.items()))
 address_result=next(i for i in manifest if i['name']=='state-address-query.json')
 if address_result['status']=='downloaded':
  matches=[f for f in json.loads((RAW/'state-address-query.json').read_text())['features'] if f['attributes']['AddrFull']=='300 LAPORTE AVE' and f['attributes']['PlaceName']=='FORT COLLINS']
  if len(matches)==1:
   parcel_url=query(STATE+'/Colorado_Public_Parcels/MapServer/0/query',geometry=json.dumps(matches[0]['geometry']),geometryType='esriGeometryPoint',inSR=4326,spatialRel='esriSpatialRelIntersects',outFields='OBJECTID,countyName,countyFips,parcel_id,situsAdd,sitAddCty,sitAddZip,landUseDsc,dateReceived',returnGeometry='true',outSR=4326,f='geojson')
   manifest.append(fetch(('state-parcel-query.geojson',parcel_url)))
 (ROOT/'audit'/'downloads.json').write_text(json.dumps(manifest,indent=2))
 for d in manifest:print(d['name'],d['status'],d.get('bytes'),d.get('feature_count'),d.get('error'))
