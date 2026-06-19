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

    // Case 3: Cloudinary publicId format — construct URL
    if (imageObj.publicId) {
      const publicId = imageObj.publicId.trim();
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dlzc5iwue';
      // Remove leading slash if present
      const cleanId = publicId.replace(/^\//, '');
      return `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${_width},h_${_height}/v1/${cleanId}`;
    }
  }

  return FALLBACK_IMAGE;
}