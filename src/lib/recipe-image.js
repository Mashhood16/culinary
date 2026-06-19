// Pure JavaScript - No TypeScript annotations to crash the compiler
const FALLBACK_IMAGE = '/fallback-recipe.jpg';

export function getImageUrl(imageObj, { width: _width = 800, height: _height = 500 } = {}) {
  // Case 1: String — use directly
  if (typeof imageObj === 'string') {
    const trimmed = imageObj.trim();
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) {
      return trimmed;
    }
    return FALLBACK_IMAGE;
  }

  // Case 2: Object with url or src
  if (imageObj && typeof imageObj === 'object') {
    if (imageObj.url || imageObj.src) {
      const candidate = (imageObj.url || imageObj.src).trim();
      if (/^https?:\/\//i.test(candidate) || candidate.startsWith('/')) {
        return candidate;
      }
    }

    // If object has publicId but no url/src, the image was stored in Cloudinary
    // but we no longer use Cloudinary — fall back to default
  }

  return FALLBACK_IMAGE;
}