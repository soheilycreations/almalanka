import { createClient } from '@supabase/supabase-js';

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// Supabase Storage object keys reject many characters real-world filenames contain
// (spaces, accents, parentheses, emoji from phone camera rolls, etc). Keep only a
// safe ASCII base name plus the extension, prefixed with a unique timestamp.
export function safeStorageFilename(originalName: string) {
  const dotIndex = originalName.lastIndexOf('.');
  const rawExt = dotIndex > -1 ? originalName.slice(dotIndex + 1) : '';
  const ext = rawExt.replace(/[^a-zA-Z0-9]/g, '').slice(0, 10).toLowerCase();

  const rawBase = dotIndex > -1 ? originalName.slice(0, dotIndex) : originalName;
  const base = rawBase
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const name = base ? `${unique}-${base}` : unique;
  return ext ? `${name}.${ext}` : name;
}
