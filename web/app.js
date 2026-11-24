import {assembleResilience} from '../src/core-record.mjs';
import {evidenceEntry,evidenceTypes,readHistory,writeHistory} from '../src/property-history.mjs';
import {nearbyReports,floodFinding} from '../src/deal-evidence.mjs';
import {screenFlood,floodLabel,cityFloodGuide} from '../src/flood.mjs';
import {makeDueDiligencePdf} from '../src/due-diligence.mjs';
import {matchSite,makeRecord} from '../src/record.mjs';
import {resolveAddress} from '../src/lookup.mjs';
const esc=v=>String(v??'Unknown').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const $=id=>document.getElementById(id);
const routes=['home','acquire','protect','operate','learn','research'];
const data=async n=>{const r=await fetch('data/'+n+'.json');if(!r.ok)throw Error(n);return r.json()};
const [sites,rules,wildfire,weather,nri,footprints,coreEvidence]=await Promise.all(['sites','rules','wildfire','multihazard','nri','hail-footprints','core-evidence'].map(data)).catch(error=>{
 $('home-map').textContent='Property explorer data is temporarily unavailable. Reload to retry.';
 $('home-map').setAttribute('role','status');
 throw error;
});
const colors={'Hail':'#729744','Flood':'#2784a1','Wind':'#bd813d','Heavy rain':'#588bb5'};
const types=[...new Set(weather.events.map(e=>e.family))].sort();
const portfolio=new Map();
let selected=sites[0],record,activeTab='overview',searchVersion=0,homeMap,explorerMap,pointLayer,footprintLayer,selectedLayer;
let flood=[],floodRequest=Promise.resolve();
const countyEvents=weather.events.filter(e=>e.scope==='county');
const zoneEvents=weather.events.filter(e=>e.scope==='regional forecast zone');
$('stat-events').textContent=weather.events.length;
function createMap(id,zoom=10){
 const map=L.map(id,{scrollWheelZoom:false}).setView([40.58,-105.08],zoom);
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
 return map;
}
function marker(e){
 return L.circleMarker(e.point,{radius:5,color:'#fff',weight:1,fillColor:colors[e.family]||'#797b62',fillOpacity:.86}).bindPopup('<strong>'+esc(e.event_type)+'</strong><br>'+esc(e.observed_at_local)+'<br>'+esc(e.location_reported)+'<br>Reported event location · accuracy unknown');
}
function selectedMarker(map,site){
 const c=site.coordinates;
 return c?L.circleMarker([c.latitude,c.longitude],{radius:9,color:'#173d35',weight:3,fillColor:'#d7e98f',fillOpacity:1}).bindPopup('<strong>'+esc(site.address)+'</strong><br>Selected address point').addTo(map):null;
}
function initHome(){
 if(homeMap)return;
 homeMap=createMap('home-map',10);
 countyEvents.filter(e=>e.point).forEach(e=>marker(e).addTo(homeMap));
 selectedMarker(homeMap,sites[0]);
}
function initExplorer(){
 if(explorerMap)return;
 explorerMap=createMap('explorer-map',10);
 pointLayer=L.layerGroup().addTo(explorerMap);
 footprintLayer=L.geoJSON(footprints,{style:{color:'#6c9e4c',fillColor:'#a6cc72',fillOpacity:.5,weight:1.5},onEachFeature:(f,l)=>l.bindPopup('Modeled hail · '+esc(f.properties.date)+' UTC<br>'+esc(f.properties.hail_size_range_in)+' inches')});
 updateMap(true);
}
function updateMap(recenter=false){
 if(!explorerMap)return;
 const family=$('map-hazard').value,year=$('map-year').value;
 const events=countyEvents.filter(e=>e.point&&(family==='all'||e.family===family)&&(year==='all'||e.year===Number(year)));
 pointLayer.clearLayers();events.forEach(e=>marker(e).addTo(pointLayer));
 if($('show-footprint').checked){footprintLayer.addTo(explorerMap)}else explorerMap.removeLayer(footprintLayer);
 if(selectedLayer)explorerMap.removeLayer(selectedLayer);
 selectedLayer=selectedMarker(explorerMap,selected);
 if(recenter&&selected.coordinates)explorerMap.setView([selected.coordinates.latitude,selected.coordinates.longitude],10);
 $('map-summary').innerHTML='<span>'+events.length+' mapped reported locations · Larimer County</span><span><i class="legend-dot hail"></i> Hail</span><span><i class="legend-dot flood"></i> Flood</span><span><i class="legend-dot wind"></i> Wind</span><span>Selected point ≠ exposure</span>';
}
function route(){
 const id=routes.includes(location.hash.slice(1))?location.hash.slice(1):'home';
 for(const r of routes)$(r).hidden=r!==id;
 document.querySelectorAll('.top nav a').forEach(a=>a.setAttribute('aria-current',a.hash==='#'+id?'page':'false'));
 if(id==='home'){initHome();requestAnimationFrame(()=>homeMap.invalidateSize())}
 if(id==='acquire'){initExplorer();requestAnimationFrame(()=>explorerMap.invalidateSize())}
 window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);
function ringContains(x,y,ring){let inside=false;for(let i=0,j=ring.length-1;i<ring.length;j=i++){const [xi,yi]=ring[i],[xj,yj]=ring[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside}return inside}
function screen(site){
 if(!site.coordinates)return null;
 const {longitude:x,latitude:y}=site.coordinates;
 const [west,south,east,north]=footprints.bbox;
 if(x<west||x>east||y<south||y>north)return null;
 const matched=footprints.features.filter(f=>{
  const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[];
  return polys.some(p=>ringContains(x,y,p[0])&&!p.slice(1).some(r=>ringContains(x,y,r)));
 });
 return {evidence_kind:'modeled hail point screening',dates:footprints.archives.map(a=>a.date),sources:footprints.archives,matched:matched.map(f=>f.properties),property_impact:'unknown',limitations:['Two UTC daily files only','Reported address point; not building or parcel geometry','Zero intersections does not establish no hail or no damage']};
}
function selectSite(site){
 selected=site;
 flood=[];
 const selection=site;
 floodRequest=screenFlood(site).then(results=>{
  if(selected!==selection||floodRequest!==request)return;
  flood=results;record.core_record.flood_map_checks=results;
  if(activeTab==='overview'||activeTab==='hazards')renderTab(activeTab);
  renderSuiteViews();renderPortfolio();
 });
 const request=floodRequest;
 const base=makeRecord(site,countyEvents,rules,wildfire);
 const regional=site.county_fips==='08069'||site.county_fips==='08123'?zoneEvents:[];
 const county=nri.counties[site.county_fips];
 const hail=screen(site);
 record={...base,schema_version:'0.2.0',core_record:{...base.core_record,regional_events:regional.map(e=>({...e,relationship:'regional forecast zone context; property impact unknown'})),hazard_exposure:[...base.core_record.hazard_exposure,...(county?[{...county,evidence_kind:nri.evidence_kind,source_url:nri.source_url,retrieved_at:nri.retrieved_at,limitations:nri.limitations}]:[]),...(hail?[hail]:[])]}};
 record.core_record.resilience=assembleResilience(record,coreEvidence);
 $('property-summary').innerHTML='<span class="pill">'+(site.parcel_id?'Parcel matched':'Address matched')+'</span><h2>'+esc(site.name)+'</h2><p>'+esc(site.address)+'</p><div class="field"><b>Parcel ID</b>'+esc(site.parcel_id)+'</div><div class="field"><b>Municipality</b>'+esc(site.jurisdiction)+'</div><div class="field"><b>Evidence</b>Government address and GIS</div>';
 renderSuiteViews();
 renderTab(activeTab);updateMap(true);renderPortfolio();
}
function sourceLink(url,label){return '<a href="'+esc(url)+'" target="_blank" rel="noopener">'+esc(label)+'</a>'}
function card(title,body){return '<article class="panel"><h2>'+title+'</h2>'+body+'</article>'}
function findingHtml(finding){
 return '<div class="field"><span class="pill">'+esc(finding.scope)+'</span><p><strong>'+esc(finding.summary)+'</strong></p><p>'+esc(finding.limit)+'</p><p>'+sourceLink(finding.source_url,finding.publisher)+'</p></div>';
}
function layerHtml(name){
 const intelligence=record.core_record.resilience;
 const layer=intelligence.layers[name];
 return layer.finding_ids.map(id=>findingHtml(intelligence.findings[id])).join('')+'<p class="scope"><strong>Unknown</strong> · '+esc(layer.unknown)+'</p>';
}
function renderSuiteViews(){
 const title='<span class="pill">Shared Core Record</span><h2>'+esc(selected.name)+'</h2><p>'+esc(selected.address)+' · Parcel '+esc(selected.parcel_id)+'</p>';
 const back='<a class="button secondary" href="#acquire">Open Core Record →</a>';
 $('protect-record').innerHTML=title+
  '<h3>Broker · Protection evidence</h3>'+layerHtml('protection')+
  '<h3>Lend · Collateral and financial evidence</h3>'+layerHtml('economics')+
  '<p>Installed protections, coverage terms and documented losses determine how far this evidence can support underwriting or collateral review.</p>'+back;
 $('operate-record').innerHTML=title+
  '<h3>Assets · Flood map screen</h3><p>'+esc(record.core_record.flood_map_checks?floodFinding(flood):'Checking published maps…')+' · Address point</p>'+
  '<h3>Change · Documented public milestones</h3>'+layerHtml('protection')+
  '<h3>Events · Nearest historical report</h3>'+layerHtml('hazards')+
  '<p><strong>Operational impact</strong> · Damage, interruption and recovery are unknown.</p>'+back;
}
function privateEntries(){
 try{return readHistory(window.localStorage,selected.id);}
 catch{return [];}
}
function rating(value){return '<span class="rating '+(String(value).includes('High')?'high':String(value).includes('Low')?'low':'')+'">'+esc(value)+'</span>'}
function floodCard(){
 const items=flood.map(item=>'<div class="field"><b>'+esc(item.name)+'</b>'+esc(floodLabel(item))+' · '+sourceLink(item.source_url,'GIS source')+'</div>').join('');
 return card('Flood map check',(items||'<p>Checking maps, or coverage unavailable for this location.</p>')+'<p>Published address point only. Review effective city and FEMA maps for the full parcel and building. '+sourceLink(cityFloodGuide,'Local floodplain guidance')+'</p>');
}
function renderTab(tab){
 activeTab=tab;
 document.querySelectorAll('[data-record-tab]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.recordTab===tab)));
 const site=selected,county=nri.counties[site.county_fips],hail=screen(site);
 const count=record.core_record.events.length,regional=record.core_record.regional_events.length;
 let html='';
 if(tab==='overview'){
  const local=nearbyReports(record);
  const closest=local[0];
  const floodStatus=record.core_record.flood_map_checks?floodFinding(flood):'Checking published maps…';
  const hailStatus=hail?hail.matched.length+' mapped intersections across two UTC dates':'Address-point screen unavailable';
  const history=closest?'<p>Closest report: <strong>'+esc(closest.event.event_type)+'</strong> · '+esc(closest.event.observed_at_local)+' · '+closest.miles.toFixed(1)+' mi · '+sourceLink(closest.event.provenance.source_url,'NOAA record '+closest.event.id)+'</p>':'<p>No mapped reports found within five miles in the available archive.</p>';
  html='<div class="grid two">'+Object.entries({hazards:'Hazards',protection:'Protection & standards',performance:'Performance',economics:'Economics'}).map(([name,title])=>card(title,layerHtml(name))).join('')+'</div>';
  const limits=record.core_record.resilience.application_limits;
  if(limits.length)html+=card('What the evidence supports','<ul>'+limits.map(limit=>'<li>'+esc(limit)+'</li>').join('')+'</ul>');
  html+=card('Sites · Acquisition context','<dl class="deal-findings"><div><dt>Parcel</dt><dd>'+esc(site.parcel_id||'No parcel match')+'</dd></div><div><dt>Flood maps</dt><dd>'+esc(floodStatus)+'</dd></div><div><dt>Modeled hail</dt><dd>'+esc(hailStatus)+'</dd></div><div><dt>Weather history</dt><dd>'+local.length+' reported locations within 5 mi</dd></div></dl>'+history+'<p class="scope">NOAA county event points, 2020–2024. Distance is measured to the reported event point, which may be approximate. The two-date hail screen and flood checks use the address point. They do not establish building exposure or damage.</p>');
  html+=floodCard();
  html+=card('Hazard intelligence' ,'<p>Explore all 18 FEMA hazard types and the observed weather archive.</p><button class="secondary" data-go-tab="hazards">Open hazard overview →</button> <button class="secondary" data-go-tab="events">Explore events →</button>');
 }
 if(tab==='hazards'){
  html=card('All-hazard index',county?'<p>'+esc(county.county)+' County · FEMA National Risk Index · '+esc(county.version)+'</p><div class="table-scroll"><table class="data-table"><thead><tr><th>Hazard</th><th>County relative rating</th><th>Property-level evidence</th></tr></thead><tbody>'+county.hazards.map(h=>'<tr><td>'+esc(h.family)+'</td><td>'+rating(h.rating)+'</td><td>'+ (h.family==='Hail'&&hail?'Two-date modeled point screen':'Unknown')+'</td></tr>').join('')+'</tbody></table></div><p class="scope">County planning ratings. '+esc(nri.attribution)+' '+sourceLink(nri.source_url,'Source')+'</p>':'<p>County index coverage unavailable for this property.</p>');
  html+=floodCard();
  if(hail)html+=card('Modeled hail footprint','<p>'+hail.matched.length+' polygon intersections at the published address point across '+hail.dates.join(' and ')+' UTC. Zero intersections cannot establish absence of hail or damage.</p>'+hail.sources.map(a=>'<p>'+sourceLink(a.source_url,a.date+' NOAA footprint')+'</p>').join(''));
  if(site.jurisdiction===wildfire.place)html+=card('Wildfire · community context','<div class="grid two"><div class="metric-card"><small>National burn-probability rank</small><strong>'+esc(wildfire.burn_probability_national_rank)+'</strong></div><div class="metric-card"><small>National risk-to-homes rank</small><strong>'+esc(wildfire.risk_to_homes_national_rank)+'</strong></div></div><p>USFS relative community ranks, not annual fire probability or property-specific risk. '+sourceLink(wildfire.source_item,'USFS source and terms')+'</p>');
  html+=card('Coverage beyond the index','<p>Sea-level rise, erosion, subsidence, snow load and other specialized hazards require geographic and engineering datasets. Values are unknown in this preview.</p>');
 }
 if(tab==='events'){
  html=card('Historical event explorer','<div class="filter-row"><label>Hazard <select id="event-family"><option value="all">All hazards</option>'+types.map(t=>'<option>'+esc(t)+'</option>').join('')+'</select></label><label>Year <select id="event-year"><option value="all">All years</option>'+[2020,2021,2022,2023,2024].map(y=>'<option>'+y+'</option>').join('')+'</select></label><label>Geographic scope <select id="event-scope"><option value="all">County + regional zones</option><option value="county">County only</option><option value="regional forecast zone">Regional zones only</option></select></label></div><p class="scope">Area reports are not evidence that the selected property experienced an event.</p><div id="event-count"></div><div id="event-list" class="event-list"></div>');
 }
 if(tab==='building'){
  html=card('Build · Code and protection evidence',layerHtml('protection'));
  html+=card('Building characteristics','<div class="grid two">'+['Building footprint','Construction type','Roof material','Roof age','Protection features','Completed permitted work'].map(t=>'<div class="metric-card"><small>'+t+'</small><strong style="font-size:20px">Unknown</strong></div>').join('')+'</div><p>City footprint and current permit sources are identified; reuse terms and building-level matching are under review.</p>');
  html+=card('Municipal requirements',record.core_record.requirements.length?record.core_record.requirements.map(r=>'<h3>'+esc(r.text)+'</h3><p>'+esc(r.applicability)+' · '+sourceLink(r.source_url,'Official source')+'</p>').join(''):'<p>Municipal jurisdiction or applicable requirements are unknown.</p>');
 }
 if(tab==='history'){
  const items=privateEntries();
  const timeline=items.map(item=>'<article class="field"><span class="pill">'+esc(item.type)+'</span> <time>'+esc(item.date)+'</time><h3>'+esc(item.summary)+'</h3><p>Source reference: '+esc(item.source)+'</p><p>'+ (item.reviewed_at?'Marked source reviewed by user on '+esc(item.reviewed_at.slice(0,10)):'Reported by user · source review pending')+'</p><button class="secondary" data-review-entry="'+esc(item.id)+'">'+(item.reviewed_at?'Reset review status':'Mark source reviewed')+'</button></article>').join('');
  html=card('Private Record · optional','<p>Existing notes and review flags live only in this browser. Core Records, portfolio comparisons and exports use independently sourced evidence. Avoid confidential information on this preview.</p>'+(timeline||'<p>No entries yet.</p>'));
  html+='<details class="panel"><summary>Add an optional local note</summary><form id="add-evidence" class="history-form"><label>Evidence type<select name="type">'+evidenceTypes.map(type=>'<option>'+type+'</option>').join('')+'</select></label><label>Date of work, inspection or outcome<input type="date" name="date" required></label><label>Finding or change<textarea name="summary" required maxlength="300" placeholder="What did the source establish?"></textarea></label><label>Source reference<input name="source" required maxlength="120" placeholder="Document title, date or reference ID"></label><button>Save entry</button><p id="history-status" role="status"></p></form></details>';
 }
 if(tab==='evidence'){
  html=card('Source register','<p>'+sourceLink(site.source_url,'State or city address source')+'</p><p>'+sourceLink(site.location_provenance.parcel_source,'State parcel source')+'</p><p>'+esc(site.location_provenance.attribution)+'</p>'+weather.archives.map(a=>'<p>'+sourceLink(a.source_url,'NOAA Storm Events '+a.year)+'</p>').join('')+'<p>'+sourceLink(nri.source_item,'FEMA National Risk Index data and terms')+'</p><p>'+esc(nri.attribution)+'</p><p>'+sourceLink(wildfire.source_item,'USFS community wildfire data')+'</p>');
  html+=card('Known gaps','<p>'+record.unknowns.map(esc).join(' · ')+'</p><p>Coordinates and parcel geometry are screening information; survey accuracy unknown.</p>');
 }
 $('record-content').innerHTML=html;
 document.querySelectorAll('[data-go-tab]').forEach(b=>b.addEventListener('click',()=>renderTab(b.dataset.goTab)));
 if(tab==='history'){
  $('add-evidence').addEventListener('submit',event=>{
   event.preventDefault();
   try{savePropertyHistory([...privateEntries(),evidenceEntry(Object.fromEntries(new FormData(event.currentTarget)))]);}
   catch(error){$('history-status').textContent=error.message;}
  });
  document.querySelectorAll('[data-review-entry]').forEach(button=>button.addEventListener('click',()=>{
   try{savePropertyHistory(privateEntries().map(item=>item.id===button.dataset.reviewEntry?{...item,reviewed_at:item.reviewed_at?null:new Date().toISOString()}:item));}
   catch(error){$('history-status').textContent=error.message;}
  }));
 }
 if(tab==='events'){for(const id of ['event-family','event-year','event-scope'])$(id).addEventListener('change',renderEvents);renderEvents()}
}
function savePropertyHistory(items){
 try{writeHistory(window.localStorage,selected.id,items);}
 catch{throw new Error('History could not be saved in this browser.');}
 renderTab('history');
 $('history-status').textContent='History saved.';
}
function renderEvents(){
 const family=$('event-family').value,year=$('event-year').value,scope=$('event-scope').value;
 const list=[...record.core_record.events,...record.core_record.regional_events].filter(e=>(family==='all'||e.family===family)&&(year==='all'||e.year===Number(year))&&(scope==='all'||e.scope===scope)).sort((a,b)=>b.year-a.year||Number(b.id)-Number(a.id));
 $('event-count').textContent=list.length+' matching reports';
 $('event-list').innerHTML=list.map(e=>'<div class="event"><div class="event-date">'+esc(e.observed_at_local)+'</div><div><strong>'+esc(e.event_type)+'</strong><p>'+esc(e.location_reported)+' · '+esc(e.scope)+'</p></div><span class="badge">'+esc(e.magnitude==null?'':e.magnitude+' '+e.unit)+'</span>'+sourceLink(e.provenance.source_url,'Source')+'</div>').join('')||'<p>No matching reports in this filtered archive.</p>';
}
function renderPortfolio(){
 $('portfolio-count').textContent=portfolio.size+' properties';
 $('portfolio').innerHTML=portfolio.size?'<table class="data-table"><thead><tr><th>Property</th><th>Parcel</th><th>Municipality</th><th>Reports within 5 mi</th><th>Flood map check</th><th></th></tr></thead><tbody>'+[...portfolio.values()].map(r=>'<tr><td><strong>'+esc(r.property.address)+'</strong></td><td>'+esc(r.property.parcel_id)+'</td><td>'+esc(r.property.jurisdiction)+'</td><td>'+nearbyReports(r).length+'</td><td>'+esc(r.core_record.flood_map_checks?floodFinding(r.core_record.flood_map_checks):'Checking maps…')+'</td><td><button class="secondary" data-remove="'+esc(r.property.id)+'">Remove</button></td></tr>').join('')+'</tbody></table>':'<p>No properties added yet. Search a property in Explore, then select Add to portfolio.</p>';
 document.querySelectorAll('[data-remove]').forEach(b=>b.addEventListener('click',()=>{portfolio.delete(b.dataset.remove);renderPortfolio()}));
 $('save-property').textContent=portfolio.has(selected.id)?'✓ In portfolio':'＋ Add to portfolio';
}
const messages={invalid:'Enter a Fort Collins street address including a house number.',ambiguous:'Multiple exact address matches. Add unit or building details.',not_found:'No exact address found. Check spelling and street suffix.',no_point:'Address matched, but coordinates are unavailable.',outside_city:'Address is outside the Fort Collins municipal boundary.'};
async function lookup(value){
 const version=++searchVersion;$('query').value=value;
 $('lookup-status').innerHTML='<div class="notice">Checking official address, parcel and boundary services…</div>';
 try{
  const local=matchSite(value,sites);const response=local?{status:'found',site:local}:await resolveAddress(value);
  if(version!==searchVersion)return;
  if(response.status==='found'){$('lookup-status').innerHTML='';selectSite(response.site)}else $('lookup-status').innerHTML='<div class="notice">'+esc(messages[response.status])+' The previous record is retained.</div>';
 }catch(e){if(version===searchVersion)$('lookup-status').innerHTML='<div class="notice">Government GIS temporarily unavailable. Try again or choose City Hall.</div>'}
}
$('lookup').addEventListener('submit',e=>{e.preventDefault();lookup($('query').value)});
$('home-search').addEventListener('submit',e=>{e.preventDefault();location.hash='acquire';lookup($('home-query').value)});
document.querySelectorAll('[data-address]').forEach(b=>b.addEventListener('click',()=>{location.hash='acquire';lookup(b.dataset.address)}));
document.querySelectorAll('[data-record-tab]').forEach(b=>b.addEventListener('click',()=>renderTab(b.dataset.recordTab)));
for(const id of ['map-hazard','map-year','show-footprint'])$(id).addEventListener('change',()=>updateMap());
$('save-property').addEventListener('click',()=>{portfolio.set(selected.id,record);renderPortfolio()});
$('download-record').addEventListener('click',()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(record,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=selected.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)});
$('print-record').addEventListener('click',async()=>{
 const button=$('print-record'),current=record,pending=floodRequest;
 button.disabled=true;button.textContent='Preparing PDF…';
 try{
  await pending;
  if(record!==current){$('lookup-status').textContent='Property changed. Select Download PDF again for this address.';return}
  const bytes=await makeDueDiligencePdf(current,flood,window.PDFLib);
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  const a=document.createElement('a');a.href=url;a.download='varsa-'+current.property.id+'-due-diligence.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 }catch{$('lookup-status').textContent='The PDF could not be generated. Try again.'}
 finally{button.disabled=false;button.textContent='Download PDF'}
});
$('research-data').innerHTML=[['NOAA Storm Events',weather.events.length+' county and regional weather reports, 2020–2024.',weather.archives[0].source_url],['FEMA National Risk Index','18 hazard ratings across Larimer and Weld County. December 2025.',nri.source_item],['NOAA Event Footprint Catalog','Two UTC days of radar-derived hail polygons.',footprints.archives[0].source_url],['USFS Wildfire Risk to Communities','CC0 modeled community ranks, 2024 data.',wildfire.source_item],['Colorado address and parcels','Live state address and parcel queries with municipal boundary checks.','https://gis.colorado.gov/public/rest/services/Address_and_Parcel'],['Building evidence','City building and permit datasets identified; rights and applicability pending.','https://www.arcgis.com/home/item.html?id=7e577a14c83f4d83a6b58657c48027da']].map(([t,p,u])=>'<article class="panel"><span class="pill">Source linked</span><h3>'+esc(t)+'</h3><p>'+esc(p)+'</p>'+sourceLink(u,'Explore source ↗')+'</article>').join('');
selectSite(sites[0]);route();
