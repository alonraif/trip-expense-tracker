'use client';

import { useRef, useState } from 'react';
import { CameraIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { setTripCover } from '@/app/trips/[tripId]/actions';
import { createClient } from '@/lib/supabase/client';
import {
  clampAxis,
  computeCoverLayout,
  getMinScale,
  layoutToPosition,
  type CoverLayout,
} from '@/lib/cover-image';

const MAX_SCALE = 3;

export function TripCoverUpload({
  tripId,
  hasCover,
}: {
  tripId: string;
  hasCover: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [layout, setLayout] = useState<CoverLayout | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    startX: number;
    startY: number;
    left: number;
    top: number;
  } | null>(null);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = '';
    if (!selected) return;

    setFile(selected);
    setScale(1);
    setMinScale(1);
    setNaturalSize(null);
    setLayout(null);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    const frame = frameRef.current;
    if (!frame) return;

    const size = { width: img.naturalWidth, height: img.naturalHeight };
    const frameWidth = frame.clientWidth;
    const frameHeight = frame.clientHeight;

    setNaturalSize(size);
    setMinScale(
      getMinScale({
        naturalWidth: size.width,
        naturalHeight: size.height,
        frameWidth,
        frameHeight,
      })
    );
    setLayout(
      computeCoverLayout({
        naturalWidth: size.width,
        naturalHeight: size.height,
        frameWidth,
        frameHeight,
        scale: 1,
        positionX: 50,
        positionY: 50,
      })
    );
  };

  const handleScaleChange = (value: number | readonly number[]) => {
    const nextScale = Array.isArray(value) ? value[0] : (value as number);
    const frame = frameRef.current;
    if (!frame || !naturalSize || !layout) {
      setScale(nextScale);
      return;
    }

    const frameWidth = frame.clientWidth;
    const frameHeight = frame.clientHeight;
    const { positionX, positionY } = layoutToPosition(
      layout,
      frameWidth,
      frameHeight
    );

    setScale(nextScale);
    setLayout(
      computeCoverLayout({
        naturalWidth: naturalSize.width,
        naturalHeight: naturalSize.height,
        frameWidth,
        frameHeight,
        scale: nextScale,
        positionX,
        positionY,
      })
    );
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!layout) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      left: layout.left,
      top: layout.top,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const frame = frameRef.current;
    if (!dragState.current || !frame || !layout) return;

    const frameWidth = frame.clientWidth;
    const frameHeight = frame.clientHeight;
    const deltaX = e.clientX - dragState.current.startX;
    const deltaY = e.clientY - dragState.current.startY;

    const left = clampAxis(
      dragState.current.left + deltaX,
      layout.width,
      frameWidth
    );
    const top = clampAxis(
      dragState.current.top + deltaY,
      layout.height,
      frameHeight
    );

    setLayout({ ...layout, left, top });
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  const closeDialog = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setNaturalSize(null);
    setLayout(null);
  };

  const handleSave = async () => {
    const frame = frameRef.current;
    if (!file || !layout || !frame) return;

    setIsUploading(true);
    try {
      const { positionX, positionY } = layoutToPosition(
        layout,
        frame.clientWidth,
        frame.clientHeight
      );

      const supabase = createClient();
      const path = `${tripId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('trip-covers')
        .upload(path, file);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('trip-covers').getPublicUrl(path);

      await setTripCover(tripId, publicUrl, positionX, positionY, scale);
      closeDialog();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload cover photo'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <label className="flex cursor-pointer items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/55">
        <CameraIcon className="size-3.5" />
        {hasCover ? 'Change cover' : 'Add cover photo'}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleSelect}
        />
      </label>

      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Position cover photo</DialogTitle>
            <DialogDescription>
              Drag to reposition and use the slider to zoom.
            </DialogDescription>
          </DialogHeader>

          {previewUrl && (
            <div
              ref={frameRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative h-36 w-full touch-none overflow-hidden rounded-lg bg-gradient-to-br from-primary/20 via-secondary/10 to-accent select-none"
            >
              <img
                src={previewUrl}
                alt=""
                draggable={false}
                onLoad={handleImageLoad}
                className="absolute cursor-grab active:cursor-grabbing"
                style={
                  layout
                    ? {
                        width: layout.width,
                        height: layout.height,
                        left: layout.left,
                        top: layout.top,
                      }
                    : { opacity: 0 }
                }
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Zoom</Label>
            <Slider
              value={[scale]}
              onValueChange={handleScaleChange}
              min={minScale}
              max={MAX_SCALE}
              step={0.05}
              disabled={!layout}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUploading || !layout}>
              {isUploading ? 'Saving...' : 'Save cover'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
