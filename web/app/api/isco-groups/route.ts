import { NextResponse } from 'next/server';
import { getAllISCOGroups } from '@/lib/database';

export async function GET() {
  try {
    const groups = getAllISCOGroups();
    
    return NextResponse.json({
      groups,
      total: 0,
    });
  } catch (error) {
    console.error('Error fetching ISCO groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ISCO groups' },
      { status: 500 }
    );
  }
}
