export function matchBryanAddress(query) {
  const normalized = query.toLowerCase().replace(/[.,]/g, '').trim().replace(/\s+/g, ' ');
  if (normalized === 'village on bryan') return 'Village on Bryan';
  const address = /^(100|106|114) (?:s|south) bryan (?:ave|avenue)(?: fort collins(?: co(?:lorado)?(?: 80521)?)?)?$/.exec(normalized);
  return address ? address[1] + ' S Bryan Ave' : null;
}
