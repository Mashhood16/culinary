'use client';

import { useState, useEffect } from 'react';

interface GradientBackgroundProps {
  lightGradient: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Client component that renders a div with a gradient background
 * that uses the light gradient in both modes, with a semi-transparent
 * dark overlay in dark mode so the colors remain visible but muted.
 */
export default function GradientBackground({ 
  lightGradient,
  className = '',
  children 
}: GradientBackgroundProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    setIsDark(root.classList.contains('dark'));

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
      style={{ background: lightGradient }}
    >
      {/* Dark mode overlay - mutes the gradient colors while keeping them visible */}
      {isDark && (
        <div 
          className="absolute inset-0 pointer-events-none z-10"
          style={{ background: 'rgba(17, 24, 39, 0.6)' }}
        />
      )}
      {children}
    </div>
  );
}
