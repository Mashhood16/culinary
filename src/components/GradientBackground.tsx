'use client';

import { useState, useEffect } from 'react';

interface GradientBackgroundProps {
  lightGradient: string;
  darkGradient: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Client component that renders a div with a gradient background
 * that switches between light and dark mode based on the document's class.
 */
export default function GradientBackground({ 
  lightGradient, 
  darkGradient, 
  className = '',
  children 
}: GradientBackgroundProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial state
    const root = document.documentElement;
    setIsDark(root.classList.contains('dark'));

    // Watch for theme changes
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'class') {
          setIsDark(root.classList.contains('dark'));
        }
      }
    });

    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div 
      className={className}
      style={{ background: isDark ? darkGradient : lightGradient }}
    >
      {children}
    </div>
  );
}
