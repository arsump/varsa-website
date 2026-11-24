"""Test municipal address-to-footprint coverage for an assessor snapshot."""
import argparse
import hashlib
import json
import re
import sqlite3
from collections import Counter, defaultdict
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen

BASE = 'https://services1.arcgis.com/dLpFH5mwVvxSN4OE/ArcGIS/rest/services/'
STREET_END = r'^(.+ (?:ST|AVE|RD|DR|BLVD|CT|LN|PL|WAY|CIR|PKWY|TER))(?: [NSEW])? (?:[A-Z]-[A-Z]|\d+-\d+)$'


def query(layer, params):
    url = BASE + layer + '/FeatureServer/0/query?' + urlencode({'f': 'json', 'outSR': 4326, **params})
    with urlopen(url, timeout=40) as response:
        data = json.load(response)
    if data.get('error') or data.get('exceededTransferLimit') or 'features' not in data:
        raise ValueError(f'Incomplete response from {layer}')
    return data['features']


def batches(values, size=35):
    return [values[i:i + size] for i in range(0, len(values), size)]


def city_addresses(keys):
    escaped = ','.join("'" + key.replace("'", "''") + "'" for key in keys)
    return query('Addresses', {'where': f'UPPER(ADDRESS) IN ({escaped})',
                 'outFields': 'OBJECTID,ADDRESS,ACTIVE', 'returnGeometry': 'true'})


def footprints(points):
    return query('Buildings', {'geometry': json.dumps({'points': points}, separators=(',', ':')),
                 'geometryType': 'esriGeometryMultipoint', 'inSR': 4326,
                 'spatialRel': 'esriSpatialRelIntersects', 'outFields': 'OBJECTID',
                 'returnGeometry': 'true'})


def contains(point, polygon):
    x, y = point
    inside = False
    for ring in polygon['rings']:
        for (ax, ay), (bx, by) in zip(ring, ring[1:]):
            if (ay > y) != (by > y) and x < (bx - ax) * (y - ay) / (by - ay) + ax:
                inside = not inside
    return inside


def audit(database):
    with sqlite3.connect(database) as db:
        keys = [row[0] for row in db.execute("SELECT DISTINCT situs FROM assessor_buildings WHERE situs <> '' ORDER BY situs")]
    alternatives = {key: match[1] for key in keys if (match := re.fullmatch(STREET_END, key))}
    with ThreadPoolExecutor(max_workers=6) as pool:
        groups = list(pool.map(city_addresses, batches(sorted(set(keys) | set(alternatives.values())))))
    by_key = defaultdict(set)
    for feature in (f for group in groups for f in group):
        geometry = feature.get('geometry')
        if geometry:
            by_key[' '.join(feature['attributes']['ADDRESS'].upper().split())].add((geometry['x'], geometry['y']))
    limits = query('City_Limits', {'where': '1=1', 'outFields': 'OBJECTID', 'returnGeometry': 'true'})
    unique_points = sorted({next(iter(pts)) for pts in by_key.values() if len(pts) == 1})
    in_city = {point for point in unique_points if any(contains(point, item['geometry']) for item in limits)}
    with ThreadPoolExecutor(max_workers=6) as pool:
        groups = list(pool.map(footprints, batches(sorted(in_city))))
    geometry_by_id = {f['attributes']['OBJECTID']: f['geometry'] for group in groups for f in group}
    coverage = Counter()
    building_ids = set()
    for key in keys:
        points = by_key[key]
        if not points:
            coverage['no_exact_point'] += 1
            if key in alternatives and len(by_key[alternatives[key]]) == 1:
                coverage['range_stripped_candidates'] += 1
            continue
        if len(points) != 1:
            coverage['multiple_exact_points'] += 1
            continue
        point = next(iter(points))
        if point not in in_city:
            coverage['exact_point_outside_boundary'] += 1
            continue
        ids = [key for key, polygon in geometry_by_id.items() if contains(point, polygon)]
        if len(ids) == 1:
            coverage['exact_point_one_footprint'] += 1
            building_ids.update(ids)
        elif ids:
            coverage['exact_point_multiple_footprints'] += 1
        else:
            coverage['exact_point_no_footprint'] += 1
    return {'addresses': len(keys), **dict(coverage), 'distinct_single_candidate_footprints': len(building_ids),
            'inventory_sha256': hashlib.sha256(database.read_bytes()).hexdigest()}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('inventory', type=Path)
    print(json.dumps(audit(parser.parse_args().inventory), indent=2))
