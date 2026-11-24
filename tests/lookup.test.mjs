import {test} from 'node:test';
import assert from 'node:assert/strict';
import {normalizeAddress,resolveAddress} from '../src/lookup.mjs';
test('normalize address and reject unsupported forms',()=>{
  assert.equal(normalizeAddress('215 North Mason Street, Fort Collins, CO 80521'),'215 N MASON ST');
  assert.equal(normalizeAddress('somewhere'),null);
});
function mock({boundary=1,parcels=[{attributes:{parcel_id:'123',situsAdd:'215 N MASON ST'}}],duplicates=false}={}){
  return async url=>({ok:true,json:async()=>url.includes('Public_Addresses')?{features:Array.from({length:duplicates?2:1},()=>({attributes:{OBJECTID:1,AddrFull:'215 N MASON ST',PlaceName:'FORT COLLINS',County:'Larimer',Zipcode:'80521'},geometry:{x:-105.07,y:40.59}}))}:url.includes('City_Limits')?{count:boundary}:{features:parcels}});
}
test('unique match joins city and parcel',async()=>{const result=await resolveAddress('215 N Mason St',mock());assert.equal(result.site.parcel_id,'123');assert.equal(result.site.jurisdiction,'Fort Collins, Colorado');assert.equal(result.site.footprint_screening,null)});
test('ambiguous addresses and outside jurisdiction handled',async()=>{assert.equal((await resolveAddress('215 N Mason St',mock({duplicates:true}))).status,'ambiguous');assert.equal((await resolveAddress('215 N Mason St',mock({boundary:0}))).status,'outside_city')});
test('multiple parcels retain unknown',async()=>{const r=await resolveAddress('215 N Mason St',mock({parcels:[{attributes:{parcel_id:'a'}},{attributes:{parcel_id:'b'}}]}));assert.equal(r.site.parcel_id,null)});
