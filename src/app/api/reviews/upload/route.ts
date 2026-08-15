import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const BUCKET = 'reviews';

async function uploadOne(supabase: ReturnType<typeof getSupabaseAdmin>, file: File) {
  const safeName = file.name.replace(/\s+/g, '-');
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase!.storage.from(BUCKET).upload(filename, buffer, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });

  if (error) throw new Error(error.message);

  const { data: pub } = supabase!.storage.from(BUCKET).getPublicUrl(filename);
  return pub.publicUrl;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const voice = formData.get('voice') as File | null;

    const photoUrls: string[] = [];
    const videoUrls: string[] = [];
    let voiceUrl: string | null = null;

    for (const file of files) {
      const url = await uploadOne(supabase, file);
      if (file.type.startsWith('video/')) {
        videoUrls.push(url);
      } else {
        photoUrls.push(url);
      }
    }

    if (voice) {
      voiceUrl = await uploadOne(supabase, voice);
    }

    return NextResponse.json({ photoUrls, videoUrls, voiceUrl });
  } catch (error: any) {
    console.error('Review media upload error:', error);
    return NextResponse.json({ error: error.message || 'Upload failed' }, { status: 500 });
  }
}
