import {nearbyReports} from './deal-evidence.mjs';

export function assembleResilience(record, evidence) {
  const {property} = record;
  const pilotMatch = property.id === evidence.site_id && property.parcel_id === evidence.parcel_id;
  const cityMatch = property.jurisdiction === 'Fort Collins, Colorado';
  const findings = Object.fromEntries(evidence.findings.filter(finding => {
    if (finding.kind === 'jurisdiction_rule') return cityMatch;
    return pilotMatch;
  }).map(finding => [finding.id, {...finding, reviewed_on: evidence.reviewed_on}]));
  const closest = nearbyReports(record)[0];
  if (closest) {
    const {event, miles} = closest;
    findings['noaa-' + event.id] = {
      id: 'noaa-' + event.id,
      kind: 'event_report',
      scope: 'Approximate report point ' + miles.toFixed(1) + ' mi from address',
      date: event.observed_at_local,
      summary: event.event_type + ' reported near ' + event.location_reported + '.',
      limit: 'Distance is to the reported point. Building exposure, damage and downtime are unknown.',
      publisher: 'NOAA NCEI',
      source_url: event.provenance.source_url,
      reuse: 'Attributed NOAA Storm Events public data.',
      reviewed_on: evidence.reviewed_on
    };
  }

  return {
    schema_version: '1.0.0',
    findings,
    layers: {
      hazards: {finding_ids: closest ? ['noaa-' + closest.event.id] : [], unknown: 'Building-level event intensity and impact'},
      protection: {finding_ids: ['fc-cityhall-1978', 'fc-ma260017', 'fc-codes-2026'].filter(id => findings[id]), unknown: 'Installed roof assembly, protection features and certifications'},
      performance: {finding_ids: pilotMatch ? ['ibhs-hail-shingle-tests'] : [], unknown: 'Documented property damage, downtime and recovery'},
      economics: {finding_ids: pilotMatch ? ['ibhs-shingle-cost-context'] : [], unknown: 'Property-specific costs, losses, premiums and coverage terms'}
    },
    relationships: pilotMatch ? [
      {from: 'fc-cityhall-1978', to: 'fc-codes-2026', type: 'construction_predates_current_code'},
      {from: 'ibhs-hail-shingle-tests', to: 'ibhs-shingle-cost-context', type: 'same_study_material_cost_context'}
    ] : [],
    application_limits: pilotMatch ? [
      'Hail screening identifies a possible exposure mechanism. Applying the IBHS benchmark requires evidence of a comparable asphalt shingle and comparable impact conditions.',
      'The construction date and current permit rules establish a timeline. Installed protection requires completion or certification evidence.',
      'The market sample relates material cost to tested performance. Site economics require local installed prices and relevant loss or insurance evidence.'
    ] : []
  };
}
