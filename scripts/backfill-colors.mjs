#!/usr/bin/env node
/**
 * Backfill script: extracts color palettes from recipe images using node-vibrant
 * and stores them in the recipes-data.json file.
 *
 * Usage: node scripts/backfill-colors.mjs
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const RECIPES_FILE = path.join(ROOT, 'recipes-data.json');
const CATALOG_FILE = path.join(ROOT, 'src', 'lib', 'recipe-catalog-exact.json');

// Use node-vibrant/node for Node.js (avoids browser canvas APIs)
const { Vibrant } = await import('node-vibrant/node');

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

function extractPaletteFallback() {
  return {
    vibrant: '#d97706',
    muted: '#92400e',
    darkVibrant: '#78350f',
    lightVibrant: '#fbbf24',
    darkMuted: '#451a03',
    lightMuted: '#fef3c7',
    dominant: '#b45309',
    gradient: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)',
    gradientLight: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)',
    gradientDark: 'linear-gradient(135deg, #451a03 0%, #78350f 50%, #92400e 100%)',
  };
}

async function extractColors(imageUrl) {
  try {
    const palette = await Vibrant.from(imageUrl).getPalette();

    const vibrant = palette.Vibrant?.hex || '#d97706';
    const muted = palette.Muted?.hex || '#92400e';
    const darkVibrant = palette.DarkVibrant?.hex || '#78350f';
    const lightVibrant = palette.LightVibrant?.hex || '#fbbf24';
    const darkMuted = palette.DarkMuted?.hex || '#451a03';
    const lightMuted = palette.LightMuted?.hex || '#fef3c7';
    const dominant = palette.Vibrant?.hex || palette.Muted?.hex || '#b45309';

    const gradientLight = `linear-gradient(135deg, ${lightMuted} 0%, ${lighten(vibrant, 0.5)} 50%, ${lighten(muted, 0.3)} 100%)`;
    const gradientDark = `linear-gradient(135deg, ${darkMuted} 0%, ${darken(vibrant, 0.5)} 50%, ${darken(muted, 0.4)} 100%)`;

    return {
      vibrant,
      muted,
      darkVibrant,
      lightVibrant,
      darkMuted,
      lightMuted,
      dominant,
      gradient: gradientLight,
      gradientLight,
      gradientDark,
    };
  } catch (err) {
    console.error(`  ⚠ Failed: ${err.message}`);
    return extractPaletteFallback();
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
const recipesFile = RECIPES_FILE;
let recipes = [];
if (existsSync(recipesFile)) {
  recipes = JSON.parse(readFileSync(recipesFile, 'utf8'));
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
let failed = 0;

for (const [slug, recipe] of allRecipes) {
  // Skip if already has colorPalette
  if (recipe.colorPalette && recipe.colorPalette.vibrant) {
    skipped++;
    continue;
  }

  const imageUrl = getImageUrl(recipe.image) || catalogImageBySlug.get(slug);
  if (!imageUrl) {
    console.log(`[${++processed}] ${slug}: no image, using fallback`);
    recipe.colorPalette = extractPaletteFallback();
    continue;
  }

  console.log(`[${++processed}] ${slug}: extracting from ${imageUrl.substring(0, 60)}...`);
  recipe.colorPalette = await extractColors(imageUrl);
  console.log(`  ✓ dominant: ${recipe.colorPalette.dominant}, vibrant: ${recipe.colorPalette.vibrant}`);
}

// Save updated recipes
const updatedRecipes = Array.from(allRecipes.values());
writeFileSync(recipesFile, JSON.stringify(updatedRecipes, null, 2), 'utf8');

console.log(`\nDone! Processed: ${processed}, Skipped (already had palette): ${skipped}`);
console.log(`Total recipes with color palettes: ${updatedRecipes.filter(r => r.colorPalette).length}`);
