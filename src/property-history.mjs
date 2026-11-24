export const evidenceTypes = ['Upgrade', 'Inspection', 'Outcome'];

export function evidenceEntry(values) {
  const { type, date } = values;
  const summary = values.summary.trim();
  const source = values.source.trim();
  const parsed = new Date(date);
  if (!evidenceTypes.includes(type) || !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !Number.isFinite(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== date ||
      !summary || summary.length > 300 || !source || source.length > 120) {
    throw new Error('Enter a valid date, finding and source reference.');
  }
  return { id: crypto.randomUUID(), type, date, summary, source, added_at: new Date().toISOString(), reviewed_at: null };
}

export function readHistory(storage, propertyId) {
  try {
    const items = JSON.parse(storage.getItem('varsa:evidence:' + propertyId) || '[]');
    return Array.isArray(items) ? items.sort((a,b) => b.date.localeCompare(a.date) || b.added_at.localeCompare(a.added_at)) : [];
  } catch {
    return [];
  }
}

export function writeHistory(storage, propertyId, items) {
  storage.setItem('varsa:evidence:' + propertyId, JSON.stringify(items));
}
