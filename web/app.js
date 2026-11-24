const esc = v => String(v??'Unknown').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const routes=['home','acquire','protect','operate','learn','research'];
function route(){
 let id=location.hash.slice(1)||'home';
 if(!routes.includes(id))id='home';
 for(const r of routes)document.getElementById(r).hidden=r!==id;
 window.scrollTo(0,0);
}
window.addEventListener('hashchange',route);route();
const input=document.getElementById('query'), result=document.getElementById('result'), form=document.getElementById('lookup');
let selected=sites[0], searchVersion=0;
function showShared(record){
 for(const id of ['protect-record','operate-record']){
  document.getElementById(id).innerHTML='<article class="card"><small>SHARED PROPERTY RECORD · REPORTED DATA</small><h2>'+esc(record.property.name)+'</h2><p>'+esc(record.property.address)+'</p><p>Parcel '+esc(record.property.parcel_id)+' · '+record.core_record.events.length+' county reports in available archive</p><p>Protection, insurance and actual property impacts remain unknown.</p><a href="#acquire">Open sourced record →</a></article>';
 }
}
function renderRecord(site){
 selected=site;
 const record=makeRecord(site,archive.events,rules,wildfire);
 const events=record.core_record.events;
 const counts={};
 for(const e of events){const yr=e.year||2024;counts[yr]=(counts[yr]||0)+1;}
 const rows=events.map(e=>'<div class="record-row"><strong>'+esc(e.event_type)+' · '+esc(e.magnitude)+' '+esc(e.unit)+'</strong><br>'+esc(e.observed_at_local)+' · '+esc(e.location_reported)+'<br><small>NOAA EVENT '+esc(e.id)+' · '+esc(e.provenance.spatial_precision)+'</small> · <a href="'+esc(e.provenance.source_url)+'">Archive</a></div>').join('');
 const coverage=site.county_fips==='08069'?'Larimer County · 2020–2024 · hail and thunderstorm wind reports':'County history unavailable in current pilot';
 const provenance=site.location_provenance;
 const wildfireContext=site.jurisdiction===wildfire.place?'<h3>Wildfire · community context</h3><div class="grid two"><div><small>National burn-probability rank</small><h2>'+esc(wildfire.burn_probability_national_rank)+'</h2></div><div><small>National risk-to-homes rank</small><h2>'+esc(wildfire.risk_to_homes_national_rank)+'</h2></div></div><p>USFS modeled comparative community ranks. These percentages describe relative rank, and do not measure annual probability or the risk to this property. <a href="'+esc(wildfire.source_item)+'">USFS source and CC0 terms</a></p>':'';
 const model=site.footprint_screening?'<h3>Modeled hail footprint · July 20, 2024</h3><p>'+esc(site.footprint_screening.interpretation)+' <a href="'+esc(site.footprint_screening.source_url)+'">NOAA footprint data</a></p>':'<h3>Modeled hazard screening</h3><p>Hail footprint and wildfire screening have not been computed for this address.</p>';
 result.innerHTML='<article class="card"><small>GOVERNMENT ADDRESS RECORD · '+(site.parcel_id?'PARCEL MATCH':'PARCEL UNKNOWN')+'</small><h2>'+esc(site.name)+'</h2><p>'+esc(site.address)+' · <a href="'+esc(site.source_url)+'">Address source</a></p><div class="grid two"><div><strong>Parcel ID</strong><p>'+esc(site.parcel_id)+' · <a href="'+esc(provenance.parcel_source)+'">State parcel query</a></p><p>'+esc(provenance.parcel_status)+'</p></div><div><strong>Municipal jurisdiction</strong><p>'+esc(site.jurisdiction)+(provenance.city_limits_source?' · <a href="'+esc(provenance.city_limits_source)+'">Boundary check</a>':'')+'</p><p>'+esc(site.precision)+'</p></div></div><p class="muted">'+esc(provenance.attribution)+'</p><div class="notice">Weather reports are county context. Actual building exposure, damage, roof characteristics and wildfire screening remain unknown.</div><h3>'+events.length+' county weather reports</h3><p>'+coverage+'</p><div class="history-grid">'+Object.entries(counts).map(([year,n])=>'<div class="year"><small>'+year+'</small><strong>'+n+'</strong></div>').join('')+'</div><details><summary>View individual reports ('+events.length+')</summary>'+rows+'</details>'+model+wildfireContext+'<h3>Municipal rule context</h3>'+(record.core_record.requirements.length?record.core_record.requirements.map(r=>'<p>'+esc(r.text)+' <a href="'+esc(r.source_url)+'">Source</a><br><small>'+esc(r.applicability)+'</small></p>').join(''):'<p>Municipal applicability remains unknown.</p>')+'<h3>What to verify</h3><p>'+record.unknowns.map(esc).join(' · ')+'</p><button id="download-record">Download Property Record (JSON)</button></article>';
 document.getElementById('download-record').addEventListener('click',()=>{
  const url=URL.createObjectURL(new Blob([JSON.stringify(record,null,2)],{type:'application/json'}));
  const a=document.createElement('a');a.href=url;a.download=site.id+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 showShared(record);
}
const messages={invalid:'Enter a Fort Collins street address including a house number.',ambiguous:'Multiple exact government address points were returned. Add the unit or building designation and try again.',not_found:'No exact address found in the state source. Check spelling and street suffix.',no_point:'The government address matched but its coordinates are unavailable.',outside_city:'The address point is outside the Fort Collins municipal boundary.'};
async function renderLookup(){
 const version=++searchVersion;
 const value=input.value;
 const local=matchSite(value,sites);
 if(local){renderRecord(local);return;}
 result.innerHTML='<div class="notice">Checking official Colorado address, parcel and city boundary services…</div>';
 try{
  const response=await resolveAddress(value);
  if(version!==searchVersion)return;
  if(response.status==='found')renderRecord(response.site);
  else result.innerHTML='<div class="notice">'+esc(messages[response.status])+' Previous selected record remains available in Protect and Operate.</div>';
 }catch(error){
  if(version!==searchVersion)return;
  result.innerHTML='<div class="notice">Government GIS lookup is temporarily unavailable. Try again or use the stored City Hall example (300 Laporte Ave).</div>';
 }
}
form.addEventListener('submit',e=>{e.preventDefault();renderLookup()});
renderRecord(selected);
document.getElementById('research-data').innerHTML='<div class="grid two"><article class="card"><small>IMPORTED · HISTORICAL REPORTS</small><h3>NOAA Storm Events</h3><p>'+archive.events.length+' reports · '+esc(archive.coverage)+'</p><p>Imported '+esc(archive.ingested_at)+'</p>'+archive.archives.map(a=>'<p><a href="'+esc(a.source_url)+'">'+a.year+' source archive</a></p>').join('')+'</article><article class="card"><small>LIVE LOOKUP · SOURCE-LINKED</small><h3>Colorado GIS</h3><p>Exact address matching and point-to-parcel intersection, with a municipal boundary check. Coverage depends on source completeness and availability.</p><a href="https://gis.colorado.gov/public/rest/services/Address_and_Parcel">State GIS services</a></article><article class="card"><small>DOWNLOADED · VALIDATED GEOMETRY</small><h3>NOAA Event Footprint Catalog</h3><p>4,173 modeled hail polygons for July 20, 2024. City Hall point intersection checked.</p><a href="https://storage.googleapis.com/noaa-ncei-ipg/datasets/event-catalog/hail/mrms_hail_data_2024-07-20.geojson">Daily footprint</a></article><article class="card"><small>DOWNLOADED · FORMAT VALIDATED</small><h3>NOAA MRMS</h3><p>MESH GRIB2 sample. Grid values not decoded.</p><a href="https://mrms.ncep.noaa.gov/data/2D/MESH/">NCEP archive</a></article><article class="card"><small>RESEARCH · DATA RIGHTS REVIEWED</small><h3>USFS Wildfire Risk to Communities</h3><p>CC0 community-level modeled ranks retrieved and linked to confirmed Fort Collins records. Property-level raster screening remains pending.</p><a href="https://doi.org/10.2737/RDS-2020-0016-2">Research Data Archive</a></article></div>';
