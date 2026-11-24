import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {matchSite,makeRecord} from '../src/record.mjs';
const read=n=>JSON.parse(fs.readFileSync(new URL('../data/'+n+'.json',import.meta.url)));
const sites=read('sites'), events=read('events').events, rules=read('rules');
test('lookup supported aliases and rejects unknown address',()=>{assert.equal(matchSite('300 LAPORTE AVE.',sites).id,'FC-CITYHALL');assert.equal(matchSite('999 nowhere',sites),null)});
test('county match excludes other locations and preserves unknown damage',()=>{const r=makeRecord(sites[0],[...events,{county_fips:'08031',id:'other'}],rules);assert.equal(r.core_record.events.length,events.length);assert(r.core_record.events.every(e=>e.property_impact==='unknown'));assert(!('private_record' in r));});
test('archive nonempty with unique sourced IDs',()=>{assert(events.length>0);assert.equal(new Set(events.map(e=>e.id)).size,events.length);assert(events.every(e=>e.provenance.source_record_id===e.id&&e.county_fips==='08069'))});
