export function matchSite(query, sites) {
  const q = query.toLowerCase().trim().replace(/[.,]/g, '').replace(/\s+/g,' ');
  return sites.find(s => [s.address,s.name,...s.aliases].some(a => a.toLowerCase().replace(/[.,]/g,'') === q)) || null;
}
export function makeRecord(site, events, rules, wildfire=null) {
  return {schema_version:'0.1.0',record_type:'property_intelligence_record',property:site,core_record:{events:events.filter(e=>e.county_fips===site.county_fips).map(e=>({...e,relationship:'same county; property impact unknown'})),requirements:rules.filter(r=>site.jurisdiction.startsWith(r.jurisdiction)),hazard_exposure:[...(site.footprint_screening?[site.footprint_screening]:[]),...(wildfire&&wildfire.place===site.jurisdiction?[wildfire]:[])],protection_features:[],performance_observations:[],financial_observations:[]},unknowns:[...(site.parcel_id?[]:['parcel identifier']),...(site.jurisdiction.startsWith('Fort Collins')?[]:['municipal jurisdiction']),'building characteristics','wildfire exposure','property damage','insurance and costs']};
}
