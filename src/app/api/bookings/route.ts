import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sendBookingNotification } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const bookings = await prisma.booking.findMany({
      orderBy: { date: 'asc' }
    });
    
    // Parse JSON strings back to arrays for frontend
    const parsedBookings = bookings.map(b => ({
      ...b,
      customLocations: b.customLocations ? JSON.parse(b.customLocations) : [],
      customActivities: b.customActivities ? JSON.parse(b.customActivities) : []
    }));

    return NextResponse.json(parsedBookings);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newBooking = await prisma.booking.create({
      data: {
        customerName: body.customerName,
        email: body.email,
        phone: body.phone,
        country: body.country,
        tourName: body.tourName,
        date: body.date,
        endDate: body.departureDate || body.endDate, // support both field names
        status: body.status || "pending",
        adults: Number(body.adults) || Number(body.participants) || 1,
        children: Number(body.children) || 0,
        participants: (Number(body.adults) || Number(body.participants) || 1) + (Number(body.children) || 0),
        slot: body.slot,
        customLocations: body.customLocations ? JSON.stringify(body.customLocations) : null,
        customActivities: body.customActivities ? JSON.stringify(body.customActivities) : null,
        notes: body.specialRequest || body.notes
      }
    });

    // Send email notification (non-blocking)
    sendBookingNotification(newBooking).catch(err => console.error("Email Error:", err));

    return NextResponse.json({ success: true, booking: newBooking });

  } catch (error: any) {
    console.error("Booking Create Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    // Handle JSON fields if they exist in update
    const updateData: any = { ...data };
    if (data.customLocations) updateData.customLocations = JSON.stringify(data.customLocations);
    if (data.customActivities) updateData.customActivities = JSON.stringify(data.customActivities);

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: updateData
    });

    // Send email notification (non-blocking)
    sendBookingNotification(updatedBooking).catch(err => console.error("Email Error:", err));

    return NextResponse.json({ success: true, booking: updatedBooking });
  } catch (error: any) {
    console.error("Booking Update Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false }, { status: 400 });

    await prisma.booking.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
