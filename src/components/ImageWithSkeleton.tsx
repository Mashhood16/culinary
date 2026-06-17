'use client';

import { useState, useEffect, useRef } from 'react';
import Image, { ImageProps } from 'next/image';

// Destructure 'alt' out of the props object to prevent duplicate properties in the JSX element
export default function ImageWithSkeleton({ alt, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Safely verify if the image is already parsed/cached on client mount
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-stone-100 dark:bg-stone-900 rounded-3xl">
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-stone-200/40 to-stone-100 dark:from-stone-900 dark:via-stone-850 dark:to-stone-900 animate-pulse" />
      )}
      <Image
        // Explicitly set alt fallback using the destructured variable
        alt={alt || ""}
        {...props}
        ref={imgRef}
        onLoad={() => setLoaded(true)}
        className={`transition-opacity duration-300 ease-in-out ${props.className || ''} ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}