const radians=value=>value*Math.PI/180;
const radiusMiles=3958.76;
export function nearbyReports(record){
 const {latitude,longitude}=record.property.coordinates||{};
 if(!Number.isFinite(latitude)||!Number.isFinite(longitude))return [];
 return record.core_record.events.flatMap(event=>{
  const [lat,lon]=event.point||[];
  if(!Number.isFinite(lat)||!Number.isFinite(lon))return [];
  const a=Math.sin(radians(lat-latitude)/2)**2+Math.cos(radians(latitude))*Math.cos(radians(lat))*Math.sin(radians(lon-longitude)/2)**2;
  const miles=2*radiusMiles*Math.asin(Math.sqrt(Math.min(1,a)));
  return miles<=5?[{event,miles}]:[];
 }).sort((a,b)=>a.miles-b.miles);
}

export function floodFinding(checks){
 const usable=checks.filter(check=>['intersection','no_intersection'].includes(check.status));
 if(usable.some(check=>check.status==='intersection'))return 'Mapped overlap at address point';
 if(usable.length===2)return 'No overlap at address point in either layer';
 if(usable.length===1)return 'No overlap in one layer; other layer unavailable';
 return 'Flood check unavailable';
}
