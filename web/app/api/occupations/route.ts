import { NextRequest, NextResponse } from 'next/server';
import { getAllOccupations } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    const filters: any = {};
    
    if (searchParams.get('occupationType')) {
      filters.occupationType = searchParams.get('occupationType');
    }
    
    if (searchParams.get('iscoGroupCode')) {
      filters.iscoGroupCode = searchParams.get('iscoGroupCode');
    }
    
    if (searchParams.get('search')) {
      filters.search = searchParams.get('search');
    }
    
    const { occupations, total } = await getAllOccupations(limit, offset, filters);
    
    return NextResponse.json({
      occupations,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching occupations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch occupations' },
      { status: 500 }
    );
  }
}
