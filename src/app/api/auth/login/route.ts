import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    const user = await prisma.user.findFirst({
      where: {
        email,
        password // In a real app, use bcrypt to compare hashes
      }
    });

    if (user) {
      return NextResponse.json({ 
        success: true, 
        token: "simulated-jwt-token-" + Date.now(),
        user: { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role }
      });
    } else {
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
