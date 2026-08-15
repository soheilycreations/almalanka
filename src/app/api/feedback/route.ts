import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'feedback.json');

export async function GET() {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return NextResponse.json(JSON.parse(fileContent));
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let feedback = [];
    try {
      const fileContent = await fs.readFile(dataFilePath, 'utf-8');
      feedback = JSON.parse(fileContent);
    } catch (e) {}

    const newFeedback = { ...body, id: Date.now().toString() };
    feedback.push(newFeedback);
    await fs.writeFile(dataFilePath, JSON.stringify(feedback, null, 2), 'utf-8');
    return NextResponse.json({ success: true, feedback: newFeedback });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    let feedback = JSON.parse(fileContent);
    
    feedback = feedback.map((f: any) => f.id === body.id ? body : f);
    await fs.writeFile(dataFilePath, JSON.stringify(feedback, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    let feedback = JSON.parse(fileContent);
    
    feedback = feedback.filter((f: any) => f.id !== id);
    await fs.writeFile(dataFilePath, JSON.stringify(feedback, null, 2), 'utf-8');
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
