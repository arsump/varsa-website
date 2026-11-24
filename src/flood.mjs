const BASE='https://services1.arcgis.com/dLpFH5mwVvxSN4OE/ArcGIS/rest/services/';
export const floodSources=[
 {name:'City-published FEMA floodplain',service:'FloodPlain_FEMA'},
 {name:'Fort Collins floodplain',service:'FloodPlain_City'}
];
export const cityFloodGuide='https://www.fortcollins.gov/Services/Utilities/Other-Utilities-Pages/Water/Stormwater/Flooding';
export const femaMap='https://msc.fema.gov/portal/home';
export async function screenFlood(site,fetcher=fetch){
 const coords=site.coordinates;
 if(site.jurisdiction!=='Fort Collins, Colorado'||!Number.isFinite(coords?.longitude)||!Number.isFinite(coords?.latitude))return [];
 return Promise.all(floodSources.map(async source=>{
  const params=new URLSearchParams({f:'json',geometry:coords.longitude+','+coords.latitude,geometryType:'esriGeometryPoint',inSR:'4326',spatialRel:'esriSpatialRelIntersects',returnCountOnly:'true'});
  const url=BASE+source.service+'/FeatureServer/0/query?'+params;
  const evidence={name:source.name,source_url:url,checked_at:new Date().toISOString(),scope:'Published address point',status:'unavailable'};
  try{
   const response=await fetcher(url,{signal:AbortSignal.timeout(9000)});
   if(!response.ok)return evidence;
   const body=await response.json();
   if(body.error||!Number.isInteger(body.count)||body.count<0)return evidence;
   return {...evidence,status:body.count?'intersection':'no_intersection',count:body.count};
  }catch{return evidence}
 }));
}
export const floodLabel=result=>({intersection:'Mapped floodplain intersects address point',no_intersection:'No mapped intersection at address point',unavailable:'Map service unavailable'})[result.status]||'Unknown';
