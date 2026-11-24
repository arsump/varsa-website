import sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'src'))
from ingest import normalize, FIELDS
class Normalize(unittest.TestCase):
    def row(self):
        r=dict.fromkeys(FIELDS,'')
        r.update(STATE='COLORADO',CZ_TYPE='C',CZ_NAME='LARIMER',EVENT_TYPE='Hail',EVENT_ID='1',STATE_FIPS='8',CZ_FIPS='69',MAGNITUDE='1.5')
        return r
    def test_unknown_point(self):
        r=normalize(self.row(),'2026-11-24')
        self.assertIsNone(r['point'])
        self.assertEqual(r['property_impact'],'unknown')
        self.assertEqual(r['county_fips'],'08069')
    def test_zone_excluded(self):
        r=self.row();r['CZ_TYPE']='Z'
        self.assertIsNone(normalize(r,'test'))
    def test_missing_schema(self):
        with self.assertRaises(ValueError): normalize({},'test')
if __name__=='__main__': unittest.main()
