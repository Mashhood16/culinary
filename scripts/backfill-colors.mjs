#!/usr/bin/env node
/**
 * Backfill script: extracts color palettes from recipe images using sharp
 * and stores them in recipes-data.json.
 *
 * Sharp resizes the image to a tiny thumbnail, samples edge pixels (left, right,
 * top, bottom), and builds a CSS gradient from those colors.
 *
 * Usage: node scripts/backfill-colors.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const RECIPES_FILE = path.join(ROOT, 'recipes-data.json');
const CATALOG_FILE = path.join(ROOT, 'src', 'lib', 'recipe-catalog-exact.json');

function rgbToHex(r, g, b) {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function darken(hex, factor) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    Math.round(r * (1 - factor)),
    Math.round(g * (1 - factor)),
    Math.round(b * (1 - factor))
  );
}

function lighten(hex, factor) {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(
    Math.round(r + (255 - r) * factor),
    Math.round(g + (255 - g) * factor),
    Math.round(b + (255 - b) * factor)
  );
}

/** Average an array of [r,g,b] tuples into a single hex color. */
function avgColor(pixels) {
  if (!pixels.length) return '#888888';
  const r = Math.round(pixels.reduce((s, p) => s + p[0], 0) / pixels.length);
  const g = Math.round(pixels.reduce((s, p) => s + p[1], 0) / pixels.length);
  const b = Math.round(pixels.reduce((s, p) => s + p[2], 0) / pixels.length);
  return rgbToHex(r, g, b);
}

/** Extract edge colors from an image URL using sharp. */
async function extractColors(imageUrl) {
  const fallback = {
    gradientLight: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)',
    gradientDark: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #92400e 100%)',
  };

  try {
    // Fetch image as buffer first (sharp can't fetch URLs directly)
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());

    // Resize to 20x12 thumbnail — tiny but enough for edge sampling
    const { data, info } = await sharp(buffer)
      .resize(20, 12, { fit: 'cover' })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;
    const pixels = [];
    for (let i = 0; i < data.length; i += channels) {
      pixels.push([data[i], data[i + 1], data[i + 2]]);
    }

    // Sample edges: 3-pixel strip from each side for robustness against borders
    const strip = 3;
    const left = [];
    const right = [];
    const top = [];
    const bottom = [];
    for (let y = 0; y < height; y++) {
      for (let dx = 0; dx < strip; dx++) left.push(pixels[y * width + dx]);
      for (let dx = 0; dx < strip; dx++) right.push(pixels[y * width + (width - 1 - dx)]);
    }
    for (let x = 0; x < width; x++) {
      for (let dy = 0; dy < strip; dy++) top.push(pixels[dy * width + x]);
      for (let dy = 0; dy < strip; dy++) bottom.push(pixels[(height - 1 - dy) * width + x]);
    }

    const leftHex = avgColor(left);
    const rightHex = avgColor(right);
    const topHex = avgColor(top);
    const bottomHex = avgColor(bottom);

    // Light gradient: use lightened edge colors for a soft, bright feel
    const gradientLight = `linear-gradient(135deg, ${lighten(leftHex, 0.4)} 0%, ${lighten(topHex, 0.3)} 35%, ${lighten(rightHex, 0.4)} 65%, ${lighten(bottomHex, 0.35)} 100%)`;

    // Dark gradient: use darkened edge colors
    const gradientDark = `linear-gradient(135deg, ${darken(leftHex, 0.3)} 0%, ${darken(topHex, 0.25)} 35%, ${darken(rightHex, 0.3)} 65%, ${darken(bottomHex, 0.28)} 100%)`;

    return {
      leftColor: leftHex,
      rightColor: rightHex,
      topColor: topHex,
      bottomColor: bottomHex,
      gradientLight,
      gradientDark,
    };
  } catch (err) {
    console.error(`  ⚠ Failed: ${err.message}`);
    return fallback;
  }
}

function getImageUrl(imageObj) {
  if (typeof imageObj === 'string') {
    const trimmed = imageObj.trim();
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) return trimmed;
    return null;
  }
  if (imageObj && typeof imageObj === 'object') {
    if (imageObj.url || imageObj.src) {
      const candidate = (imageObj.url || imageObj.src).trim();
      if (/^https?:\/\//i.test(candidate) || candidate.startsWith('/')) return candidate;
    }
  }
  return null;
}

// Build slug → catalog image lookup
const catalog = JSON.parse(readFileSync(CATALOG_FILE, 'utf8'));
const catalogImageBySlug = new Map();
for (const r of catalog.recipes || []) {
  const slug = String(r.slug || '');
  const img = r.image;
  if (slug && typeof img === 'string' && img.trim()) {
    catalogImageBySlug.set(slug, img.trim());
  }
}

// Load recipes
let recipes = [];
if (existsSync(RECIPES_FILE)) {
  recipes = JSON.parse(readFileSync(RECIPES_FILE, 'utf8'));
}

console.log(`Found ${recipes.length} recipes in recipes-data.json`);

// Also check catalog for recipes not in the data file
const catalogRecipes = (catalog.recipes || []).map(r => ({
  slug: String(r.slug || r.id || ''),
  title: String(r.title || r.name || ''),
  image: r.image,
}));

// Merge: recipes from file + any catalog-only recipes
const allRecipes = new Map();
for (const r of recipes) allRecipes.set(r.slug, r);
for (const r of catalogRecipes) {
  if (!allRecipes.has(r.slug)) {
    allRecipes.set(r.slug, r);
  }
}

let processed = 0;
let skipped = 0;

for (const [slug, recipe] of allRecipes) {
  // Skip if already has sharp-extracted palette (has leftColor = new format)
  if (recipe.colorPalette?.leftColor) {
    skipped++;
    continue;
  }

  const imageUrl = getImageUrl(recipe.image) || catalogImageBySlug.get(slug);
  if (!imageUrl) {
    console.log(`[${++processed}] ${slug}: no image, using fallback`);
    recipe.colorPalette = {
      gradientLight: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)',
      gradientDark: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #92400e 100%)',
    };
    continue;
  }

  console.log(`[${++processed}] ${slug}: extracting from ${imageUrl.substring(0, 60)}...`);
  recipe.colorPalette = await extractColors(imageUrl);
  console.log(`  ✓ left=${recipe.colorPalette.leftColor} top=${recipe.colorPalette.topColor} right=${recipe.colorPalette.rightColor}`);
}

// Save updated recipes
const updatedRecipes = Array.from(allRecipes.values());
writeFileSync(RECIPES_FILE, JSON.stringify(updatedRecipes, null, 2), 'utf8');

console.log(`\nDone! Processed: ${processed}, Skipped (already had sharp palette): ${skipped}`);
console.log(`Total recipes with color palettes: ${updatedRecipes.filter(r => r.colorPalette).length}`);
