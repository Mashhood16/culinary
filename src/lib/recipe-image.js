const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export function getImageUrl(imageObj, { width = 800, height = 500 } = {}) {
  // If it's the new object structure
  if (typeof imageObj === 'object' && imageObj?.publicId) {
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto,c_fill,w_${width},h_${height}/${imageObj.publicId}`;
  }
  // Fallback for old string URLs
  return typeof imageObj === 'string' ? imageObj : '/fallback-recipe.jpg';
}