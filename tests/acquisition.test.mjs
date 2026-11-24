import assert from 'node:assert/strict';
import {test} from 'node:test';
import {matchBryanAddress} from '../src/acquisition.mjs';

test('accepts three documented Bryan addresses without joining nearby properties', () => {
  assert.equal(matchBryanAddress('100 S. Bryan Ave., Fort Collins, CO 80521'),'100 S Bryan Ave');
  assert.equal(matchBryanAddress('106 South Bryan Avenue'),'106 S Bryan Ave');
  assert.equal(matchBryanAddress('114 S Bryan Ave'),'114 S Bryan Ave');
  assert.equal(matchBryanAddress('Village on Bryan'),'Village on Bryan');
  assert.equal(matchBryanAddress('116 S Bryan Ave'),null);
  assert.equal(matchBryanAddress('100 N Bryan Ave'),null);
  assert.equal(matchBryanAddress('100 S Bryan Ave, Denver, CO'),null);
});

test('mapped overlap is prioritized while an unavailable check stays unresolved', async () => {
  const {acquisitionDecision}=await import('../src/acquisition.mjs');
  const core_record={flood_map_checks:[{status:'intersection'}]};
  assert.match(acquisitionDecision({core_record}).headline,/flood/);
  assert.match(acquisitionDecision({core_record:{}}).reason,/does not establish/);
  assert.match(acquisitionDecision({core_record:{flood_map_checks:[{status:'unavailable'}]}}).headline,/roof/);
});
