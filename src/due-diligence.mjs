import {nearbyReports} from './deal-evidence.mjs';
import {floodLabel,cityFloodGuide,femaMap} from './flood.mjs';
export function verificationSteps(flood){
 return [
  {label:'Confirm flood mapping for the full site',detail:flood.some(x=>x.status==='intersection')?'A mapped floodplain intersects the address point. Ask local floodplain staff to review the full parcel and building footprint, plus the effective map and any amendments.':'Check the full parcel and building footprint against city and effective FEMA maps. An address point can miss portions of the site.',url:cityFloodGuide},
  {label:'Request building and roof records',detail:'Ask for current inspection findings, roof age and materials, open permits, and documentation for protective upgrades. These items are unverified in this record.'},
  {label:'Verify prior damage and recovery',detail:'Request seller disclosures, repair invoices and claims history where available. Area weather reports do not establish damage to the building.'},
  {label:'Confirm insurance and financing terms',detail:'Ask the broker and lender for property-specific quotes, deductibles, exclusions and requirements before relying on these costs.'}
 ];
}
const clean=v=>String(v??'Unknown').replace(/[\u2010-\u2015]/g,'-').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[^\x20-\x7e]/g,' ');
export async function makeDueDiligencePdf(record,flood,PDFLib){
 const {PDFDocument,StandardFonts,rgb,PDFString}=PDFLib;
 const doc=await PDFDocument.create();
 doc.setTitle('varsa. Property due diligence | '+clean(record.property.address));
 doc.setAuthor('varsa.');
 const normal=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 const forest=rgb(.09,.24,.21),gray=rgb(.27,.34,.31),lime=rgb(.84,.91,.56);
 let page,y;
 function text(value,{x=44,size=11,font=normal,color=gray,max=524}={}){
  const words=clean(value).split(/\s+/);let line='';
  for(const word of words){
   const next=line?line+' '+word:word;
   if(line&&font.widthOfTextAtSize(next,size)>max){page.drawText(line,{x,y,size,font,color});y-=size+5;line=word}else line=next;
  }
  if(line)page.drawText(line,{x,y,size,font,color});
  y-=size+5;
 }
 function link(label,url){
  if(!url?.startsWith('https://'))return;
  const pos=y;
  text(label,{size:9,font:bold,color:forest});
  const ref=doc.context.register(doc.context.obj({Type:'Annot',Subtype:'Link',Rect:[44,pos-3,44+bold.widthOfTextAtSize(clean(label),9),pos+10],Border:[0,0,0],A:{S:'URI',URI:PDFString.of(url)}}));
  page.node.addAnnot(ref);
 }
 function start(title,index){
  page=doc.addPage([612,792]);
  page.drawRectangle({x:0,y:710,width:612,height:82,color:forest});
  y=757;text('varsa.',{size:22,font:bold,color:lime});text(title,{size:14,font:bold,color:rgb(1,1,1)});
  y=50;text('Development preview  /  '+index+' of 2',{size:9});
  y=680;
 }
 function heading(title){y-=10;text(title,{size:15,font:bold,color:forest})}
 const site=record.property;
 start('Property due diligence',1);
 text(site.address,{size:21,font:bold,color:forest});text('Parcel '+(site.parcel_id||'unknown')+'  |  '+site.jurisdiction);
 text('Prepared '+new Date().toISOString().slice(0,10)+'  |  Address source checked '+(site.checked_at||'unknown'),{size:9});
 heading('Flood map check');
 for(const item of flood){
  text(item.name,{font:bold});
  text(floodLabel(item)+' | Checked '+item.checked_at.slice(0,10),{size:10});
 }
 if(!flood.length)text('Flood map check unavailable for this address.');
 text('Screening uses the published address point. Boundaries, buildings, map amendments and flood depths require separate verification.',{size:10});
 heading('Weather and hazard context');
 const county=record.core_record.hazard_exposure.find(e=>Array.isArray(e.hazards));
 text(record.core_record.events.length+' county NOAA reports (2020-2024). '+(county?county.hazards.length+' FEMA county-level hazard ratings ('+county.version+').':'County hazard ratings unavailable.'),{size:10});
 const modeled=record.core_record.hazard_exposure.find(e=>Array.isArray(e.matched));
 if(modeled)text('Modeled hail: '+modeled.matched.length+' address-point intersections on '+modeled.dates.join(' / ')+' UTC. Two dates only.',{size:10});
 const nearby=nearbyReports(record);
 text(nearby.length+' mapped NOAA reports within 5 miles. Reported points are approximate and do not establish building impact.',{size:10});
 if(nearby.length)text('Closest report: '+nearby[0].event.event_type+' | '+nearby[0].event.observed_at_local+' | '+nearby[0].miles.toFixed(1)+' mi',{size:10});
 text('Area-level data does not establish exposure, damage or insurance terms for this property.',{size:10});
 heading('Deal follow-up');
 for(const [i,step] of verificationSteps(flood).entries()){text((i+1)+'. '+step.label,{font:bold,size:11});text(step.detail,{size:10});y-=3}
 start('Evidence and sources',2);
 heading('Location and flood mapping');
 text(site.address,{font:bold});text(site.precision,{size:10});
 link('Address source',site.source_url);link('Parcel source',site.location_provenance?.parcel_source);
 text(site.location_provenance?.attribution||'State of Colorado public address and parcel data.',{size:9});
 for(const item of flood)link(item.name+' - query for this address point',item.source_url);
 link('Fort Collins floodplain guidance',cityFloodGuide);link('FEMA Map Service Center - effective maps',femaMap);
 heading('Weather and community evidence');
 const sources=[...new Set(record.core_record.events.map(e=>e.provenance.source_url))];
 for(const [i,url] of sources.entries())link('NOAA Storm Events archive '+(url.match(/_d(\d{4})_/)?.[1]||i+1),url);
 const hail=record.core_record.hazard_exposure.find(e=>Array.isArray(e.sources));
 for(const item of hail?.sources||[])link('NOAA modeled hail footprint - '+item.date,item.source_url);
 const wildfire=record.core_record.hazard_exposure.find(e=>e.source_item&&e.risk_to_homes_national_rank);
 if(wildfire)link('USFS community wildfire context',wildfire.source_item);
 if(county){
  link('FEMA National Risk Index - '+county.version,county.source_url);
  text("This product uses the Federal Emergency Management Agency's National Risk Index dataset API or downloadable datasets but is not endorsed by FEMA. The Federal Government or FEMA cannot vouch for the data or analyses derived from these data after the data have been retrieved from the Agency's website(s).",{size:9});
 }
 heading('Municipal rules');
 for(const rule of record.core_record.requirements){text(rule.text,{size:9});link('Official municipal source',rule.source_url)}
 if(!record.core_record.requirements.length)text('Applicable municipal requirements are unknown.');
 return doc.save();
}
