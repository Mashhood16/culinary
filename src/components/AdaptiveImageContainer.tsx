'use client';

import { useEffect, useRef, useState } from 'react';

interface AdaptiveImageContainerProps {
  src: string;
  children: React.ReactNode;
  className?: string;
}

function darken(r: number, g: number, b: number, factor: number): string {
  return `rgb(${Math.round(r * factor)}, ${Math.round(g * factor)}, ${Math.round(b * factor)})`;
}

function avgColor(data: Uint8ClampedArray, startRow: number, rowCount: number, w: number): [number, number, number] {
  let r = 0, g = 0, b = 0, count = 0;
  for (let y = startRow; y < startRow + rowCount && y < 40; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      r += data[idx]; g += data[idx + 1]; b += data[idx + 2];
      count++;
    }
  }
  return count > 0 ? [Math.round(r / count), Math.round(g / count), Math.round(b / count)] : [128, 128, 128];
}

function sampleColumn(data: Uint8ClampedArray, x: number, h: number, w: number): [number, number, number] {
  let r = 0, g = 0, b = 0;
  for (let y = 0; y < h; y++) {
    const idx = (y * w + x) * 4;
    r += data[idx]; g += data[idx + 1]; b += data[idx + 2];
  }
  return [Math.round(r / h), Math.round(g / h), Math.round(b / h)];
}

const FALLBACK_LIGHT = 'linear-gradient(to bottom, #e7e5e4, #d6d3d1)';

export default function AdaptiveImageContainer({ src, children, className = '' }: AdaptiveImageContainerProps) {
  const [bg, setBg] = useState(FALLBACK_LIGHT);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    let observer: MutationObserver | null = null;
    let objectUrl: string | null = null;

    async function extractColors() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      try {
        // Fetch image as blob to bypass canvas CORS restrictions
        const res = await fetch(src);
        if (!res.ok) { if (!cancelled) setBg(FALLBACK_LIGHT); return; }
        const blob = await res.blob();
        if (cancelled) return;

        objectUrl = URL.createObjectURL(blob);

        const img = new Image();
        img.onload = () => {
          if (cancelled) return;

          const w = 40, h = 40;
          canvas.width = w; canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(objectUrl!);

          const data = ctx.getImageData(0, 0, w, h).data;

          // Sample edges
          const left = sampleColumn(data, 0, h, w);
          const right = sampleColumn(data, w - 1, h, w);
          const topMid = avgColor(data, 0, 3, w);
          const botMid = avgColor(data, h - 3, 3, w);

          // Light mode: darken 55-70%
          const lt = `linear-gradient(to right, ${darken(...left,0.7)} 0%, ${darken(...topMid,0.7)} 50%, ${darken(...right,0.7)} 100%)`;
          const lb = `linear-gradient(to right, ${darken(...left,0.55)} 0%, ${darken(...botMid,0.55)} 50%, ${darken(...right,0.55)} 100%)`;
          const lightBg = `linear-gradient(to bottom, ${lt} 0%, ${lb} 100%)`;

          // Dark mode: darken 30-40%
          const dt = `linear-gradient(to right, ${darken(...left,0.4)} 0%, ${darken(...topMid,0.4)} 50%, ${darken(...right,0.4)} 100%)`;
          const db = `linear-gradient(to right, ${darken(...left,0.3)} 0%, ${darken(...botMid,0.3)} 50%, ${darken(...right,0.3)} 100%)`;
          const darkBg = `linear-gradient(to bottom, ${dt} 0%, ${db} 100%)`;

          if (cancelled) return;

          const isDark = document.documentElement.classList.contains('dark');
          setBg(isDark ? darkBg : lightBg);

          observer = new MutationObserver(() => {
            const nowDark = document.documentElement.classList.contains('dark');
            setBg(nowDark ? darkBg : lightBg);
          });
          observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        };

        img.onerror = () => { if (!cancelled) setBg(FALLBACK_LIGHT); };
        img.src = objectUrl;
      } catch {
        if (!cancelled) setBg(FALLBACK_LIGHT);
      }
    }

    extractColors();

    return () => {
      cancelled = true;
      if (observer) observer.disconnect();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  return (
    <div
      className={`w-full rounded-3xl shadow-md animate-fade-in ${className}`}
      style={{ background: bg }}
    >
      {children}
      <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
    </div>
  );
}
