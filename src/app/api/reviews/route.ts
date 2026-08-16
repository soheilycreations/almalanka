import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendReviewNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    const reviews = await prisma.review.findMany({
      where: all ? {} : { status: 'published' },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.authorName || !body.rating || !body.message) {
      return NextResponse.json({ error: 'Name, rating and message are required' }, { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        authorName: body.authorName,
        country: body.country || null,
        rating: Math.max(1, Math.min(5, parseInt(body.rating))),
        message: body.message,
        photoUrls: Array.isArray(body.photoUrls) ? body.photoUrls : [],
        videoUrls: Array.isArray(body.videoUrls) ? body.videoUrls : [],
        voiceUrl: body.voiceUrl || null,
        status: body.status === 'published' ? 'published' : 'pending',
      },
    });

    sendReviewNotification(review).catch((err) => console.error('Email Error:', err));

    return NextResponse.json({ success: true, review });
  } catch (error: any) {
    console.error('Review Create Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
