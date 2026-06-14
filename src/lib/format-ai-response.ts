export function formatAIResponse(text: string): string {
  if (!text) return '';

  const normalized = text
    .replace(/\u00a0/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .normalize('NFKC')
    .replace(/```[\w-]*\n?/g, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '• $1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/&(amp|quot|apos|lt|gt);/gi, (entity) => {
      switch (entity.toLowerCase()) {
        case '&amp;': return '&';
        case '&quot;': return '"';
        case '&apos;': return "'";
        case '&lt;': return '<';
        case '&gt;': return '>';
        default: return entity;
      }
    })
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-');

  return normalized
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}
