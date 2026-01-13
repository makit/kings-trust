/**
 * GET /api/quiz/results/[sessionId]
 * Get quiz results and recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getQuizSession, 
  getResponsesForSession 
} from '@/lib/quiz-db';
import { matchOccupationsToSkills } from '@/lib/database';
import { generatePersonalizedInsights } from '@/lib/bedrock';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    
    // Get session
    const session = await getQuizSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    if (session.status !== 'completed') {
      return NextResponse.json(
        { error: 'Quiz not completed yet' },
        { status: 400 }
      );
    }
    
    // Get all responses
    const responses = await getResponsesForSession(sessionId);
    
    // Extract skill IDs from identified skills
    const skillIds = session.identified_skills
      .filter(s => s.confidence >= 60)
      .map(s => s.skillId);
    
    // Match occupations
    const occupationMatches = skillIds.length > 0 
      ? await matchOccupationsToSkills(skillIds)
      : [];
    
    // Generate AI insights (if Bedrock is configured)
    let aiInsights = null;
    try {
      if (process.env.AWS_ACCESS_KEY_ID) {
        aiInsights = await generatePersonalizedInsights(
          session.identified_skills.map(s => ({
            skillLabel: s.skillLabel,
            confidence: s.confidence,
            proficiencyLevel: s.proficiencyLevel || 'intermediate'
          })),
          occupationMatches.slice(0, 5).map(o => ({
            label: o.occupation.preferred_label,
            matchScore: o.matchScore
          })),
          {
            currentSituation: session.current_situation || 'Not specified',
            primaryGoal: session.primary_goal || 'Explore career options',
            interests: session.interest_categories || []
          }
        );
      }
    } catch (error) {
      console.warn('Failed to generate AI insights:', error);
      // Continue without AI insights
    }
    
    // Build result object
    const result = {
      sessionId: session.session_id,
      
      // Skills Profile
      identifiedSkills: session.identified_skills,
      skillsByCategory: categorizeSkills(session.identified_skills),
      
      // Occupation Matches (transform to match frontend interface)
      topOccupations: occupationMatches.slice(0, 10).map(match => ({
        ...match,
        occupation: {
          id: match.occupation.id,
          preferredLabel: match.occupation.preferred_label,
          conceptUri: match.occupation.origin_uri
        }
      })),
      
      // AI Insights (if available)
      aiInsights,
      
      // User Profile
      userProfile: {
        currentSituation: session.current_situation,
        interests: session.interest_categories,
        primaryGoal: session.primary_goal,
        strengths: session.strengths_text
      },
      
      // Quiz Stats
      stats: {
        questionsAnswered: session.questions_answered,
        totalSkillsIdentified: session.identified_skills.length,
        completedAt: session.completed_at
      }
    };
    
    return NextResponse.json(result);
    
  } catch (error: any) {
    console.error('Error getting results:', error);
    return NextResponse.json(
      { error: 'Failed to get results', details: error.message },
      { status: 500 }
    );
  }
}

function categorizeSkills(skills: any[]) {
  const categories = {
    transversal: [],
    knowledge: [],
    competence: [],
    language: [],
    attitude: []
  };
  
  // This is a simplified categorization
  // In a real implementation, you'd query the skills table for skill_type
  for (const skill of skills) {
    const type = skill.skillId.includes('S') ? 'transversal' : 'knowledge';
    (categories as any)[type].push(skill);
  }
  
  return categories;
}
