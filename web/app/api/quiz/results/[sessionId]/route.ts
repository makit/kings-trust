/**
 * GET /api/quiz/results/[sessionId]
 * Get quiz results and recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateQuizResults } from '@/lib/quiz-results-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    
    // Generate complete quiz results using the service
    const results = await generateQuizResults(sessionId, {
      includeDebug: process.env.NODE_ENV === 'development',
      maxOccupations: 10,
      minConfidence: 60
    });
    
    if (!results) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Log summary for debugging
    console.log(`[Results] Generated results for session ${sessionId}:`);
    console.log(`  - Skills identified: ${results.stats.totalSkillsIdentified}`);
    console.log(`  - Occupations matched: ${results.topOccupations.length}`);
    console.log(`  - AI insights: ${results.aiInsights ? 'Yes' : 'No'}`);
    
    return NextResponse.json(results);
  } catch (error: any) {
    console.error('[Results] Error generating results:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate results' },
      { status: 500 }
    );
  }
}
