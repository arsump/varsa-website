"""Normalize all reported county and explicitly named regional forecast-zone events."""
import csv,gzip,json,pathlib,collections,datetime,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE='https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/'
ZONES={'LARIMER & BOULDER COUNTIES BETWEEN 6000 & 9000 FEET','S & E JACKSON / LARIMER / N & NE GRAND / NW BOULDER COUNTIES ABOVE 9000 FEET','LARIMER COUNTY BELOW 6000 FEET / NW WELD COUNTY'}
FAMILIES={'Hail':'Hail','Thunderstorm Wind':'Wind','High Wind':'Wind','Strong Wind':'Wind','Tornado':'Tornado','Flash Flood':'Flood','Flood':'Flood','Heavy Rain':'Heavy rain','Winter Storm':'Winter weather','Winter Weather':'Winter weather','Heavy Snow':'Winter weather','Blizzard':'Winter weather','Ice Storm':'Winter weather','Frost/Freeze':'Cold','Cold/Wind Chill':'Cold','Extreme Cold/Wind Chill':'Cold','Heat':'Heat','Excessive Heat':'Heat','Wildfire':'Wildfire','Drought':'Drought','Lightning':'Lightning','Debris Flow':'Landslide','Avalanche':'Avalanche','Dust Storm':'Dust','Dense Fog':'Fog','High Surf':'Coastal','Storm Surge/Tide':'Coastal','Hurricane':'Tropical cyclone','Tropical Storm':'Tropical cyclone'}
def run():
 records=[];archives=[]
 for year in range(2020,2025):
  name=f'StormEvents_details-ftp_v1.0_d{year}_c20261119.csv.gz'
  p=ROOT/'audit'/'raw'/name
  source=BASE+name
  archives.append({'year':year,'source_url':source,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
  with gzip.open(p,'rt',encoding='latin1') as f:
   for r in csv.DictReader(f):
    county=r['CZ_TYPE']=='C' and r['CZ_NAME']=='LARIMER'
    regional=r['CZ_TYPE']=='Z' and r['CZ_NAME'] in ZONES
    if r['STATE']!='COLORADO' or not (county or regional):continue
    point=None
    if county and r['BEGIN_LAT'] and r['BEGIN_LON']:
     lat,lon=float(r['BEGIN_LAT']),float(r['BEGIN_LON'])
     if  -90<=lat<=90 and -180<=lon<=180:point=[lat,lon]
    records.append({'id':r['EVENT_ID'],'year':year,'county_fips':'08069' if county else None,'region':r['CZ_NAME'],'scope':'county' if county else 'regional forecast zone','event_type':r['EVENT_TYPE'],'family':FAMILIES.get(r['EVENT_TYPE'],r['EVENT_TYPE']),'observed_at_local':r['BEGIN_DATE_TIME'],'timezone_reported':r['CZ_TIMEZONE'],'location_reported':r['BEGIN_LOCATION'] or r['CZ_NAME'],'point':point,'magnitude':float(r['MAGNITUDE']) if r['MAGNITUDE'] and r['EVENT_TYPE'] in ['Hail','Thunderstorm Wind'] else None,'unit':'inches' if r['EVENT_TYPE']=='Hail' else 'knots' if r['EVENT_TYPE']=='Thunderstorm Wind' else None,'provenance':{'source_id':'NOAA-SE','source_url':source,'source_record_id':r['EVENT_ID'],'ingested_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'evidence_kind':'reported','spatial_precision':'reported location point, accuracy unknown' if point else 'regional forecast zone' if regional else 'county only','limitations':['County or regional context only','No verified property impact']},'property_impact':'unknown'})
 assert len({r['id'] for r in records})==len(records)
 (ROOT/'data'/'multihazard.json').write_text(json.dumps({'coverage':'Larimer County and three named regional forecast zones, 2020–2024','archives':archives,'events':records},separators=(',',':')))
 print(collections.Counter((r['scope'],r['family']) for r in records))
if __name__=='__main__':run()
