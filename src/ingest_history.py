"""Download pinned NOAA annual archives and normalize Larimer County weather history."""
import concurrent.futures, hashlib, json, pathlib, urllib.request
from datetime import datetime, timezone
from ingest import import_archive
ROOT=pathlib.Path(__file__).resolve().parents[1]
BASE='https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/'
def ingest_year(year):
    name=f'StormEvents_details-ftp_v1.0_d{year}_c20261119.csv.gz'
    url=BASE+name
    path=ROOT/'audit'/'raw'/name
    if not path.exists():
        with urllib.request.urlopen(url,timeout=90) as response:
            data=response.read()
        path.write_bytes(data)
    archive=import_archive(path)
    for e in archive['events']:
        e['provenance']['source_url']=url
        e['provenance']['archive_revision']='2026-11-19'
        e['year']=year
    return {'year':year,'source_url':url,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size,'ingested_at':archive['ingested_at'],'events':archive['events']}
if __name__=='__main__':
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as pool:
        archives=list(pool.map(ingest_year,range(2020,2025)))
    events=[e for a in archives for e in a.pop('events')]
    assert len({e['id'] for e in events})==len(events)
    data={'coverage':'Larimer County, 2020–2024, hail and thunderstorm wind reports','ingested_at':datetime.now(timezone.utc).isoformat(),'archives':archives,'events':events}
    (ROOT/'data'/'history.json').write_text(json.dumps(data,separators=(',',':')))
    print(len(events),[(a['year'],a['bytes']) for a in archives])
