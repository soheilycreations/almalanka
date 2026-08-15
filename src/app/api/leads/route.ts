import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendLeadNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { timestamp: 'desc' }
    });
    return NextResponse.json(leads);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newLead = await prisma.lead.create({
      data: {
        name: body.name || body.customerName || `${body.firstName} ${body.lastName}`,
        email: body.email,
        interest: body.interest || body.tourName || "General Inquiry",
        message: body.message || body.specialRequest || ""
      }
    });
    
    // Send email notification (non-blocking)
    sendLeadNotification(newLead).catch(err => console.error("Email Error:", err));
    
    return NextResponse.json({ success: true, lead: newLead });

  } catch (error: any) {
    console.error("Lead Create Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
