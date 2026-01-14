/**
 * Quiz Results Service
 * 
 * Centralizes quiz results calculation and formatting logic.
 * This service provides a clean interface for generating quiz results
 * that can easily be swapped between local computation and API calls.
 * 
 * @module quiz-results-service
 */

import { 
  getQuizSession, 
  getResponsesForSession,
  QuizSession,
  IdentifiedSkill
} from './quiz-db';
import { 
  suggestOccupationsFromSkills, 
  generatePersonalizedInsights 
} from './bedrock';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Skill identified from quiz responses
 */
export interface QuizSkill {
  skillId: string;
  skillLabel: string;
  confidence: number;
  proficiencyLevel?: string;
}

/**
 * Occupation match with reasoning
 */
export interface OccupationMatch {
  occupation: {
    id: string;
    preferredLabel: string;
    description?: string;
    conceptUri: string;
  };
  matchScore: number;
  reasoning?: string;
}

/**
 * Cluster analysis result
 */
export interface ClusterInfo {
  id: string;
  name: string;
  description: string;
  probability: number;
}

/**
 * AI-generated insights about user's profile
 */
export interface AIInsights {
  executiveSummary: string;
  keyStrengths: string[];
  growthOpportunities: string[];
  careerRecommendations: string;
  learningPath: string[];
  encouragement: string;
}

/**
 * User profile context
 */
export interface UserProfile {
  currentSituation?: string;
  primaryGoal?: string;
  interests?: string[];
  strengths?: string;
  dateOfBirth?: string;
  location?: string;
}

/**
 * Complete quiz results
 */
export interface QuizResults {
  sessionId: string;
  
  // Skills identified from quiz
  identifiedSkills: QuizSkill[];
  
  // Top occupation matches
  topOccupations: OccupationMatch[];
  
  // Cluster analysis (career personality type)
  clusterAnalysis: {
    topClusters: ClusterInfo[];
    description: string;
  };
  
  // AI-generated insights (optional, may be null if LLM unavailable)
  aiInsights: AIInsights | null;
  
  // User profile information
  userProfile: UserProfile;
  
  // Statistics
  stats: {
    questionsAnswered: number;
    totalSkillsIdentified: number;
    highConfidenceSkills: number;
  };
  
  // Debug information (optional, for development)
  debugInfo?: {
    dob: string;
    location: string;
    topClusters: ClusterInfo[];
    totalSkills: number;
    highConfidenceSkills: number;
  };
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Generate complete quiz results for a session
 * 
 * This is the main entry point for quiz results generation.
 * It orchestrates all steps: fetching session data, matching occupations,
 * generating AI insights, and formatting the final result.
 * 
 * @param sessionId - The quiz session ID
 * @param options - Optional configuration
 * @param options.includeDebug - Whether to include debug information
 * @param options.maxOccupations - Maximum number of occupations to return (default: 10)
 * @param options.minConfidence - Minimum skill confidence threshold (default: 60)
 * @returns Complete quiz results or null if session not found
 * 
 * @example
 * const results = await generateQuizResults('session-123', {
 *   includeDebug: false,
 *   maxOccupations: 10,
 *   minConfidence: 60
 * });
 */
export async function generateQuizResults(
  sessionId: string,
  options: {
    includeDebug?: boolean;
    maxOccupations?: number;
    minConfidence?: number;
  } = {}
): Promise<QuizResults | null> {
  const {
    includeDebug = false,
    maxOccupations = 10,
    minConfidence = 60
  } = options;
  
  // 1. Fetch session data
  const session = await getQuizSession(sessionId);
  if (!session) {
    return null;
  }
  
  if (session.status !== 'completed') {
    throw new Error('Quiz not completed yet');
  }
  
  // 2. Parse stored data
  const clusterProbabilities = session.cluster_probabilities 
    ? JSON.parse(session.cluster_probabilities) 
    : {};
  
  // 3. Extract high-confidence skills
  const highConfidenceSkills = session.identified_skills
    .filter(s => s.confidence >= minConfidence);
  
  // 4. Get occupation matches
  const occupationMatches = await getOccupationMatches(
    session.identified_skills,
    {
      currentSituation: session.current_situation,
      primaryGoal: session.primary_goal,
      interests: session.interest_categories,
      dateOfBirth: session.date_of_birth,
      location: session.location
    }
  );
  
  // 5. Generate AI insights (if available)
  const aiInsights = await generateAIInsights(
    session.identified_skills,
    occupationMatches.slice(0, 5),
    {
      currentSituation: session.current_situation || 'Not specified',
      primaryGoal: session.primary_goal || 'Explore career options',
      interests: session.interest_categories || []
    }
  );
  
  // 6. Format cluster analysis
  const topClusters = formatClusterAnalysis(clusterProbabilities);
  
  // 7. Build final result
  const results: QuizResults = {
    sessionId: session.session_id,
    
    identifiedSkills: session.identified_skills.map(s => ({
      skillId: s.skillId,
      skillLabel: s.skillLabel,
      confidence: s.confidence,
      proficiencyLevel: s.proficiencyLevel
    })),
    
    topOccupations: occupationMatches.slice(0, maxOccupations).map(match => ({
      occupation: {
        id: match.occupation.preferredLabel.toLowerCase().replace(/\s+/g, '-'),
        preferredLabel: match.occupation.preferredLabel,
        description: match.occupation.description,
        conceptUri: `esco:occupation:${match.occupation.preferredLabel.toLowerCase().replace(/\s+/g, '-')}`
      },
      matchScore: match.matchScore,
      reasoning: match.reasoning
    })),
    
    clusterAnalysis: {
      topClusters,
      description: topClusters.length > 0 
        ? `Based on your answers, you're most aligned with ${topClusters[0].name} (${topClusters[0].probability}% match).`
        : 'Analyzing your profile...'
    },
    
    aiInsights,
    
    userProfile: {
      currentSituation: session.current_situation,
      primaryGoal: session.primary_goal,
      interests: session.interest_categories,
      strengths: session.strengths_text,
      dateOfBirth: session.date_of_birth,
      location: session.location
    },
    
    stats: {
      questionsAnswered: session.questions_answered,
      totalSkillsIdentified: session.identified_skills.length,
      highConfidenceSkills: highConfidenceSkills.length
    }
  };
  
  // Add debug info if requested
  if (includeDebug) {
    results.debugInfo = {
      dob: session.date_of_birth || 'Not provided',
      location: session.location || 'Not provided',
      topClusters,
      totalSkills: session.identified_skills.length,
      highConfidenceSkills: highConfidenceSkills.length
    };
  }
  
  return results;
}

/**
 * Get occupation matches based on identified skills
 * 
 * Uses LLM to suggest occupations that match the user's skill profile.
 * Falls back to generic suggestions if LLM is unavailable.
 * 
 * @param skills - List of identified skills with confidence scores
 * @param userContext - User profile information for context
 * @returns Array of occupation matches with scores and reasoning
 */
async function getOccupationMatches(
  skills: IdentifiedSkill[],
  userContext: {
    currentSituation?: string;
    primaryGoal?: string;
    interests?: string[];
    dateOfBirth?: string;
    location?: string;
  }
): Promise<Array<{
  occupation: { preferredLabel: string; description?: string };
  matchScore: number;
  reasoning?: string;
}>> {
  try {
    console.log('[Results] Requesting occupation suggestions from LLM...');
    const matches = await suggestOccupationsFromSkills(
      skills.map(s => ({
        skillLabel: s.skillLabel,
        confidence: s.confidence
      })),
      userContext
    );
    console.log('[Results] LLM suggested', matches.length, 'occupations');
    return matches;
  } catch (error) {
    console.error('[Results] Failed to get LLM occupation suggestions:', error);
    
    // Fallback to generic occupations if LLM fails
    return getFallbackOccupations();
  }
}

/**
 * Generate AI-powered personalized insights
 * 
 * Creates executive summary, strengths analysis, and recommendations.
 * Returns null if AWS Bedrock is not configured or fails.
 * 
 * @param skills - Identified skills with confidence scores
 * @param topOccupations - Top matching occupations
 * @param userContext - User profile for personalization
 * @returns AI insights or null if unavailable
 */
async function generateAIInsights(
  skills: IdentifiedSkill[],
  topOccupations: Array<{
    occupation: { preferredLabel: string };
    matchScore: number;
  }>,
  userContext: {
    currentSituation: string;
    primaryGoal: string;
    interests: string[];
  }
): Promise<AIInsights | null> {
  try {
    // Only generate insights if AWS credentials are configured
    if (!process.env.AWS_ACCESS_KEY_ID) {
      console.log('[Results] AWS Bedrock not configured, skipping AI insights');
      return null;
    }
    
    return await generatePersonalizedInsights(
      skills.map(s => ({
        skillLabel: s.skillLabel,
        confidence: s.confidence,
        proficiencyLevel: s.proficiencyLevel || 'intermediate'
      })),
      topOccupations.map(o => ({
        label: o.occupation.preferredLabel,
        matchScore: o.matchScore
      })),
      userContext
    );
  } catch (error) {
    console.warn('[Results] Failed to generate AI insights:', error);
    return null;
  }
}

/**
 * Format cluster probabilities into top clusters
 * 
 * Extracts and sorts cluster information from the Bayesian engine output.
 * 
 * @param clusterProbabilities - Raw cluster probability data from session
 * @returns Sorted array of top 3 clusters
 */
function formatClusterAnalysis(clusterProbabilities: any): ClusterInfo[] {
  const clusterItems = clusterProbabilities.items || clusterProbabilities.topK || [];
  
  return clusterItems
    .map((cluster: any) => ({
      id: cluster.id,
      name: cluster.name,
      description: cluster.description || '',
      probability: Math.round((cluster.probability || 0) * 100)
    }))
    .sort((a: any, b: any) => b.probability - a.probability)
    .slice(0, 3);
}

/**
 * Get fallback occupation suggestions
 * 
 * Provides generic occupation matches when LLM is unavailable.
 * These are broad entry-level positions suitable for most skill profiles.
 * 
 * @returns Array of fallback occupations
 */
function getFallbackOccupations() {
  return [
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
    },
    {
      occupation: {
        preferredLabel: 'receptionist',
        description: 'Greet visitors and manage front desk operations'
      },
      matchScore: 63,
      reasoning: 'Your communication skills suit this role'
    },
    {
      occupation: {
        preferredLabel: 'warehouse worker',
        description: 'Handle inventory and logistics operations'
      },
      matchScore: 60,
      reasoning: 'Entry-level role with growth opportunities'
    }
  ];
}
