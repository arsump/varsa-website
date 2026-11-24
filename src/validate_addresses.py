import urllib.request,urllib.parse,json,concurrent.futures,datetime,pathlib
STATE='https://gis.colorado.gov/public/rest/services/Address_and_Parcel'
LIMIT='https://services1.arcgis.com/dLpFH5mwVvxSN4OE/arcgis/rest/services/City_Limits/FeatureServer/0/query'
def query(url,params):
 u=url+'?'+urllib.parse.urlencode({**params,'f':'json'})
 with urllib.request.urlopen(u,timeout=25) as r:d=json.load(r)
 if 'error' in d:raise ValueError(d['error'])
 return u,d
def check(a):
 try:
  au,ad=query(STATE+'/Colorado_Public_Addresses/MapServer/0/query',{'where':"AddrFull = '"+a+"' AND PlaceName = 'FORT COLLINS'",'outFields':'OBJECTID,AddrFull,PlaceName,Zipcode,County,MOD_DATE','returnGeometry':'true','outSR':4326,'resultRecordCount':20})
  features=ad.get('features',[])
  if len(features)!=1:return {'address':a,'status':'unresolved','candidates':len(features),'address_source':au}
  feature=features[0]
  g=feature['geometry']
  geom={'geometry':json.dumps(g),'geometryType':'esriGeometryPoint','inSR':4326,'spatialRel':'esriSpatialRelIntersects'}
  lu,ld=query(LIMIT,{**geom,'returnCountOnly':'true'})
  pu,pd=query(STATE+'/Colorado_Public_Parcels/MapServer/0/query',{**geom,'outFields':'OBJECTID,countyName,countyFips,parcel_id,situsAdd,sitAddCty,dateReceived','returnGeometry':'false','resultRecordCount':10})
  p=pd.get('features',[])
  return {'address':a,'status':'resolved','address_id':feature['attributes']['OBJECTID'],'city_boundary_count':ld['count'],'parcel_count':len(p),'parcel_id':p[0]['attributes']['parcel_id'] if len(p)==1 else None,'parcel_situs':p[0]['attributes']['situsAdd'] if len(p)==1 else None,'address_source':au,'city_boundary_source':lu,'parcel_source':pu}
 except Exception as e:return {'address':a,'status':'error','error':str(e)}
if __name__=='__main__':
 a=['300 LAPORTE AVE','215 N MASON ST','201 PETERSON ST','1200 RAINTREE DR','1801 RIVERSIDE AVE','112 WILLOW ST','215 E FOOTHILLS PKWY','281 N COLLEGE AVE','425 W PROSPECT RD','1001 E HARMONY RD']
 with concurrent.futures.ThreadPoolExecutor(max_workers=5) as e:r=list(e.map(check,a))
 (pathlib.Path(__file__).resolve().parents[1]/'audit/address-validation.json').write_text(json.dumps({'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'records':r},indent=2))
 for x in r:print(x['address'],x['status'],x.get('city_boundary_count'),x.get('parcel_count'),x.get('parcel_id'),x.get('error'))
