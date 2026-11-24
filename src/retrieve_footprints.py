"""Retrieve NOAA EFC UTC daily polygons and retain Front Range bounding-box subset."""
import pathlib,json,urllib.request,hashlib,datetime
ROOT=pathlib.Path(__file__).resolve().parents[1]
bbox=[-106.1,40,-104.7,41.1]
def points(g):
 for poly in ([g['coordinates']] if g['type']=='Polygon' else g['coordinates']):
  for ring in poly:
   yield from ring
def overlaps(f):
 xy=list(points(f['geometry']));xs=[x[0] for x in xy];ys=[x[1] for x in xy]
 return max(xs)>=bbox[0] and min(xs)<=bbox[2] and max(ys)>=bbox[1] and min(ys)<=bbox[3]
def run():
 archives=[];features=[]
 for date in ['2024-07-20','2024-07-21']:
  u='https://storage.googleapis.com/noaa-ncei-ipg/datasets/event-catalog/hail/mrms_hail_data_'+date+'.geojson'
  p=ROOT/'audit/raw'/('footprint-'+date+'.geojson')
  if not p.exists():
   with urllib.request.urlopen(u,timeout=60) as r:p.write_bytes(r.read())
  b=p.read_bytes();d=json.loads(b);assert all(f['properties']['date']==date for f in d['features'])
  subset=[f for f in d['features'] if overlaps(f)]
  archives.append({'date':date,'source_url':u,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'source_features':len(d['features']),'retained_features':len(subset)})
  features.extend(subset)
 (ROOT/'data/hail-footprints.json').write_text(json.dumps({'retrieved_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'archives':archives,'bbox':bbox,'type':'FeatureCollection','features':features},separators=(',',':')))
 print(archives)
if __name__=='__main__':run()
