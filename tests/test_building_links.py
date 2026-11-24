import re
import unittest
from src.audit_building_links import STREET_END, contains


class BuildingLinksTest(unittest.TestCase):
    def test_polygon_holes(self):
        polygon = {'rings': [
            [(0, 0), (0, 10), (10, 10), (10, 0), (0, 0)],
            [(2, 2), (8, 2), (8, 8), (2, 8), (2, 2)]
        ]}
        self.assertTrue(contains((1, 1), polygon))
        self.assertFalse(contains((5, 5), polygon))
        self.assertFalse(contains((11, 1), polygon))

    def test_address_range_is_a_candidate(self):
        self.assertEqual(re.fullmatch(STREET_END, '1620 AZALEA DR A-H')[1], '1620 AZALEA DR')
        self.assertIsNone(re.fullmatch(STREET_END, '1620 AZALEA DR'))
