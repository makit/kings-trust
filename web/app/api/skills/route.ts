import { NextRequest, NextResponse } from 'next/server';
import { getAllSkills } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    const filters: any = {};
    
    if (searchParams.get('skillType')) {
      filters.skillType = searchParams.get('skillType');
    }
    
    if (searchParams.get('reuseLevel')) {
      filters.reuseLevel = searchParams.get('reuseLevel');
    }
    
    if (searchParams.get('search')) {
      filters.search = searchParams.get('search');
    }
    
    const { skills, total } = await getAllSkills(limit, offset, filters);
    
    return NextResponse.json({
      skills,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching skills:', error);
    return NextResponse.json(
      { error: 'Failed to fetch skills' },
      { status: 500 }
    );
  }
}
