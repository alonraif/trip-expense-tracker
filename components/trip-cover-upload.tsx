'use client';

import { useState } from 'react';
import { CameraIcon } from 'lucide-react';
import { toast } from 'sonner';
import { setTripCover } from '@/app/trips/[tripId]/actions';
import { createClient } from '@/lib/supabase/client';
import { cn } from '@/lib/utils';

export function TripCoverUpload({
  tripId,
  hasCover,
}: {
  tripId: string;
  hasCover: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
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

      await setTripCover(tripId, publicUrl);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Failed to upload cover photo'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition hover:bg-black/55',
        isUploading && 'pointer-events-none opacity-70'
      )}
    >
      <CameraIcon className="size-3.5" />
      {isUploading ? 'Uploading...' : hasCover ? 'Change cover' : 'Add cover photo'}
      <input
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleChange}
        disabled={isUploading}
      />
    </label>
  );
}
