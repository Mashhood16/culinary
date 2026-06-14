import fs from 'node:fs';
import path from 'node:path';

const catalogPath = path.join(process.cwd(), 'src/lib/recipe-catalog.json');
const exactCatalogPath = path.join(process.cwd(), 'src/lib/recipe-catalog-exact.json');
const recipes = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const exactRecipes = JSON.parse(fs.readFileSync(exactCatalogPath, 'utf8'));

const curatedImages = {
  rice: [
    'https://images.unsplash.com/photo-1599043513900-ed6fe01d3833?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
  ],
  curry: [
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80',
  ],
  grilled: [
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
  ],
  dessert: [
    'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=900&q=80',
  ],
  drink: [
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=900&q=80',
  ],
  bakery: [
    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80',
  ],
  snack: [
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=900&q=80',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
  ],
};

function pickImage(recipe, index) {
  const text = `${recipe.title} ${recipe.foodType} ${recipe.description}`.toLowerCase();

  if (/biryani|pulao|rice|pilaf/.test(text)) return curatedImages.rice[index % curatedImages.rice.length];
  if (/nihari|karahi|curry|stew|bhuna|rezala|gosht|masala|korma|chana|palak|rogan/.test(text)) return curatedImages.curry[index % curatedImages.curry.length];
  if (/kebab|tikka|grill|barbecue|fried|roast|fish|beef|chicken/.test(text)) return curatedImages.grilled[index % curatedImages.grilled.length];
  if (/dessert|sweet|jamun|kheer|halwa|gulab|payasam/.test(text)) return curatedImages.dessert[index % curatedImages.dessert.length];
  if (/lassi|chai|tea|drink|smoothie|juice/.test(text)) return curatedImages.drink[index % curatedImages.drink.length];
  if (/bread|dosa|naan|paratha|bakery/.test(text)) return curatedImages.bakery[index % curatedImages.bakery.length];
  if (/snack|samosa|pakora|fries|appetizer/.test(text)) return curatedImages.snack[index % curatedImages.snack.length];

  return curatedImages.curry[index % curatedImages.curry.length];
}

const updated = recipes.map((recipe, index) => {
  const image = pickImage(recipe, index);
  return {
    ...recipe,
    image,
    image_url: image,
  };
});

const updatedExact = {
  ...exactRecipes,
  recipes: (exactRecipes.recipes || []).map((recipe, index) => {
    const image = pickImage(recipe, index);
    return {
      ...recipe,
      image,
      image_url: image,
    };
  }),
};

fs.writeFileSync(catalogPath, `${JSON.stringify(updated, null, 2)}\n`, 'utf8');
fs.writeFileSync(exactCatalogPath, `${JSON.stringify(updatedExact, null, 2)}\n`, 'utf8');
console.log(`Updated ${updated.length} recipe images in ${catalogPath}`);
console.log(`Updated ${updatedExact.recipes.length} exact recipe image links in ${exactCatalogPath}`);
