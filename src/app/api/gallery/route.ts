import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase-admin';
import fs from 'fs';
import path from 'path';

const BUCKET = 'gallery';
const MEDIA_EXT = /\.(jpg|jpeg|png|gif|webp|mp4|webm|mov|mp3|wav|ogg|m4a)$/i;

export async function GET() {
  try {
    let files: any[] = [];
    const supabase = getSupabaseAdmin();

    if (supabase) {
      const { data, error } = await supabase.storage.from(BUCKET).list('', {
        sortBy: { column: 'created_at', order: 'desc' },
      });
      if (error) throw error;

      files = (data || [])
        .filter((f) => f.name && f.id)
        .map((f) => {
          const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
          return {
            id: f.id,
            src: pub.publicUrl,
            title: f.name.replace(/\.[^/.]+$/, ''),
          };
        });
    }

    // Static images bundled with the app at build time (legacy assets)
    const galleryDir = path.join(process.cwd(), 'public/Our Gallery');
    if (fs.existsSync(galleryDir)) {
      const galleryFiles = fs.readdirSync(galleryDir)
        .filter(file => MEDIA_EXT.test(file))
        .map(file => ({
          id: `g-${file}`,
          src: `/Our Gallery/${file}`,
          title: file.replace(/WhatsApp Image | at | PM| AM|\.jpeg|\.jpg/g, ' ').trim()
        }));
      files = [...files, ...galleryFiles];
    }

    const imgDir = path.join(process.cwd(), 'public/img');
    if (fs.existsSync(imgDir)) {
      const imgFiles = fs.readdirSync(imgDir)
        .filter(file => MEDIA_EXT.test(file))
        .map(file => ({
          id: `i-${file}`,
          src: `/img/${file}`,
          title: file.split('-').slice(0, 2).join(' ')
        }));
      files = [...files, ...imgFiles];
    }

    return NextResponse.json(files);
  } catch (error) {
    console.error('Gallery fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
  }
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

    if (!files.length) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const results = [];
    for (const file of files) {
      const safeName = file.name.replace(/\s+/g, '-');
      const filename = `${Date.now()}-${safeName}`;
      const buffer = Buffer.from(await file.arrayBuffer());

      const { error } = await supabase.storage.from(BUCKET).upload(filename, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(filename);
      results.push({ src: pub.publicUrl, filename });
    }

    return NextResponse.json({
      message: 'Files uploaded successfully',
      files: results,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
