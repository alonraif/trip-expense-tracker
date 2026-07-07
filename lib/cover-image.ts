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

// Clamps a single axis: if the image is at least as large as the frame on
// this axis, keep it pinned inside the frame (no blank edges). Otherwise
// (zoomed out past "cover", i.e. letterboxing) center it instead.
export function clampAxis(ideal: number, size: number, frameSize: number): number {
  if (size <= frameSize) {
    return (frameSize - size) / 2;
  }
  return Math.min(0, Math.max(frameSize - size, ideal));
}

// The smallest `scale` (relative to the "cover fit" baseline) that still
// keeps the whole image on-screen — i.e. "contain" fit. Below this there's
// nothing more of the image left to reveal.
export function getMinScale({
  naturalWidth,
  naturalHeight,
  frameWidth,
  frameHeight,
}: Pick<
  CoverLayoutInput,
  'naturalWidth' | 'naturalHeight' | 'frameWidth' | 'frameHeight'
>): number {
  const coverScale = Math.max(frameWidth / naturalWidth, frameHeight / naturalHeight);
  const containScale = Math.min(frameWidth / naturalWidth, frameHeight / naturalHeight);
  return containScale / coverScale;
}

// Computes the size/position of an image rendered at `scale` times the
// "cover fit" baseline, anchored so the point (positionX%, positionY%) of
// the image sits at the frame's center. Scale >= 1 crops in (clamped so
// there are no blank edges); scale < 1 zooms out past "cover" and centers
// the image instead, letterboxing whichever axis no longer fills the frame.
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

  const left = clampAxis(idealLeft, width, frameWidth);
  const top = clampAxis(idealTop, height, frameHeight);

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
