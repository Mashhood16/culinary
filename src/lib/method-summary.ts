export function summarizeMethodStep(step: string) {
  const normalized = step
    .replace(/\s+/g, ' ')
    .replace(/\.+\s*$/g, '')
    .trim();

  if (!normalized) return '';

  return normalized
    .replace(/^\s*(Step\s*\d+[:.-]?\s*)/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}
