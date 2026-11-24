import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {makeRecord} from '../src/record.mjs';
const read=n=>JSON.parse(fs.readFileSync(new URL('../data/'+n+'.json',import.meta.url)));
test('FEMA county ratings have 18 named hazards and correct county/version',()=>{
 const d=read('nri');
 assert.deepEqual(Object.keys(d.counties).sort(),['08069','08123']);
 for (const c of Object.values(d.counties)){assert.equal(c.hazards.length,18);assert.equal(new Set(c.hazards.map(h=>h.family)).size,18);assert.equal(c.version,'December 2025')}
});
test('NOAA county and forecast zones stay distinct',()=>{
 const e=read('multihazard').events;
 assert.equal(e.length,317);assert.equal(new Set(e.map(x=>x.id)).size,317);
 assert.equal(e.filter(x=>x.scope==='county').length,102);
 assert(e.filter(x=>x.scope==='regional forecast zone').every(x=>x.county_fips===null&&x.point===null));
 assert.equal(makeRecord(read('sites')[0],e,read('rules')).core_record.events.length,102);
});
test('two dated modeled footprint archives retain expected polygons',()=>{
 const d=read('hail-footprints');
 assert.equal(d.features.length,64);
 assert.deepEqual(d.archives.map(a=>a.date),['2024-07-20','2024-07-21']);
 assert(d.features.every(f=>['Polygon','MultiPolygon'].includes(f.geometry.type)));
});
