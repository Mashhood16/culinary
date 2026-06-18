const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.shoppingList.deleteMany();
  await prisma.recipeHistorySource.deleteMany();
  await prisma.nutrition.deleteMany();
  await prisma.recipeIngredient.deleteMany();
  await prisma.cookingStep.deleteMany();
  await prisma.recipeModification.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.cuisine.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.user.deleteMany();

  console.log('Cleared all DB recipe-related records and users.');
}

main()
  .catch((error) => {
    console.error('Failed to clear DB recipe records:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
