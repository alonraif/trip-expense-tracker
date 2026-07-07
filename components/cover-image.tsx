'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { computeCoverLayout } from '@/lib/cover-image';
import { cn } from '@/lib/utils';

export function CoverImage({
  src,
  positionX,
  positionY,
  scale,
  className,
}: {
  src: string;
  positionX: number;
  positionY: number;
  scale: number;
  className?: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [layout, setLayout] = useState<React.CSSProperties>({ opacity: 0 });

  const recompute = () => {
    const frame = frameRef.current;
    const img = imgRef.current;
    if (!frame || !img || !img.naturalWidth) return;

    const { width, height, left, top } = computeCoverLayout({
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      frameWidth: frame.clientWidth,
      frameHeight: frame.clientHeight,
      scale,
      positionX,
      positionY,
    });

    setLayout({ width, height, left, top, opacity: 1 });
  };

  useLayoutEffect(() => {
    recompute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, positionX, positionY, scale]);

  return (
    <div
      ref={frameRef}
      className={cn(
        'relative overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-accent',
        className
      )}
    >
      <img
        ref={imgRef}
        src={src}
        alt=""
        draggable={false}
        onLoad={recompute}
        className="absolute transition-opacity"
        style={layout}
      />
    </div>
  );
}
