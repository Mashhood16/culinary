import React from 'react';

export default function CuisineWithFlag({ cuisine }: { cuisine?: string }) {
  if (!cuisine) return null;
  
  // Map cuisines to ISO 3166-1 alpha-2 country codes for FlagCDN
  const flags: Record<string, string> = {
    'Pakistani': 'pk',
    'Indian': 'in',
    'Italian': 'it',
    'American': 'us',
    'Turkish': 'tr',
    'Chinese': 'cn',
    'Mexican': 'mx',
    'Japanese': 'jp',
    'French': 'fr',
    'Thai': 'th',
    'Spanish': 'es',
    'Greek': 'gr',
    'Lebanese': 'lb',
    'Korean': 'kr',
    'Vietnamese': 'vn',
    'British': 'gb',
    'German': 'de',
  };

  const isoCode = flags[cuisine];
  
  if (isoCode) {
    return (
      <span className="inline-flex items-center gap-1.5 align-middle">
        {cuisine}
        <img 
          src={`https://flagcdn.com/24x18/${isoCode}.png`} 
          alt={`${cuisine} flag`}
          className="w-[1.2em] h-[0.9em] rounded-[2px] object-cover shadow-[0_0_2px_rgba(0,0,0,0.3)] inline-block" 
        />
      </span>
    );
  }

  // Fallbacks for regions that don't have a specific country flag
  const emojis: Record<string, string> = {
    'Middle Eastern': '🌍',
    'Mediterranean': '🌊',
    'Asian': '🌏',
  };

  const emoji = emojis[cuisine];
  if (emoji) {
    return (
      <span className="inline-flex items-center gap-1 align-middle">
        {cuisine} <span className="font-sans leading-none">{emoji}</span>
      </span>
    );
  }

  return <span>{cuisine}</span>;
}
