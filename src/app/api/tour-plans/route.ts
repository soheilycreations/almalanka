import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const plans = await prisma.tourPlan.findMany();
    
    // Parse JSON strings back to arrays/objects for frontend
    const parsedPlans = plans.map(p => ({
      ...p,
      route: p.route ? JSON.parse(p.route) : [],
      activities: p.activities ? JSON.parse(p.activities) : [],
      highlights: p.highlights ? JSON.parse(p.highlights) : [],
      gallery: p.gallery ? JSON.parse(p.gallery) : [],
      itinerary: p.itinerary ? JSON.parse(p.itinerary) : []
    }));

    return NextResponse.json(parsedPlans);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newPlan = await prisma.tourPlan.create({
      data: {
        title: body.title,
        days: body.days,
        route: body.route ? JSON.stringify(body.route) : null,
        activities: body.activities ? JSON.stringify(body.activities) : null,
        price: body.price,
        image: body.image,
        type: body.type,
        feat: body.feat || false,
        overview: body.overview,
        highlights: body.highlights ? JSON.stringify(body.highlights) : null,
        difficulty: body.difficulty,
        guide: body.guide,
        gallery: body.gallery ? JSON.stringify(body.gallery) : null,
        itinerary: body.itinerary ? JSON.stringify(body.itinerary) : null
      }
    });

    return NextResponse.json({ success: true, plan: newPlan });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    const updateData: any = { ...data };
    if (data.route) updateData.route = JSON.stringify(data.route);
    if (data.activities) updateData.activities = JSON.stringify(data.activities);
    if (data.highlights) updateData.highlights = JSON.stringify(data.highlights);
    if (data.gallery) updateData.gallery = JSON.stringify(data.gallery);
    if (data.itinerary) updateData.itinerary = JSON.stringify(data.itinerary);

    await prisma.tourPlan.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false }, { status: 400 });

    await prisma.tourPlan.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
