import { useState, useEffect } from 'react';

export type UnitSystem = 'metric' | 'imperial';

export function useUnitSystem() {
  const [unitSystem, setUnitSystem] = useState<UnitSystem>('metric');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('unitSystem') as UnitSystem;
    if (saved) {
      setUnitSystem(saved);
    }
  }, []);

  const toggleUnitSystem = () => {
    const newSystem = unitSystem === 'metric' ? 'imperial' : 'metric';
    setUnitSystem(newSystem);
    localStorage.setItem('unitSystem', newSystem);
  };

  return { unitSystem, toggleUnitSystem, isClient };
}
