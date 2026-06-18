const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const counts = {
    recipe: await prisma.recipe.count(),
    cuisine: await prisma.cuisine.count(),
    ingredient: await prisma.ingredient.count(),
    user: await prisma.user.count(),
    review: await prisma.review.count(),
    favorite: await prisma.favorite.count(),
    shoppingList: await prisma.shoppingList.count(),
    recipeIngredient: await prisma.recipeIngredient.count(),
    cookingStep: await prisma.cookingStep.count(),
    nutrition: await prisma.nutrition.count(),
    recipeHistorySource: await prisma.recipeHistorySource.count(),
    recipeModification: await prisma.recipeModification.count(),
    aIConversation: await prisma.aIConversation.count(),
  };

  console.log(JSON.stringify(counts, null, 2));
}

main()
  .catch((error) => {
    console.error('Verification failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
