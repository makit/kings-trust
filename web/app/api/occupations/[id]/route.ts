import { NextRequest, NextResponse } from 'next/server';
import { getOccupationById, getSkillsForOccupation, parseAltLabels } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const occupation = getOccupationById(params.id);
    
    if (!occupation) {
      return NextResponse.json(
        { error: 'Occupation not found' },
        { status: 404 }
      );
    }
    
    const skills = getSkillsForOccupation(params.id);
    
    return NextResponse.json({
      ...occupation,
      alt_labels: parseAltLabels(occupation.alt_labels),
      skills,
    });
  } catch (error) {
    console.error('Error fetching occupation:', error);
    return NextResponse.json(
      { error: 'Failed to fetch occupation' },
      { status: 500 }
    );
  }
}
