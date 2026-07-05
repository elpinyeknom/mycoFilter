import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY env vars. See README.md "Running locally".'
  );
}

/**
 * Service-role client — bypasses RLS. Safe because this module is only ever imported by
 * server-side code (route handlers); the browser never talks to Supabase directly, it
 * always goes through our own /api/readings route.
 */
export const supabase = createClient(supabaseUrl, serviceRoleKey);
