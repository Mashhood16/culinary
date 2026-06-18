import json
from pathlib import Path

import openpyxl

root = Path(__file__).resolve().parents[1]
workbook_path = Path(r"C:/Users/mashh/Downloads/recipe_image_links_320_verified.xlsx")
normalized_path = root / "src/lib/recipe-catalog.json"
exact_path = root / "src/lib/recipe-catalog-exact.json"

wb = openpyxl.load_workbook(workbook_path, data_only=True)
ws = wb.active

rows = list(ws.iter_rows(values_only=True))
header = [str(cell).strip() if cell is not None else "" for cell in rows[3]]

# Columns in the workbook:
# 0 ID, 1 Recipe Name, 2 Cuisine, 3 Verified Search Query, 4 Openverse Image Search, 5 Wikimedia Commons Image Search, 6 Verification Status
openverse_col = header.index("Openverse Image Search") if "Openverse Image Search" in header else 4
wikimedia_col = header.index("Wikimedia Commons Image Search") if "Wikimedia Commons Image Search" in header else 5
name_col = header.index("Recipe Name") if "Recipe Name" in header else 1
cuisine_col = header.index("Cuisine") if "Cuisine" in header else 2

mapping = {}
for row in rows[4:]:
    if not row or not row[name_col]:
        continue
    title = str(row[name_col]).strip()
    cuisine = str(row[cuisine_col]).strip() if row[cuisine_col] is not None else ""
    openverse = str(row[openverse_col]).strip() if row[openverse_col] is not None else ""
    wikimedia = str(row[wikimedia_col]).strip() if row[wikimedia_col] is not None else ""
    link = openverse or wikimedia or ""
    mapping[(title, cuisine)] = link


normalized = json.loads(normalized_path.read_text(encoding="utf-8"))
exact = json.loads(exact_path.read_text(encoding="utf-8"))

updated_normalized = 0
for recipe in normalized:
    key = (recipe.get("title", ""), recipe.get("cuisine", ""))
    link = mapping.get(key, "")
    if link:
        recipe["image"] = link
        recipe["image_url"] = link
        updated_normalized += 1

updated_exact = 0
for recipe in exact.get("recipes", []):
    key = (recipe.get("title", ""), recipe.get("cuisine", ""))
    link = mapping.get(key, "")
    if link:
        recipe["image_url"] = link
        recipe["image"] = link
        updated_exact += 1

normalized_path.write_text(json.dumps(normalized, indent=2) + "\n", encoding="utf-8")
exact_path.write_text(json.dumps(exact, indent=2) + "\n", encoding="utf-8")

print(json.dumps({
    "updated_normalized": updated_normalized,
    "updated_exact": updated_exact,
    "total_links": len(mapping),
    "sample": list(mapping.items())[:3],
}, indent=2))
