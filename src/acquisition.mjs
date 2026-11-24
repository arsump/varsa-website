export function matchBryanAddress(query) {
  const normalized = query.toLowerCase().replace(/[.,]/g, '').trim().replace(/\s+/g, ' ');
  if (normalized === 'village on bryan') return 'Village on Bryan';
  const address = /^(100|106|114) (?:s|south) bryan (?:ave|avenue)(?: fort collins(?: co(?:lorado)?(?: 80521)?)?)?$/.exec(normalized);
  return address ? address[1] + ' S Bryan Ave' : null;
}

export function acquisitionDecision(record) {
  const checks = record.core_record.flood_map_checks ?? [];
  if (checks.some(check => check.status === 'intersection')) {
    return {
      headline: 'Resolve flood exposure before pricing the deal',
      reason: 'A published flood layer intersects the address point. Building and parcel exposure still need confirmation.'
    };
  }
  return {
    headline: 'Keep roof replacement in the capital review',
    reason: 'The available record does not establish the installed roof age, completed replacement, or present condition. A documented storm nearby cannot establish damage to this building.'
  };
}
