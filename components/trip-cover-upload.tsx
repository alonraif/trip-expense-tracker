'use client';

import { useEffect, useRef, useState } from 'react';
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
import { setTripCover } from '@/app/trips/[tripId]/actions';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function TripCoverUpload({
  tripId,
  hasCover,
}: {
  tripId: string;
  hasCover: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [isUploading, setIsUploading] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    startX: number;
    startY: number;
    startPos: { x: number; y: number };
  } | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    e.target.value = '';
    if (!selected) return;

    setFile(selected);
    setPosition({ x: 50, y: 50 });
    setPreviewUrl(URL.createObjectURL(selected));
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPos: position,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragState.current || !frameRef.current) return;
    const { width, height } = frameRef.current.getBoundingClientRect();
    const deltaX = e.clientX - dragState.current.startX;
    const deltaY = e.clientY - dragState.current.startY;

    setPosition({
      x: clamp(dragState.current.startPos.x - (deltaX / width) * 100, 0, 100),
      y: clamp(dragState.current.startPos.y - (deltaY / height) * 100, 0, 100),
    });
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  const closeDialog = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleSave = async () => {
    if (!file) return;

    setIsUploading(true);
    try {
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

      await setTripCover(tripId, publicUrl, position.x, position.y);
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
            <DialogDescription>Drag to adjust what shows in the frame.</DialogDescription>
          </DialogHeader>

          {previewUrl && (
            <div
              ref={frameRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              className="relative h-36 w-full touch-none overflow-hidden rounded-lg select-none"
            >
              <img
                src={previewUrl}
                alt=""
                draggable={false}
                className={cn(
                  'h-full w-full object-cover',
                  'cursor-grab active:cursor-grabbing'
                )}
                style={{ objectPosition: `${position.x}% ${position.y}%` }}
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={isUploading}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isUploading}>
              {isUploading ? 'Saving...' : 'Save cover'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
