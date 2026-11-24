"""Retrieve two county records from FEMA's official National Risk Index layer."""
import datetime,hashlib,json,pathlib,urllib.parse,urllib.request
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE='https://services.arcgis.com/XG15cJAlne2vxtgt/arcgis/rest/services/National_Risk_Index_Counties/FeatureServer/0'
HAZARDS={'AVLN':'Avalanche','CFLD':'Coastal flooding','CWAV':'Cold wave','DRGT':'Drought','ERQK':'Earthquake','HAIL':'Hail','HWAV':'Heat wave','HRCN':'Hurricane','ISTM':'Ice storm','LNDS':'Landslide','LTNG':'Lightning','IFLD':'Inland flooding','SWND':'Strong wind','TRND':'Tornado','TSUN':'Tsunami','VLCN':'Volcanic activity','WFIR':'Wildfire','WNTW':'Winter weather'}
def run():
 fields=['STCOFIPS','STATE','COUNTY','NRI_VER']+[k+'_RISKR' for k in HAZARDS]
 url=BASE+'/query?'+urllib.parse.urlencode({'where':"STCOFIPS IN ('08069','08123')",'outFields':','.join(fields),'returnGeometry':'false','f':'json'})
 with urllib.request.urlopen(url,timeout=45) as r:b=r.read()
 d=json.loads(b);assert 'error' not in d,d
 rows=[f['attributes'] for f in d['features']]
 assert {str(x['STCOFIPS']).zfill(5) for x in rows}=={'08069','08123'}
 (ROOT/'audit/raw/nri-county-query.json').write_bytes(b)
 results={str(x['STCOFIPS']).zfill(5):{'county':x['COUNTY'],'version':x['NRI_VER'],'hazards':[{ 'family':name,'rating':x.get(k+'_RISKR')} for k,name in HAZARDS.items()]} for x in rows}
 result={'source_url':url,'source_item':'https://www.arcgis.com/home/item.html?id=39485e8035d446a5bff03259508ae355','retrieved_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'evidence_kind':'FEMA county-level relative risk index rating','limitations':['Planning context only','County ratings do not determine property risk, damage or insurance eligibility'],'attribution':'This product uses the Federal Emergency Management Agency’s National Risk Index dataset API or downloadable datasets but is not endorsed by FEMA. The Federal Government or FEMA cannot vouch for the data or analyses derived from these data after the data have been retrieved from the Agency’s website(s).','counties':results}
 (ROOT/'data/nri.json').write_text(json.dumps(result,indent=2))
 print(results)
if __name__=='__main__':run()
