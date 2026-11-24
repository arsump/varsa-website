const esc = v => String(v??'Unknown').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const routes=['home','acquire','protect','operate','learn','research'];
function route(){let id=location.hash.slice(1)||'home'; if(!routes.includes(id))id='home';for(const r of routes)document.getElementById(r).hidden=r!==id;window.scrollTo(0,0);}
window.addEventListener('hashchange',route);route();
function renderLookup(){
 const site=matchSite(document.getElementById('query').value,sites);
 const el=document.getElementById('result');
 if(!site){el.innerHTML='<div class="notice">Address not covered by this pilot. Try 300 Laporte Ave, Fort Collins.</div>';return;}
 const record=makeRecord(site,archive.events,rules);
 const rows=record.core_record.events.map(e=>'<div class="record-row"><strong>'+esc(e.event_type)+' · '+esc(e.magnitude)+' '+esc(e.unit)+'</strong><br>'+esc(e.observed_at_local)+' · '+esc(e.location_reported)+'<br><small>NOAA EVENT '+esc(e.id)+' · '+esc(e.provenance.spatial_precision)+'</small> · <a href="'+esc(e.provenance.source_url)+'">Archive</a></div>').join('');
 el.innerHTML='<article class="card"><small>PUBLISHED ADDRESS · PARCEL UNKNOWN</small><h2>'+esc(site.name)+'</h2><p>'+esc(site.address)+' · <a href="'+esc(site.source_url)+'">City source</a></p><div class="notice">County weather history only. Actual building exposure, damage, roof characteristics and wildfire screening are unknown.</div><h3>'+record.core_record.events.length+' county weather reports in 2024</h3>'+rows+'<h3>Municipal rule context</h3>'+record.core_record.requirements.map(r=>'<p>'+esc(r.text)+' <a href="'+esc(r.source_url)+'">Source</a><br><small>'+esc(r.applicability)+'</small></p>').join('')+'<h3>What to verify</h3><p>'+record.unknowns.map(esc).join(' · ')+'</p></article>';
}
document.getElementById('lookup').addEventListener('submit',e=>{e.preventDefault();renderLookup();});renderLookup();
document.getElementById('research-data').innerHTML='<div class="grid two"><article class="card"><small>IMPORTED · INTERNAL</small><h3>NOAA Storm Events</h3><p>'+archive.events.length+' reports · '+esc(archive.coverage)+'</p><p>Imported '+esc(archive.ingested_at)+'</p><a href="'+esc(archive.archive_url)+'">Pinned source archive</a></article><article class="card"><small>RESEARCH · PENDING LICENSE</small><h3>Colorado wildfire</h3><p>Screening layers identified. No property values imported yet.</p><a href="https://tra-co-pub.coloradoforestatlas.org/">Forest Atlas viewer</a></article></div>';
