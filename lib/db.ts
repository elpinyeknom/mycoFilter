import { supabase } from '@/lib/supabaseClient';

export interface Reading {
  id: number;
  created_at: string;
  lat: number;
  lng: number;
  image_path: string;
  analyte: string;
  reference_rgb: string;
  raw_rgb: string;
  corrected_rgb: string;
  reaction_category: string;
  notes: string | null;
}

export async function insertReading(reading: Omit<Reading, 'id'>): Promise<Reading> {
  const { data, error } = await supabase
    .from('readings')
    .insert(reading)
    .select()
    .single();
  if (error) throw new Error(`insertReading failed: ${error.message}`);
  return data as Reading;
}

export async function listReadings(): Promise<Reading[]> {
  const { data, error } = await supabase
    .from('readings')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(`listReadings failed: ${error.message}`);
  return data as Reading[];
}
