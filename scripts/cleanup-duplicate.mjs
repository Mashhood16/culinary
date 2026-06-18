import fs from "node:fs/promises";

const DATA_PATH = "./recipes-data.json";

// The list of exact recipe titles that just got hit with the generic placeholder
const affectedTitles = [
  "Risotto al Nero di Seppia", "Risotto ai Frutti di Mare", "Arancini", "Cannoli Siciliani", 
  "Sfogliatella", "Zabaglione", "Semifreddo", "Cassata Siciliana", "Babà al Rum", 
  "Crostata", "Panforte", "Zeppole", "Gelato", "Affogato", "Torrone", "Ricciarelli", 
  "Torta Caprese", "Struffoli", "Castagnaccio", "Macaroni and Cheese", "Shepherd’s Pie—American Style", 
  "Tuna Casserole", "Sloppy Joe", "Corn Dogs", "Stuffed Peppers", "Baked Beans", 
  "Tater Tot Casserole", "Philly Cheesesteak", "Chicago Deep-Dish Pizza", "Detroit-Style Pizza", 
  "Buffalo Wings", "Cincinnati Chili", "Hot Brown", "Monte Cristo Sandwich", "Reuben Sandwich", 
  "Shrimp and Grits", "Jambalaya", "Gumbo", "Red Beans and Rice", "Hoppin’ John", 
  "Chicken and Dumplings", "Biscuits and Gravy", "Country Ham", "Collard Greens", 
  "Blackened Catfish", "Cheeseburger"
];

async function main() {
  console.log("🧹 Initializing targeted duplicate cleanup...");
  
  const data = await fs.readFile(DATA_PATH, "utf8");
  let recipes = JSON.parse(data);
  let resetCount = 0;

  for (const recipe of recipes) {
    if (affectedTitles.includes(recipe.title)) {
      recipe.image = ""; // Completely clear it out
      resetCount++;
    }
  }

  await fs.writeFile(DATA_PATH, JSON.stringify(recipes, null, 2));
  
  console.log("\n==================================================");
  console.log(`🗑️ Successfully reset ${resetCount} duplicate recipe image fields to empty strings.`);
  console.log("==================================================\n");
}

main().catch(err => console.error(err));