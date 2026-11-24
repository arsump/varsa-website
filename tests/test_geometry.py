import sys, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'src'))
from validate_pilot import contains
class Geometry(unittest.TestCase):
    def test_polygon_with_hole(self):
        geometry={'type':'Polygon','coordinates':[[[0,0],[4,0],[4,4],[0,4],[0,0]],[[1,1],[2,1],[2,2],[1,2],[1,1]]]}
        self.assertTrue(contains([3,3],geometry))
        self.assertFalse(contains([1.5,1.5],geometry))
        self.assertFalse(contains([5,5],geometry))
    def test_multipolygon(self):
        geometry={'type':'MultiPolygon','coordinates':[[[[0,0],[4,0],[4,4],[0,4],[0,0]]]]}
        self.assertTrue(contains([2,2],geometry))
