export function matchesPierAddress(query) {
  const normalized = query.toLowerCase().replace(/[.,]/g, '').trim().replace(/\s+/g, ' ');
  return normalized === 'gulf state park pier' ||
    /^20800 (?:east|e) beach (?:blvd|boulevard)(?: gulf shores(?: al(?:abama)?(?: 36542)?)?)?$/.test(normalized);
}

export function daysAfterEvent(eventDate, milestoneDate) {
  if (milestoneDate.length !== 10 || milestoneDate <= eventDate) return null;
  return (Date.parse(milestoneDate) - Date.parse(eventDate)) / 86400000;
}
