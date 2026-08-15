import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'analytics.json');

export async function GET() {
  try {
    const fileContent = await fs.readFile(dataFilePath, 'utf-8');
    return NextResponse.json(JSON.parse(fileContent));
  } catch (error) {
    return NextResponse.json({ totalVisits: 0, uniqueVisitors: 0 });
  }
}

export async function POST() {
  try {
    let stats = { totalVisits: 0, uniqueVisitors: 0 };
    try {
      const fileContent = await fs.readFile(dataFilePath, 'utf-8');
      stats = JSON.parse(fileContent);
    } catch (e) {}

    stats.totalVisits += 1;
    // For now, we'll just increment uniqueVisitors as a placeholder for a new session
    // In a real app, you'd check cookies or IP
    stats.uniqueVisitors += 1; 

    await fs.writeFile(dataFilePath, JSON.stringify(stats, null, 2), 'utf-8');
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
