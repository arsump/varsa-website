import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {assembleResilience} from '../src/core-record.mjs';
import {makeRecord,matchSite} from '../src/record.mjs';

const data = name => JSON.parse(readFileSync(new URL('../data/' + name + '.json', import.meta.url)));
const sites = data('sites');
const evidence = data('core-evidence');
const weather = data('multihazard').events.filter(event => event.scope === 'county');

test('address-only record connects four layers with sourced, typed evidence', () => {
  const site = matchSite('300 Laporte Ave', sites);
  const core = assembleResilience(makeRecord(site, weather, data('rules')), evidence);
  assert.deepEqual(Object.keys(core.layers), ['hazards', 'protection', 'performance', 'economics']);
  for (const layer of Object.values(core.layers)) {
    assert.ok(layer.finding_ids.length > 0);
    assert.ok(layer.unknown);
    for (const id of layer.finding_ids) assert.match(core.findings[id].source_url, /^https:\/\//);
  }
  for (const {from, to} of core.relationships) assert.ok(core.findings[from] && core.findings[to]);
  assert.equal(core.findings['fc-ma260017'].kind, 'approval');
  assert.equal(core.findings['ibhs-hail-shingle-tests'].kind, 'controlled_test');
  assert.equal(core.findings['ibhs-shingle-cost-context'].kind, 'market_comparison');
  assert.match(core.findings[core.layers.hazards.finding_ids[0]].limit, /damage.*unknown/);
});

test('parcel mismatch suppresses curated property and comparison evidence', () => {
  const site = {...sites[0], parcel_id: 'different'};
  const core = assembleResilience(makeRecord(site, weather, data('rules')), evidence);
  assert.deepEqual(core.layers.protection.finding_ids, ['fc-codes-2026']);
  assert.deepEqual(core.layers.performance.finding_ids, []);
  assert.deepEqual(core.layers.economics.finding_ids, []);
  assert.deepEqual(core.relationships, []);
});
