export function getCuisineWithFlag(cuisine?: string): string {
  if (!cuisine) return '';
  
  const flags: Record<string, string> = {
    'Pakistani': '🇵🇰',
    'Indian': '🇮🇳',
    'Italian': '🇮🇹',
    'American': '🇺🇸',
    'Turkish': '🇹🇷',
    'Chinese': '🇨🇳',
    'Mexican': '🇲🇽',
    'Japanese': '🇯🇵',
    'French': '🇫🇷',
    'Thai': '🇹🇭',
    'Spanish': '🇪🇸',
    'Greek': '🇬🇷',
    'Lebanese': '🇱🇧',
    'Korean': '🇰🇷',
    'Vietnamese': '🇻🇳',
    'British': '🇬🇧',
    'German': '🇩🇪',
    'Middle Eastern': '🌍',
    'Mediterranean': '🌊',
    'Asian': '🌏',
  };

  const flag = flags[cuisine];
  return flag ? `${cuisine} ${flag}` : cuisine;
}
