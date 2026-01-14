import { NextRequest, NextResponse } from 'next/server';
import { getSkillById, getOccupationsForSkill, parseAltLabels } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const skill = await getSkillById(params.id);
    
    if (!skill) {
      return NextResponse.json(
        { error: 'Skill not found' },
        { status: 404 }
      );
    }
    
    const occupations = await getOccupationsForSkill(params.id);
    
    return NextResponse.json({
      ...skill,
      alt_labels: parseAltLabels(skill.alt_labels),
      occupations,
    });
  } catch (error) {
    console.error('Error fetching skill:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skill' },
      { status: 500 }
    );
  }
}
