export type CoverLayoutInput = {
  naturalWidth: number;
  naturalHeight: number;
  frameWidth: number;
  frameHeight: number;
  scale: number;
  positionX: number;
  positionY: number;
};

export type CoverLayout = {
  width: number;
  height: number;
  left: number;
  top: number;
};

// Computes the size/position of an image rendered at `scale` times the
// "cover fit" baseline, anchored so the point (positionX%, positionY%) of
// the image sits at the frame's center, clamped so the image always fully
// covers the frame (no blank edges).
export function computeCoverLayout({
  naturalWidth,
  naturalHeight,
  frameWidth,
  frameHeight,
  scale,
  positionX,
  positionY,
}: CoverLayoutInput): CoverLayout {
  const baseScale = Math.max(
    frameWidth / naturalWidth,
    frameHeight / naturalHeight
  );
  const effectiveScale = baseScale * scale;
  const width = naturalWidth * effectiveScale;
  const height = naturalHeight * effectiveScale;

  const idealLeft = frameWidth / 2 - (positionX / 100) * width;
  const idealTop = frameHeight / 2 - (positionY / 100) * height;

  const left = Math.min(0, Math.max(frameWidth - width, idealLeft));
  const top = Math.min(0, Math.max(frameHeight - height, idealTop));

  return { width, height, left, top };
}

// Inverse of the anchor calculation above — given where the image is
// currently positioned (left/top), derive the positionX/Y percentages to
// persist.
export function layoutToPosition(
  layout: Pick<CoverLayout, 'width' | 'height' | 'left' | 'top'>,
  frameWidth: number,
  frameHeight: number
): { positionX: number; positionY: number } {
  const positionX = ((frameWidth / 2 - layout.left) / layout.width) * 100;
  const positionY = ((frameHeight / 2 - layout.top) / layout.height) * 100;
  return {
    positionX: Math.min(100, Math.max(0, positionX)),
    positionY: Math.min(100, Math.max(0, positionY)),
  };
}
