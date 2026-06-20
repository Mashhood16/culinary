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

function avgColor(pixels: Uint8ClampedArray, start: number, count: number): [number, number, number] {
  let r = 0, g = 0, b = 0;
  for (let i = 0; i < count; i++) {
    const idx = (start + i) * 4;
    r += pixels[idx]; g += pixels[idx + 1]; b += pixels[idx + 2];
  }
  return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
}

const FALLBACK_LIGHT = 'linear-gradient(to bottom, #e7e5e4, #d6d3d1)';

export default function AdaptiveImageContainer({ src, children, className = '' }: AdaptiveImageContainerProps) {
  const [bg, setBg] = useState(FALLBACK_LIGHT);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!src) return;
    let cancelled = false;
    let observer: MutationObserver | null = null;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;

    img.onload = () => {
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      try {
        const w = 40, h = 40;
        canvas.width = w; canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h).data;

        // Sample edges: left column, right column, top center, bottom center
        const topRow = data.slice(0, w * 4);
        const bottomRow = data.slice((h - 1) * w * 4, h * w * 4);

        let lr = 0, lg = 0, lblue = 0;
        for (let y = 0; y < h; y++) { const i = y * w * 4; lr += data[i]; lg += data[i+1]; lblue += data[i+2]; }
        const left: [number,number,number] = [Math.round(lr/h), Math.round(lg/h), Math.round(lblue/h)];

        let rr = 0, rg = 0, rb = 0;
        for (let y = 0; y < h; y++) { const i = (y*w+w-1)*4; rr += data[i]; rg += data[i+1]; rb += data[i+2]; }
        const right: [number,number,number] = [Math.round(rr/h), Math.round(rg/h), Math.round(rb/h)];

        const topMid = avgColor(topRow, Math.floor(w*0.33), Math.floor(w*0.34));
        const botMid = avgColor(bottomRow, Math.floor(w*0.33), Math.floor(w*0.34));

        // Light mode: darken 50-65%
        const lightTop = `linear-gradient(to right, ${darken(...left,0.65)} 0%, ${darken(...topMid,0.65)} 50%, ${darken(...right,0.65)} 100%)`;
        const lightBot = `linear-gradient(to right, ${darken(...left,0.5)} 0%, ${darken(...botMid,0.5)} 50%, ${darken(...right,0.5)} 100%)`;
        const lightBg = `linear-gradient(to bottom, ${lightTop} 0%, ${lightBot} 100%)`;

        // Dark mode: darken 30-40%
        const darkTop = `linear-gradient(to right, ${darken(...left,0.4)} 0%, ${darken(...topMid,0.4)} 50%, ${darken(...right,0.4)} 100%)`;
        const darkBot = `linear-gradient(to right, ${darken(...left,0.3)} 0%, ${darken(...botMid,0.3)} 50%, ${darken(...right,0.3)} 100%)`;
        const darkBg = `linear-gradient(to bottom, ${darkTop} 0%, ${darkBot} 100%)`;

        if (cancelled) return;

        // Apply based on current theme
        const isDark = document.documentElement.classList.contains('dark');
        setBg(isDark ? darkBg : lightBg);

        // Watch for theme changes
        observer = new MutationObserver(() => {
          const nowDark = document.documentElement.classList.contains('dark');
          setBg(nowDark ? darkBg : lightBg);
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      } catch {
        if (!cancelled) setBg(FALLBACK_LIGHT);
      }
    };

    img.onerror = () => {
      if (!cancelled) setBg(FALLBACK_LIGHT);
    };

    return () => {
      cancelled = true;
      if (observer) observer.disconnect();
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
