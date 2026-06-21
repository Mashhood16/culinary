import { UnitSystem } from '@/hooks/useUnitSystem';

// Helper to parse fractions like "1 1/2" or "1/2" into floats
function parseNumberString(val: string): number {
  const parts = val.trim().split(' ');
  let total = 0;
  for (const part of parts) {
    if (part.includes('/')) {
      const [n, d] = part.split('/').map(Number);
      if (d !== 0) total += n / d;
    } else {
      total += Number(part);
    }
  }
  return total;
}

// Helper to format floats back into nice strings
function formatNumberString(val: number): string {
  if (!Number.isFinite(val)) return '';
  if (val >= 10) {
    return Number.isInteger(val) ? String(val) : val.toFixed(1).replace(/\.0$/, '');
  }
  const rounded = Math.round(val * 4) / 4;
  if (Number.isInteger(rounded)) return String(rounded);
  const whole = Math.floor(rounded);
  const fraction = rounded - whole;
  const fractions: Record<string, string> = {
    '0.25': '1/4',
    '0.5': '1/2',
    '0.75': '3/4',
  };
  const fractionText = fractions[fraction.toString()];
  if (fractionText) return whole ? `${whole} ${fractionText}` : fractionText;
  return rounded.toFixed(2).replace(/0$/, '').replace(/\.0$/, '');
}

export function convertIngredientUnits(ingredient: string, targetSystem: UnitSystem): string {
  if (!/\d/.test(ingredient)) return ingredient;

  // Regex to match a number (including fractions like 1 1/2) followed by a unit
  const regex = /((\d+\s+)?\d+(?:\.\d+|\/\d+)?)\s*([a-zA-Z°]+)/gi;

  if (targetSystem === 'imperial') {
    return ingredient.replace(regex, (match, numStr, _, unitStr) => {
      const val = parseNumberString(numStr);
      const unit = unitStr.toLowerCase();

      if (unit === 'g' || unit === 'grams' || unit === 'gram') {
        const oz = val * 0.035274;
        if (oz >= 16) return `${formatNumberString(oz / 16)} lbs`;
        return `${formatNumberString(oz)} oz`;
      }
      if (unit === 'kg' || unit === 'kilogram' || unit === 'kilograms') {
        return `${formatNumberString(val * 2.20462)} lbs`;
      }
      if (unit === 'ml' || unit === 'milliliters') {
        const cups = val / 236.588;
        if (cups >= 0.25) return `${formatNumberString(cups)} cups`;
        return `${formatNumberString(val / 29.5735)} fl oz`;
      }
      if (unit === 'c' || unit === 'celsius' || unit === '°c') {
        const f = (val * 9/5) + 32;
        return `${Math.round(f)}°F`;
      }
      return match;
    });
  } else {
    // targetSystem === 'metric'
    return ingredient.replace(regex, (match, numStr, _, unitStr) => {
      const val = parseNumberString(numStr);
      const unit = unitStr.toLowerCase();

      if (unit === 'oz' || unit === 'ounce' || unit === 'ounces') {
        return `${Math.round(val / 0.035274)}g`;
      }
      if (unit === 'lb' || unit === 'lbs' || unit === 'pound' || unit === 'pounds') {
        return val < 1 ? `${Math.round(val * 453.592)}g` : `${formatNumberString(val / 2.20462)} kg`;
      }
      if (unit === 'cup' || unit === 'cups') {
        return `${Math.round(val * 236.588)} ml`;
      }
      if (unit === 'f' || unit === 'fahrenheit' || unit === '°f') {
        const c = (val - 32) * 5/9;
        return `${Math.round(c)}°C`;
      }
      return match;
    });
  }
}
