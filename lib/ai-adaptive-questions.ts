/**
 * AI-Powered Adaptive Questions
 * Uses Bedrock to generate natural language scenario questions
 * that adapt to the user's profile and top skill predictions
 */

import { generateAdaptiveQuestion, analyzeScenarioResponse } from './bedrock';
import { getSkillOrGroupByCodeOrId } from './database';
import { AdaptiveQuestion, BayesianQuizState } from './bayesian-quiz-engine';
import { IdentifiedSkill } from './quiz-db';

/**
 * Generate an AI-powered scenario question for a target skill
 */
export async function generateAIScenarioQuestion(
  targetSkillId: string,
  userProfile: {
    dob?: string;
    location?: string;
    responses?: Record<string, any>;
  },
  questionNumber: number
): Promise<AdaptiveQuestion | null> {
  try {
    // Get skill details from database
    const skillData = await getSkillOrGroupByCodeOrId(targetSkillId);
    if (!skillData) {
      console.warn(`[AI Questions] Skill not found: ${targetSkillId}`);
      return null;
    }

    // Prepare user context
    const age = userProfile.dob ? calculateAge(userProfile.dob) : 18;
    const situation = age < 18 ? 'secondary school student' : 
                     age < 20 ? 'college student or early career' :
                     'young professional';

    // Generate AI question
    const aiQuestion = await generateAdaptiveQuestion(
      {
        id: targetSkillId,
        label: skillData.preferred_label,
        description: skillData.preferred_label // Could fetch full description if available
      },
      {
        currentSituation: situation,
        interests: [], // Could extract from previous responses
        experienceText: userProfile.location || 'UK-based'
      }
    );

    // Convert to AdaptiveQuestion format
    const adaptiveQuestion: AdaptiveQuestion = {
      question_id: `ai_scenario_${questionNumber}_${targetSkillId}`,
      type: 'scenario',
      text: aiQuestion.questionText,
      description: aiQuestion.scenarioContext,
      options: [
        {
          value: 'free_text',
          label: 'Type your response...',
          skillLikelihoods: {
            [targetSkillId]: 0.8 // Will be refined by AI analysis
          }
        }
      ],
      targetSkills: [targetSkillId],
      expectedInformationGain: 1.5, // High information gain from open-ended responses
      difficulty: 3,
      // Store AI metadata for analysis
      metadata: {
        suggestedApproaches: aiQuestion.suggestedApproaches,
        skillIndicators: aiQuestion.skillIndicators,
        targetSkill: skillData.preferred_label
      }
    };

    return adaptiveQuestion;

  } catch (error) {
    console.error('[AI Questions] Error generating question:', error);
    return null;
  }
}

/**
 * Analyze free-text response using AI
 */
export async function analyzeAIResponse(
  question: AdaptiveQuestion,
  userResponse: string,
  targetSkills: string[]
): Promise<IdentifiedSkill[]> {
  try {
    console.log('[AI Analysis] Starting analysis for', targetSkills.length, 'target skills');
    console.log('[AI Analysis] Target skills:', targetSkills);
    
    // Get skill details from database
    const skillsData = await Promise.all(
      targetSkills.map(async skillId => {
        const data = await getSkillOrGroupByCodeOrId(skillId);
        console.log('[AI Analysis] Skill lookup for', skillId, ':', data ? 'FOUND' : 'NOT FOUND');
        return data ? {
          id: skillId,
          label: data.preferred_label,
          description: data.preferred_label
        } : null;
      })
    );

    const validSkills = skillsData.filter(s => s !== null) as Array<{
      id: string;
      label: string;
      description: string;
    }>;

    console.log('[AI Analysis] Valid skills after lookup:', validSkills.length);
    
    // Even if we don't have target skills, let the AI analyze the response
    // and find ANY relevant skills - this makes it more open-ended and useful
    if (validSkills.length === 0) {
      console.log('[AI Analysis] No target skills found - doing open-ended analysis');
    }

    console.log('[AI Analysis] Calling Bedrock analyzeScenarioResponse...');
    // Analyze response with AI (pass empty array if no target skills)
    const analysis = await analyzeScenarioResponse(
      question.text + '\n\n' + (question.description || ''),
      userResponse,
      validSkills.length > 0 ? validSkills : [{
        id: 'general',
        label: 'Problem Solving',
        description: 'Ability to analyze situations and find solutions'
      }], // Use a generic skill if none specified
      question.metadata?.skillIndicators
    );
    
    console.log('[AI Analysis] Bedrock returned:', analysis.identifiedSkills.length, 'identified skills,', analysis.additionalSkills?.length || 0, 'additional skills');

    // Convert AI results to IdentifiedSkill format
    const identifiedSkills: IdentifiedSkill[] = [];

    // Process directly identified skills
    for (const skill of analysis.identifiedSkills) {
      // Try to find in database if it's a generic skill
      if (skill.skillId === 'general') {
        const dbSkill = await findSkillByLabel(skill.skillLabel);
        if (dbSkill) {
          identifiedSkills.push({
            skillId: dbSkill.id,
            skillLabel: dbSkill.preferred_label,
            confidence: skill.confidence,
            evidence: [question.question_id],
            source: 'ai-analysis',
            proficiencyLevel: skill.proficiencyLevel
          });
        } else {
          console.log('[AI Analysis] Could not find skill in DB:', skill.skillLabel);
        }
      } else {
        identifiedSkills.push({
          skillId: skill.skillId,
          skillLabel: skill.skillLabel,
          confidence: skill.confidence,
          evidence: [question.question_id],
          source: 'ai-analysis',
          proficiencyLevel: skill.proficiencyLevel
        });
      }
    }

    // Also add additional skills detected by AI (more important now!)
    console.log('[AI Analysis] Processing', analysis.additionalSkills?.length || 0, 'additional skills');
    for (const skill of analysis.additionalSkills || []) {
      // Try to find matching skill in database
      const skillData = await findSkillByLabel(skill.skillLabel);
      if (skillData) {
        console.log('[AI Analysis] Matched additional skill to DB:', skill.skillLabel, '->', skillData.id);
        identifiedSkills.push({
          skillId: skillData.id,
          skillLabel: skillData.preferred_label,
          confidence: skill.confidence,
          evidence: [question.question_id],
          source: 'ai-inferred',
          proficiencyLevel: 'intermediate'
        });
      } else {
        console.log('[AI Analysis] Could not match additional skill:', skill.skillLabel);
      }
    }
    
    console.log('[AI Analysis] Final identified skills:', identifiedSkills.length);
    return identifiedSkills;

  } catch (error) {
    console.error('[AI Analysis] Error analyzing response:', error);
    console.error('[AI Analysis] Error details:', error instanceof Error ? error.message : String(error));
    return [];
  }
}

/**
 * Determine if we should inject an AI scenario question
 * Mix them in with regular questions for variety
 */
export function shouldInjectAIQuestion(
  bayesianState: BayesianQuizState,
  questionsAsked: number
): boolean {
  // Only in Stage 2
  if (bayesianState.stage !== 2) return false;

  // Don't do AI questions if Bedrock not configured (check for non-empty values)
  if (!process.env.AWS_ACCESS_KEY_ID || process.env.AWS_ACCESS_KEY_ID.length < 10) {
    console.log('[AI Questions] AWS credentials not configured - skipping AI questions');
    return false;
  }

  // Inject every 4-5 questions
  const aiQuestionsSoFar = bayesianState.questionsAsked.filter(
    q => q.startsWith('ai_scenario_')
  ).length;

  // Maximum 3 AI questions per quiz
  if (aiQuestionsSoFar >= 3) return false;

  // Inject at questions 3, 7, 11
  const injectAt = [3, 7, 11];
  return injectAt.includes(questionsAsked);
}

/**
 * Select which skill to probe with AI question
 * Choose from top uncertain skills
 */
export async function selectSkillForAIQuestion(
  bayesianState: BayesianQuizState
): Promise<string | null> {
  // Get skills from top clusters with moderate probability (20-60%)
  // These are the ones we're uncertain about
  const uncertainClusters = bayesianState.clusterDistribution.items.filter(
    c => c.probability > 0.15 && c.probability < 0.6
  );

  if (uncertainClusters.length === 0) {
    return null;
  }

  // Pick a random skill from uncertain clusters
  const randomCluster = uncertainClusters[
    Math.floor(Math.random() * uncertainClusters.length)
  ];

  if (randomCluster.coreSkills.length === 0) {
    return null;
  }

  const randomSkill = randomCluster.coreSkills[
    Math.floor(Math.random() * randomCluster.coreSkills.length)
  ];

  return randomSkill;
}

// Helper functions
function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

async function findSkillByLabel(label: string): Promise<{ id: string; preferred_label: string } | null> {
  try {
    const { getDatabase } = await import('./database');
    const db = await getDatabase();
    
    // Try exact match first
    let skill = await db.get(
      'SELECT id, preferred_label FROM skills WHERE preferred_label = ? LIMIT 1',
      label
    );

    // If not found, try fuzzy match
    if (!skill) {
      skill = await db.get(
        'SELECT id, preferred_label FROM skills WHERE preferred_label LIKE ? LIMIT 1',
        `%${label}%`
      );
    }

    return skill || null;
  } catch (error) {
    console.error('[AI Questions] Error finding skill by label:', error);
    return null;
  }
}
