import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const heroDir = path.join(process.cwd(), 'public', 'hero');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(heroDir)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(heroDir);
    
    // Filter for image files
    const images = files
      .filter(file => /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file))
      .map(file => `/hero/${file}`);

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error reading hero images:', error);
    return NextResponse.json([], { status: 500 });
  }
}
