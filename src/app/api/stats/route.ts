import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const stats = await prisma.stat.findUnique({
      where: { id: 'current' }
    });
    return NextResponse.json(stats || { stat1: "0", stat2: "0", stat3: "0", stat4: "0" });
  } catch (error) {
    return NextResponse.json({ stat1: "0", stat2: "0", stat3: "0", stat4: "0" });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await prisma.stat.upsert({
      where: { id: 'current' },
      update: {
        stat1: body.stat1,
        stat2: body.stat2,
        stat3: body.stat3,
        stat4: body.stat4,
      },
      create: {
        id: 'current',
        stat1: body.stat1,
        stat2: body.stat2,
        stat3: body.stat3,
        stat4: body.stat4,
      }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
