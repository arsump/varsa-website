"""Validate downloaded government evidence and materialize one linked Property Record."""
import gzip, hashlib, json, math, pathlib, sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
RAW=ROOT/'audit'/'raw'
def read(name):return json.loads((RAW/name).read_text())
def ring_contains(point,ring):
    x,y=point
    inside=False
    for (x1,y1),(x2,y2) in zip(ring,ring[1:]):
        if (y1>y)!=(y2>y) and x < (x2-x1)*(y-y1)/(y2-y1)+x1:inside=not inside
    return inside
def contains(point,geometry):
    kind,coords=geometry['type'],geometry['coordinates']
    polygons=[coords] if kind=='Polygon' else coords if kind=='MultiPolygon' else []
    return any(ring_contains(point,p[0]) and not any(ring_contains(point,r) for r in p[1:]) for p in polygons)
def main():
    manifest=json.loads((ROOT/'audit/downloads.json').read_text())
    for item in manifest:
        if item['status']=='downloaded':
            data=(RAW/item['name']).read_bytes()
            assert hashlib.sha256(data).hexdigest()==item['sha256'],item['name']
    files={i['name']:i for i in manifest}
    a=[f for f in read('state-address-query.json')['features'] if f['attributes']['AddrFull']=='300 LAPORTE AVE' and f['attributes']['PlaceName']=='FORT COLLINS']
    assert len(a)==1
    state=a[0];point=[state['geometry']['x'],state['geometry']['y']]
    city=[f for f in read('fc-address-query.json')['features'] if f['attributes']['FULL_ADDRESS']=='300 LAPORTE AVE']
    assert len(city)==1
    other=[city[0]['geometry']['x'],city[0]['geometry']['y']]
    # approximate great-circle distance, using mean-latitude local approximation
    distance=math.hypot((point[0]-other[0])*111320*math.cos(math.radians(point[1])),(point[1]-other[1])*111320)
    parcel=read('state-parcel-query.geojson')['features'];assert len(parcel)==1
    assert contains(point,parcel[0]['geometry'])
    assert parcel[0]['properties']['situsAdd']=='300 LAPORTE AVE'
    footprints=read('footprint-2024-07-20.geojson')['features']
    assert all(f['geometry']['type'] in ['Polygon','MultiPolygon'] and f['properties']['date']=='2024-07-20' for f in footprints)
    intersect=[f['properties'] for f in footprints if contains(point,f['geometry'])]
    grib=gzip.open(RAW/'mrms-20261124.grib2.gz','rb').read()
    assert grib[:4]==b'GRIB' and grib[7]==2 and grib[-4:]==b'7777' and int.from_bytes(grib[8:16],'big')==len(grib)
    sites=json.loads((ROOT/'data/sites.json').read_text());s=sites[0]
    s.update(coordinates={'longitude':point[0],'latitude':point[1]},parcel_id=parcel[0]['properties']['parcel_id'],precision='state-published address point; independently cross-checked with city GIS; parcel intersection; positional accuracy unknown',location_provenance={'state_address_id':state['attributes']['OBJECTID'],'state_address_source':files['state-address-query.json']['url'],'city_address_id':city[0]['attributes']['OBJECTID'],'city_address_source':files['fc-address-query.json']['url'],'address_point_difference_m':round(distance,1),'parcel_id':parcel[0]['properties']['parcel_id'],'parcel_source':files['state-parcel-query.geojson']['url'],'retrieved_at':files['state-parcel-query.geojson']['retrieved_at'],'parcel_status':'reported parcel geometry match, survey accuracy unknown','attribution':'State of Colorado Public addresses and parcels were accessed on 2026-11-24 from https://gis.colorado.gov/public/rest/services/Address_and_Parcel'})
    result={'date':'2024-07-20','source_id':'NOAA-EFC','source_url':files['footprint-2024-07-20.geojson']['url'],'source_sha256':files['footprint-2024-07-20.geojson']['sha256'],'ingested_at':files['footprint-2024-07-20.geojson']['retrieved_at'],'evidence_kind':'modeled radar hail size','feature_count':len(footprints),'address_point_intersections':intersect,'interpretation':'Reported address point intersects modeled hail-size polygons' if intersect else 'No intersection with the downloaded daily modeled footprint polygons at the state address point; actual hail exposure remains unknown','property_impact':'unknown','limitations':['Point intersection only, not a parcel or building footprint analysis','Radar-derived hail estimates are not observed property impacts','Single dated file; coverage and model error not quantified']}
    s['footprint_screening']=result
    (ROOT/'data/sites.json').write_text(json.dumps(sites,indent=2))
    report={'address_state_id':state['attributes']['OBJECTID'],'address_city_id':city[0]['attributes']['OBJECTID'],'point_difference_m':round(distance,1),'parcel_id':s['parcel_id'],'parcel_intersection':True,'footprint_features':len(footprints),'point_intersections':len(intersect),'mrms_grib2_bytes':len(grib),'mrms_decoded_values':False}
    (ROOT/'audit/validation.json').write_text(json.dumps(report,indent=2))
    print(json.dumps(report,indent=2))
if __name__=='__main__':main()
