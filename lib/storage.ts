import { supabase } from '@/lib/supabaseClient';

const BUCKET = 'reading-images';

export async function uploadReadingImage(buffer: Buffer, filename: string): Promise<string> {
  const contentType = filename.endsWith('.png') ? 'image/png' : 'image/jpeg';
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(filename, buffer, { contentType });
  if (error) throw new Error(`uploadReadingImage failed: ${error.message}`);

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}
