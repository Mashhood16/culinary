'use client';

import { useState, useEffect, useRef } from 'react';
import Image, { ImageProps } from 'next/image';

interface ImageWithSkeletonProps extends ImageProps {
  wrapperClassName?: string;
}

export default function ImageWithSkeleton({ alt, wrapperClassName, ...props }: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Safely verify if the image is already parsed/cached on client mount
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden rounded-3xl ${wrapperClassName || 'bg-stone-100 dark:bg-stone-900'}`}>
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