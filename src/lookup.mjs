const STATE = 'https://gis.colorado.gov/public/rest/services/Address_and_Parcel';
const ADDRESSES = STATE + '/Colorado_Public_Addresses/MapServer/0/query';
const PARCELS = STATE + '/Colorado_Public_Parcels/MapServer/0/query';
const LIMITS = 'https://services1.arcgis.com/dLpFH5mwVvxSN4OE/arcgis/rest/services/City_Limits/FeatureServer/0/query';
const SUFFIXES = {AVENUE:'AVE',STREET:'ST',ROAD:'RD',DRIVE:'DR',BOULEVARD:'BLVD',COURT:'CT',LANE:'LN',PLACE:'PL',WAY:'WAY',CIRCLE:'CIR',PARKWAY:'PKWY',TERRACE:'TER'};
const DIRECTIONS = {NORTH:'N',SOUTH:'S',EAST:'E',WEST:'W'};

export function normalizeAddress(value) {
  const text = value.trim().toUpperCase().replace(/[.,]/g,' ').replace(/\s+/g,' ').replace(/\s+FORT COLLINS(?:\s+CO(?:LORADO)?)?(?:\s+\d{5})?$/,'').trim();
  if (!/^\d+[A-Z]?\s+[A-Z0-9][A-Z0-9 -]{1,100}$/.test(text)) return null;
  return text.split(' ').map(token=>SUFFIXES[token]||DIRECTIONS[token]||token).join(' ');
}
function queryUrl(base, params) {
  return base+'?'+new URLSearchParams({...params,f:'json'});
}
async function getJson(url, fetcher) {
  const response = await fetcher(url,{signal:AbortSignal.timeout(18000),cache:'no-store'});
  if (!response.ok) throw new Error('Government GIS returned HTTP '+response.status);
  const data = await response.json();
  if (data.error) throw new Error('Government GIS service error '+data.error.code);
  return data;
}
export async function resolveAddress(value, fetcher=fetch) {
  const address=normalizeAddress(value);
  if (!address) return {status:'invalid'};
  const addressUrl=queryUrl(ADDRESSES,{where:"AddrFull = '"+address+"' AND PlaceName = 'FORT COLLINS'",outFields:'OBJECTID,AddrFull,PlaceName,Zipcode,County,MOD_DATE',returnGeometry:'true',outSR:4326,resultRecordCount:20});
  const data=await getJson(addressUrl,fetcher);
  const matches=(data.features||[]).filter(f=>f.attributes.AddrFull===address&&f.attributes.PlaceName==='FORT COLLINS');
  if (data.exceededTransferLimit||matches.length>1) return {status:'ambiguous'};
  if (!matches.length) return {status:'not_found'};
  const {attributes:a,geometry:g}=matches[0];
  if (!g||!Number.isFinite(g.x)||!Number.isFinite(g.y)) return {status:'no_point'};
  const geometry={geometry:JSON.stringify({x:g.x,y:g.y}),geometryType:'esriGeometryPoint',inSR:4326,spatialRel:'esriSpatialRelIntersects'};
  const limitsUrl=queryUrl(LIMITS,{...geometry,returnCountOnly:'true'});
  const parcelUrl=queryUrl(PARCELS,{...geometry,outFields:'OBJECTID,countyName,countyFips,parcel_id,situsAdd,sitAddCty,dateReceived',returnGeometry:'false',resultRecordCount:10});
  const [limitResult,parcelResult]=await Promise.allSettled([getJson(limitsUrl,fetcher),getJson(parcelUrl,fetcher)]);
  if (limitResult.status==='fulfilled'&&limitResult.value.count===0) return {status:'outside_city'};
  const jurisdiction=limitResult.status==='fulfilled'&&limitResult.value.count>0?'Fort Collins, Colorado':'Unknown municipal jurisdiction';
  const parcels=parcelResult.status==='fulfilled'?(parcelResult.value.features||[]):[];
  const match=parcels.length===1&&!parcelResult.value?.exceededTransferLimit?parcels[0].attributes:null;
  const today=new Date().toISOString().slice(0,10);
  const parcelStatus=parcelResult.status==='rejected'?'Parcel service unavailable':match?'One parcel returned by spatial intersection; situs address may differ':parcels.length>1?'Multiple intersecting parcels; identifier unknown':'No intersecting parcel returned';
  return {status:'found',site:{id:'CO-ADDRESS-'+a.OBJECTID,name:a.AddrFull,address:a.AddrFull+', Fort Collins, CO '+(a.Zipcode||''),aliases:[a.AddrFull],county_fips:a.County==='Larimer'?'08069':a.County==='Weld'?'08123':null,jurisdiction,source_url:addressUrl,checked_at:today,coordinates:{longitude:g.x,latitude:g.y},parcel_id:match?.parcel_id||null,building_features:null,evidence_kind:'reported',precision:'State address point; survey accuracy unknown',location_provenance:{state_address_id:a.OBJECTID,state_address_source:addressUrl,city_limits_source:limitsUrl,municipal_status:jurisdiction,parcel_source:parcelUrl,parcel_status:parcelStatus,parcel_situs:match?.situsAdd||null,retrieved_at:new Date().toISOString(),attribution:'State of Colorado Public addresses and parcels were accessed on '+today+' from https://gis.colorado.gov/public/rest/services/Address_and_Parcel'},footprint_screening:null}};
}
