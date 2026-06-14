from pathlib import Path
import re

root = Path(__file__).resolve().parent
files = [
    root.parent / 'src' / 'app' / 'admin' / 'page.tsx',
    root.parent / 'scripts' / 'import-recipe-catalog.mjs',
    root.parent / 'prisma' / 'seed.ts',
    root.parent / 'src' / 'lib' / 'recipe-catalog.json',
    root.parent / 'src' / 'lib' / 'recipes-data.json',
]

replacements = [
    (r'Alcohol-Free adaptation', 'adaptation'),
    (r'Alcohol-Free Pasta Alfredo', 'Pasta Alfredo'),
    (r'"alcohol-free-mojito"', '"alcohol-free-mojito"'),
    (r"'alcohol-free-mojito'", "'alcohol-free-mojito'"),
    (r'alcohol[- ]free', ''),
    (r'Alcohol Free', ''),
    (r'Alcohol-free friendly', 'friendly'),
    (r' alcohol-free version', ' version'),
    (r'halal, alcohol-free, or dry diets', 'halal or dry diets'),
]

for path in files:
    if not path.exists():
        print(f'MISSING {path}')
        continue
    text = path.read_text(encoding='utf-8')
    out = text
    for pattern, replacement in replacements:
        out = re.sub(pattern, replacement, out)
    if out != text:
        path.write_text(out, encoding='utf-8')
        print(f'Updated {path}')
    else:
        print(f'No changes for {path}')
