import assert from 'node:assert/strict';
import {test} from 'node:test';
import {screenFlood} from '../src/flood.mjs';
import {verificationSteps} from '../src/due-diligence.mjs';
const site={jurisdiction:'Fort Collins, Colorado',coordinates:{latitude:40.58,longitude:-105.08}};
test('intersections and successful empty results remain distinct',async()=>{
 const checked=await screenFlood(site,async url=>({ok:true,json:async()=>({features:url.includes('FloodPlain_FEMA')?[{attributes:{OBJECTID:1}}]:[]})}));
 assert.deepEqual(checked.map(x=>x.status),['intersection','no_intersection']);
 assert.match(verificationSteps(checked)[0].detail,/intersects/);
});
test('failed service and absent jurisdiction are explicit',async()=>{
 assert.deepEqual((await screenFlood(site,async()=>({ok:false}))).map(x=>x.status),['unavailable','unavailable']);
 assert.deepEqual(await screenFlood({...site,jurisdiction:'Unknown'}),[]);
});
