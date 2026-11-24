"""Reproducible, pinned NOAA import. Python standard library only."""
import argparse, csv, gzip, hashlib, json, pathlib, urllib.request
from datetime import datetime, timezone
ROOT = pathlib.Path(__file__).resolve().parents[1]
URL = 'https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/StormEvents_details-ftp_v1.0_d2024_c20261119.csv.gz'
FIELDS = {'EVENT_ID','STATE','CZ_TYPE','CZ_NAME','CZ_FIPS','STATE_FIPS','EVENT_TYPE','BEGIN_DATE_TIME','CZ_TIMEZONE','BEGIN_LAT','BEGIN_LON','BEGIN_LOCATION','MAGNITUDE','SOURCE'}

def normalize(row, ingested):
    if not FIELDS <= row.keys(): raise ValueError('Missing required NOAA fields')
    if row['STATE'] != 'COLORADO' or row['CZ_TYPE'] != 'C' or row['CZ_NAME'] != 'LARIMER' or row['EVENT_TYPE'] not in ('Hail','Thunderstorm Wind'):
        return None
    lat, lon = row['BEGIN_LAT'], row['BEGIN_LON']
    point = None
    if lat and lon:
        a,b = float(lat),float(lon)
        if -90 <= a <= 90 and -180 <= b <= 180: point = [a,b]
    return {'id':row['EVENT_ID'],'county_fips':row['STATE_FIPS'].zfill(2)+row['CZ_FIPS'].zfill(3),'event_type':row['EVENT_TYPE'],'observed_at_local':row['BEGIN_DATE_TIME'],'timezone_reported':row['CZ_TIMEZONE'],'location_reported':row['BEGIN_LOCATION'],'point':point,'magnitude':float(row['MAGNITUDE']) if row['MAGNITUDE'] else None,'unit':'inches' if row['EVENT_TYPE']=='Hail' else 'knots','report_source':row['SOURCE'],'provenance':{'source_id':'NOAA-SE','source_url':URL,'source_record_id':row['EVENT_ID'],'published_at':None,'archive_revision':'2026-11-19','ingested_at':ingested,'evidence_kind':'reported','spatial_precision':'reported point; accuracy unknown' if point else 'county only','license_status':'federal data; dataset-specific redistribution review pending','verification_status':'imported from official archive','limitations':['County context only','No verified property impact or severity footprint']},'property_impact':'unknown'}

def import_archive(path):
    stamp = datetime.now(timezone.utc).isoformat()
    with gzip.open(path,'rt',encoding='latin1',newline='') as f:
        reader=csv.DictReader(f)
        if not FIELDS <= set(reader.fieldnames or []): raise ValueError('Unexpected schema')
        records={}
        for row in reader:
            event=normalize(row,stamp)
            if event:
                if event['id'] in records: raise ValueError('Duplicate event ID')
                records[event['id']]=event
    return {'archive_url':URL,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'ingested_at':stamp,'coverage':'Larimer County, 2024, hail and thunderstorm wind only','events':sorted(records.values(),key=lambda e:e['id'])}

if __name__=='__main__':
    p=argparse.ArgumentParser(); p.add_argument('--archive',type=pathlib.Path); args=p.parse_args()
    path=args.archive or ROOT/'data'/'storm-events.csv.gz'
    if not args.archive: urllib.request.urlretrieve(URL,path)
    result=import_archive(path)
    (ROOT/'data'/'events.json').write_text(json.dumps(result,indent=2))
    print(f"Imported {len(result['events'])} unique events")
