/**
 * Adaptive Quiz Controller
 * 
 * Orchestrates the two-stage Bayesian quiz:
 * - Stage 1: Broad orientation questions
 * - Stage 2: Adaptive skill confirmation with information gain
 */

import {
  BayesianQuizState,
  UserCluster,
  AdaptiveQuestion,
  initializeBayesianState,
  updatePosterior,
  selectNextQuestion,
  shouldEndStage2,
  generateSkillDistribution,
  getCandidateOccupations
} from './bayesian-quiz-engine';
import { getStage1Questions, isStage1Complete } from './quiz-stage1-questions';
import { getStage2QuestionBank, filterQuestionsByDifficulty } from './quiz-stage2-questions';
import { QuizSession, IdentifiedSkill } from './quiz-db';
import { Occupation } from './database';

// ============================================================================
// Quiz Controller Functions
// ============================================================================

/**
 * Get the next question based on current quiz state
 */
export async function getNextAdaptiveQuestion(
  session: QuizSession,
  bayesianState: BayesianQuizState | null
): Promise<AdaptiveQuestion | null> {
  // Initialize Bayesian state if needed
  if (!bayesianState) {
    bayesianState = initializeBayesianState(session.session_id);
  }
  
  // Stage 1: Orientation questions
  if (bayesianState.stage === 1 || !bayesianState.stage1Complete) {
    const stage1Questions = getStage1Questions();
    const askedQuestions = bayesianState.questionsAsked || [];
    
    // Find next unanswered Stage 1 question
    const nextQuestion = stage1Questions.find(
      q => !askedQuestions.includes(q.question_id)
    );
    
    if (nextQuestion) {
      return nextQuestion;
    }
    
    // Stage 1 complete - prepare for Stage 2
    return null; // Trigger stage transition
  }
  
  // Stage 2: Adaptive skill confirmation
  if (bayesianState.stage === 2) {
    // Check if we should end Stage 2
    if (shouldEndStage2(bayesianState)) {
      return null; // Quiz complete
    }
    
    // Get question bank
    const allStage2Questions = getStage2QuestionBank();
    
    // Filter by difficulty based on progress (start easy, increase difficulty)
    const progress = bayesianState.questionsAsked.length;
    let candidateQuestions = allStage2Questions;
    
    if (progress < 3) {
      // First few questions: easy (difficulty 1-2)
      candidateQuestions = filterQuestionsByDifficulty(allStage2Questions, 1, 2);
    } else if (progress < 6) {
      // Middle questions: medium (difficulty 2-3)
      candidateQuestions = filterQuestionsByDifficulty(allStage2Questions, 2, 3);
    }
    // Later questions: use all difficulties
    
    // Select question with maximum information gain
    const nextQuestion = selectNextQuestion(bayesianState, candidateQuestions);
    
    return nextQuestion;
  }
  
  return null;
}

/**
 * Process answer and update Bayesian state
 */
export function processAdaptiveAnswer(
  bayesianState: BayesianQuizState,
  question: AdaptiveQuestion,
  answer: string | string[]
): BayesianQuizState {
  // Update cluster distribution based on answer
  const updatedClusterDistribution = updatePosterior(
    bayesianState.clusterDistribution,
    question,
    answer
  );
  
  // Update state
  const updatedState: BayesianQuizState = {
    ...bayesianState,
    clusterDistribution: updatedClusterDistribution,
    questionsAsked: [...bayesianState.questionsAsked, question.question_id]
  };
  
  // Store answer for Stage 1
  if (updatedState.stage === 1) {
    updatedState.stage1Responses[question.question_id] = answer;
  }
  
  return updatedState;
}

/**
 * Check if Stage 1 is complete and prepare for Stage 2
 */
export function checkStage1Completion(
  bayesianState: BayesianQuizState
): { isComplete: boolean; updatedState?: BayesianQuizState } {
  const stage1Questions = getStage1Questions();
  const answeredCount = bayesianState.questionsAsked.filter(qid =>
    stage1Questions.some(q => q.question_id === qid)
  ).length;
  
  if (isStage1Complete(answeredCount)) {
    // Transition to Stage 2
    const updatedState: BayesianQuizState = {
      ...bayesianState,
      stage: 2,
      stage1Complete: true,
      minQuestions: 8,
      maxQuestions: 15,
      targetUncertainty: 0.5
    };
    
    return { isComplete: true, updatedState };
  }
  
  return { isComplete: false };
}

/**
 * Extract skills from cluster distribution and direct evidence
 */
export function extractSkillsFromState(
  bayesianState: BayesianQuizState,
  directSkills: IdentifiedSkill[]
): IdentifiedSkill[] {
  // Generate skill distribution
  const skillDistribution = generateSkillDistribution(
    bayesianState.clusterDistribution,
    directSkills
  );
  
  // Convert top skills to IdentifiedSkill format
  const clusterBasedSkills: IdentifiedSkill[] = skillDistribution.topK.map(skill => ({
    skillId: skill.skillId,
    skillLabel: skill.skillLabel,
    confidence: Math.round(skill.probability * 100),
    evidence: ['cluster-inference'],
    source: 'inferred' as const,
    proficiencyLevel: undefined
  }));
  
  // Merge with direct skills (direct skills take priority)
  const skillMap = new Map<string, IdentifiedSkill>();
  
  // Add cluster-based skills first
  for (const skill of clusterBasedSkills) {
    if (skill.confidence >= 30) { // Threshold for inclusion
      skillMap.set(skill.skillId, skill);
    }
  }
  
  // Override with direct skills (higher confidence)
  for (const skill of directSkills) {
    if (skillMap.has(skill.skillId)) {
      const existing = skillMap.get(skill.skillId)!;
      skillMap.set(skill.skillId, {
        ...skill,
        confidence: Math.max(existing.confidence, skill.confidence),
        evidence: [...new Set([...existing.evidence, ...skill.evidence])],
        source: 'validated' as const
      });
    } else {
      skillMap.set(skill.skillId, skill);
    }
  }
  
  return Array.from(skillMap.values())
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Get top cluster matches for user feedback
 */
export function getTopClusters(
  bayesianState: BayesianQuizState,
  count: number = 3
): UserCluster[] {
  return bayesianState.clusterDistribution.topK.slice(0, count);
}

/**
 * Serialize Bayesian state for storage
 */
export function serializeBayesianState(state: BayesianQuizState): string {
  return JSON.stringify(state);
}

/**
 * Deserialize Bayesian state from storage
 */
export function deserializeBayesianState(json: string): BayesianQuizState {
  return JSON.parse(json);
}

/**
 * Get candidate occupations based on current state
 */
export async function getCandidateOccupationsFromState(
  bayesianState: BayesianQuizState,
  allOccupations: Occupation[]
): Promise<{ occupationId: string; score: number }[]> {
  return getCandidateOccupations(bayesianState.clusterDistribution, allOccupations);
}

/**
 * Generate progress summary for user
 */
export function generateProgressSummary(
  bayesianState: BayesianQuizState
): {
  stage: 1 | 2;
  questionsAnswered: number;
  estimatedRemaining: number;
  topClusters: UserCluster[];
  entropy: number;
  confidence: number;
} {
  const questionsAnswered = bayesianState.questionsAsked.length;
  
  let estimatedRemaining = 0;
  if (bayesianState.stage === 1) {
    estimatedRemaining = Math.max(0, 6 - questionsAnswered);
  } else {
    // Estimate based on entropy
    const entropyRatio = bayesianState.clusterDistribution.entropy / 
                         Math.log2(bayesianState.clusterDistribution.items.length);
    
    if (entropyRatio > 0.5) {
      estimatedRemaining = Math.min(bayesianState.maxQuestions - questionsAnswered, 8);
    } else if (entropyRatio > 0.3) {
      estimatedRemaining = Math.min(bayesianState.maxQuestions - questionsAnswered, 4);
    } else {
      estimatedRemaining = Math.min(bayesianState.maxQuestions - questionsAnswered, 2);
    }
  }
  
  // Confidence is inverse of normalized entropy
  const maxEntropy = Math.log2(bayesianState.clusterDistribution.items.length);
  const confidence = Math.round((1 - bayesianState.clusterDistribution.entropy / maxEntropy) * 100);
  
  return {
    stage: bayesianState.stage,
    questionsAnswered,
    estimatedRemaining: Math.max(0, estimatedRemaining),
    topClusters: bayesianState.clusterDistribution.topK.slice(0, 3),
    entropy: bayesianState.clusterDistribution.entropy,
    confidence
  };
}

/**
 * Generate personalized message based on quiz progress
 */
export function generateProgressMessage(
  bayesianState: BayesianQuizState
): string {
  const summary = generateProgressSummary(bayesianState);
  
  if (summary.stage === 1) {
    const remaining = 6 - summary.questionsAnswered;
    if (remaining > 3) {
      return "Getting to know you...";
    } else {
      return "Almost done with the basics!";
    }
  } else {
    // Stage 2
    if (summary.confidence < 40) {
      return "Exploring your strengths...";
    } else if (summary.confidence < 70) {
      return "Getting clearer on your skills!";
    } else {
      return "Almost there - I think I've got you figured out! 😊";
    }
  }
}
