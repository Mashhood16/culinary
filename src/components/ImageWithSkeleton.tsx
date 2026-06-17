'use client';

import { useState, useEffect, useRef } from 'react';
import Image, { ImageProps } from 'next/image';

export default function ImageWithSkeleton(props: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // If the browser has already loaded/cached the image, display it immediately 
    // to bypass the React onLoad event listener delay.
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }
  }, []);

  return (
    <div className="relative w-full h-full overflow-hidden bg-stone-100 dark:bg-stone-900 rounded-3xl">
      {/* Pulse skeleton backdrop */}
      {!loaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-stone-100 via-stone-200/40 to-stone-100 dark:from-stone-900 dark:via-stone-850 dark:to-stone-900 animate-pulse" />
      )}
      <Image
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