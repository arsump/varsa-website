import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {daysAfterEvent,matchesPierAddress} from '../src/recovery.mjs';

test('pier lookup accepts the facility address and excludes nearby buildings', () => {
  assert.ok(matchesPierAddress('20800 E. Beach Boulevard, Gulf Shores, AL 36542'));
  assert.ok(matchesPierAddress('Gulf State Park Pier'));
  assert.equal(matchesPierAddress('21196 East Beach Blvd'), false);
  assert.equal(matchesPierAddress('20800 East Beach Blvd, Miami'), false);
});

test('recovery milestones preserve partial reopening and unknown payments', () => {
  const data = JSON.parse(readFileSync(new URL('../data/pier-recovery.json',import.meta.url)));
  assert.deepEqual(data.milestones.map(m=>daysAfterEvent(data.event_date,m.date)),[null,null,136,1433]);
  assert.equal(data.economics.find(item=>item.label==='Verified storm-only payments').amount_usd,null);
});
