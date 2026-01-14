/**
 * GET /api/quiz/results/[sessionId]
 * Get quiz results and recommendations
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getQuizSession, 
  getResponsesForSession 
} from '@/lib/quiz-db';
import { suggestOccupationsFromSkills, generatePersonalizedInsights } from '@/lib/bedrock';

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
    
    // Parse cluster probabilities and Bayesian state
    const clusterProbabilities = session.cluster_probabilities 
      ? JSON.parse(session.cluster_probabilities) 
      : {};
    const bayesianState = session.bayesian_state 
      ? JSON.parse(session.bayesian_state) 
      : null;
    
    // Log debug info
    console.log('\n========== QUIZ RESULTS DEBUG ==========');
    console.log('Session ID:', sessionId);
    console.log('DOB:', session.date_of_birth || 'Not provided');
    console.log('Location:', session.location || 'Not provided');
    console.log('Questions Answered:', session.questions_answered);
    console.log('\nCluster Probabilities:', clusterProbabilities);
    console.log('\nIdentified Skills:', session.identified_skills.map(s => ({
      skillId: s.skillId,
      skillLabel: s.skillLabel,
      confidence: s.confidence
    })));
    console.log('======================================\n');
    
    // Extract skill IDs from identified skills
    const skillIds = session.identified_skills
      .filter(s => s.confidence >= 60)
      .map(s => s.skillId);
    
    // Get occupation suggestions from LLM based on skills
    let occupationMatches = [];
    try {
      console.log('[Results] Requesting occupation suggestions from LLM...');
      occupationMatches = await suggestOccupationsFromSkills(
        session.identified_skills.map(s => ({
          skillLabel: s.skillLabel,
          confidence: s.confidence
        })),
        {
          currentSituation: session.current_situation,
          primaryGoal: session.primary_goal,
          interests: session.interest_categories,
          dateOfBirth: session.date_of_birth,
          location: session.location
        }
      );
      console.log('[Results] LLM suggested', occupationMatches.length, 'occupations');
    } catch (error) {
      console.error('[Results] Failed to get LLM occupation suggestions:', error);
      // Provide fallback occupations if LLM fails
      occupationMatches = [
        {
          occupation: {
            preferredLabel: 'customer service representative',
            description: 'Assist customers with inquiries and provide support'
          },
          matchScore: 70,
          reasoning: 'Based on your communication and interpersonal skills'
        },
        {
          occupation: {
            preferredLabel: 'shop assistant',
            description: 'Help customers in retail environments'
          },
          matchScore: 68,
          reasoning: 'Your people skills and adaptability are valuable here'
        },
        {
          occupation: {
            preferredLabel: 'administrative assistant',
            description: 'Provide administrative and organizational support'
          },
          matchScore: 65,
          reasoning: 'Your organizational abilities are a good fit'
        }
      ];
    }
    
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
            label: o.occupation.preferredLabel,
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
    
    // Format top clusters for display
    // clusterProbabilities is an object with 'items', 'entropy', 'topK' properties
    const clusterItems = clusterProbabilities.items || clusterProbabilities.topK || [];
    const topClusters = clusterItems
      .map((cluster: any) => ({
        id: cluster.id,
        name: cluster.name,
        description: cluster.description,
        probability: Math.round((cluster.probability || 0) * 100)
      }))
      .sort((a: any, b: any) => b.probability - a.probability)
      .slice(0, 3);
    
    // Build result object
    const result = {
      sessionId: session.session_id,
      
      // Debug Info (for display at top of results page)
      debugInfo: {
        dob: session.date_of_birth || 'Not provided',
        location: session.location || 'Not provided',
        topClusters,
        totalSkills: session.identified_skills.length,
        highConfidenceSkills: session.identified_skills.filter(s => s.confidence >= 60).length
      },
      
      // Cluster Analysis
      clusterAnalysis: {
        topClusters,
        description: topClusters.length > 0 
          ? `Based on your answers, you're most aligned with ${topClusters[0].name} (${topClusters[0].probability}% match).`
          : 'Analyzing your profile...'
      },
      
      // Skills Profile
      identifiedSkills: session.identified_skills,
      skillsByCategory: categorizeSkills(session.identified_skills),
      
      // Occupation Matches (transform to match frontend interface)
      topOccupations: occupationMatches.slice(0, 10).map(match => ({
        occupation: {
          id: match.occupation.preferredLabel.toLowerCase().replace(/\s+/g, '-'),
          preferredLabel: match.occupation.preferredLabel,
          description: match.occupation.description,
          conceptUri: `esco:occupation:${match.occupation.preferredLabel.toLowerCase().replace(/\s+/g, '-')}`
        },
        matchScore: match.matchScore,
        reasoning: match.reasoning
      })),
      
      // AI Insights (if available)
      aiInsights,
      
      // User Profile
      userProfile: {
        currentSituation: session.current_situation,
        interests: session.interest_categories,
        primaryGoal: session.primary_goal,
        strengths: session.strengths_text,
        dateOfBirth: session.date_of_birth,
        location: session.location
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
