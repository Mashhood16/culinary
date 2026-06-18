// Pure JavaScript - No TypeScript annotations to crash the compiler
const FALLBACK_IMAGE = '/fallback-recipe.jpg';

export function getImageUrl(imageObj, { width: _width = 800, height: _height = 500 } = {}) {
  const candidate =
    typeof imageObj === 'string'
      ? imageObj
      : imageObj && typeof imageObj === 'object'
        ? (imageObj.url || imageObj.src || '')
        : '';

  if (typeof candidate !== 'string') {
    return FALLBACK_IMAGE;
  }

  const trimmed = candidate.trim();

  if (!trimmed) {
    return FALLBACK_IMAGE;
  }

  // Allow absolute URLs and local paths, but reject anything that is not a usable image reference.
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
    return trimmed;
  }

  return FALLBACK_IMAGE;
}