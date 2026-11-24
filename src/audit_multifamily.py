"""Audit bulk assessor coverage without publishing source rows."""
import argparse
import csv
import hashlib
import json
import sqlite3
from collections import Counter, defaultdict
from pathlib import Path


def address_key(value):
    return ' '.join(value.upper().replace('.', '').replace(',', '').split())


def rows(path):
    with path.open(encoding='utf-8-sig', newline='') as source:
        yield from csv.DictReader(source)


def audit(directory, database=None):
    account_path = directory / 'assessor-public-account.csv'
    improvement_path = directory / 'assessor-public-improvement.csv'
    permit_path = directory / 'permits.json'
    accounts = {}
    for row in rows(account_path):
        if row['SITUSCITY'].strip().upper() == 'FORT COLLINS' and row['ACCOUNTNO'].startswith('R'):
            if row['ACCOUNTNO'] in accounts:
                raise ValueError('Duplicate real property account')
            accounts[row['ACCOUNTNO']] = row
    buildings = {}
    for row in rows(improvement_path):
        account = accounts.get(row['ACCOUNTNO'])
        if not account or row['BLTASDESCRIPTION'] not in {'Apartment <= 3 Stories', 'Apartment > 3 Stories'}:
            continue
        if not row['IMPNO'] or row['PARCELNO'] != account['PARCELNO']:
            raise ValueError('Unresolved improvement identity')
        key = (row['ACCOUNTNO'], row['IMPNO'])
        fields = ('PARCELNO', 'BLTASYEARBUILT', 'ROOFCOVER', 'YEARREMODELED')
        incoming = {field: row[field].strip() for field in fields}
        existing = buildings.setdefault(key, incoming)
        for field in fields:
            if existing[field] and incoming[field] and existing[field] != incoming[field]:
                raise ValueError(f'Conflicting assessor field: {field}')
            existing[field] = existing[field] or incoming[field]

    apartment_accounts = {account for account, _ in buildings}
    addresses = defaultdict(set)
    for account in apartment_accounts:
        address = address_key(accounts[account]['SITUSADDRESS'])
        if address:
            addresses[address].add(account)

    permits = json.loads(permit_path.read_text())
    if 'features' not in permits or permits.get('error') or permits.get('exceededTransferLimit'):
        raise ValueError('Permit response unavailable or incomplete')
    matched = Counter()
    for feature in permits['features']:
        candidates = addresses.get(address_key(feature['attributes']['ADDRESS']))
        if candidates:
            matched.update(['unique_account' if len(candidates) == 1 else 'ambiguous_account'])

    def populated(field):
        return sum(record[field].upper() not in {'', '0', 'UNKNOWN', 'NONE', 'N/A'} for record in buildings.values())

    if database is not None:
        with sqlite3.connect(database) as db:
            db.execute('CREATE TABLE IF NOT EXISTS assessor_buildings (account TEXT, improvement TEXT, parcel TEXT, situs TEXT, year_built TEXT, roof_cover TEXT, remodel_year TEXT, PRIMARY KEY(account, improvement))')
            db.execute('DELETE FROM assessor_buildings')
            db.executemany('INSERT INTO assessor_buildings VALUES (?, ?, ?, ?, ?, ?, ?)', (
                (account, number, row['PARCELNO'], address_key(accounts[account]['SITUSADDRESS']),
                 row['BLTASYEARBUILT'], row['ROOFCOVER'], row['YEARREMODELED'])
                for (account, number), row in buildings.items()
            ))
            db.execute('CREATE INDEX IF NOT EXISTS assessor_situs ON assessor_buildings(situs)')
            db.execute('PRAGMA user_version=1')

    return {
        'tax_years': sorted({accounts[key]['TAXYEAR'] for key in apartment_accounts}),
        'apartment_accounts': len(apartment_accounts),
        'apartment_parcels': len({row['PARCELNO'] for row in buildings.values()} - {''}),
        'apartment_improvements': len(buildings),
        'accounts_with_situs': sum(map(len, addresses.values())),
        'distinct_situs_addresses': len(addresses),
        'improvements_with_year_built': populated('BLTASYEARBUILT'),
        'improvements_with_roof_cover': populated('ROOFCOVER'),
        'improvements_with_remodel_year': populated('YEARREMODELED'),
        'permit_keyword_rows': len(permits['features']),
        'permit_address_matches': dict(matched),
        'inputs': {p.name: {'bytes': p.stat().st_size, 'sha256': hashlib.file_digest(p.open('rb'), 'sha256').hexdigest()} for p in (account_path, improvement_path, permit_path)},
    }


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory', type=Path)
    parser.add_argument('--database', type=Path, help='Internal SQLite snapshot outside the published site')
    args = parser.parse_args()
    print(json.dumps(audit(args.directory, args.database), indent=2))
