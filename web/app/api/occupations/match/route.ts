import { NextRequest, NextResponse } from 'next/server';
import { matchOccupationsToSkills } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { skillIds } = body;
    
    if (!skillIds || !Array.isArray(skillIds) || skillIds.length === 0) {
      return NextResponse.json(
        { error: 'skillIds array is required' },
        { status: 400 }
      );
    }
    
    const matches = matchOccupationsToSkills(skillIds);
    
    return NextResponse.json({
      matches,
      totalMatches: (await matches).length,
      skillCount: skillIds.length,
    });
  } catch (error) {
    console.error('Error matching occupations:', error);
    return NextResponse.json(
      { error: 'Failed to match occupations' },
      { status: 500 }
    );
  }
}
