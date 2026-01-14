/**
 * Bayesian Quiz Engine
 * 
 * Two-stage adaptive quiz system:
 * Stage 1: Broad orientation (6-10 questions) - quickly cluster users
 * Stage 2: Adaptive skill confirmation (8-15 questions) - maximize information gain
 * 
 * The system maintains probability distributions over:
 * - User clusters (based on preferences)
 * - Skills
 * - Occupations
 * 
 * Each answer updates the distribution, and the next question is selected
 * to maximize expected information gain.
 */

import { QuizSession, IdentifiedSkill } from './quiz-db';
import { Occupation, Skill } from './database';

// ============================================================================
// Types
// ============================================================================

/**
 * User cluster based on broad orientation
 */
export interface UserCluster {
  id: string;
  name: string;
  description: string;
  
  // Characteristic dimensions
  preference: 'people' | 'things' | 'information' | 'mixed';
  workStyle: 'structured' | 'variety' | 'mixed';
  environment: 'indoor' | 'outdoor' | 'mixed';
  collaboration: 'teamwork' | 'solo' | 'mixed';
  pace: 'detail-patient' | 'speed-action' | 'mixed';
  
  // Related ISCO groups and skills (for matching)
  iscoGroups: string[]; // ISCO codes
  coreSkills: string[]; // Skill IDs
  
  probability?: number; // Current probability for this cluster
}

/**
 * Probability distribution over items (clusters, skills, or occupations)
 */
export interface ProbabilityDistribution<T> {
  items: (T & { probability: number })[];
  entropy: number; // Measure of uncertainty
  topK: (T & { probability: number })[]; // Top K items by probability
}

/**
 * Question with information gain metadata
 */
export interface AdaptiveQuestion {
  question_id: string;
  type: 'multiple-choice' | 'multi-select' | 'scale' | 'scenario';
  text: string;
  description?: string;
  options: QuestionOption[];
  
  // Metadata for adaptive selection
  targetClusters?: string[]; // Clusters this question helps distinguish
  targetSkills?: string[]; // Skills this question validates
  targetOccupations?: string[]; // Occupations this helps narrow
  expectedInformationGain?: number; // Calculated dynamically
  difficulty?: number; // 1-5, used to pace the quiz
  
  // AI scenario question metadata
  metadata?: {
    suggestedApproaches?: string[];
    skillIndicators?: {
      strong: string[];
      moderate: string[];
      developing: string[];
    };
    targetSkill?: string;
  };
}

export interface QuestionOption {
  value: string;
  label: string;
  
  // Bayesian implications
  clusterLikelihoods?: Record<string, number>; // P(answer | cluster)
  skillLikelihoods?: Record<string, number>; // P(answer | has skill)
  occupationLikelihoods?: Record<string, number>; // P(answer | occupation fit)
}

/**
 * Quiz state for Bayesian inference
 */
export interface BayesianQuizState {
  sessionId: string;
  stage: 1 | 2; // Stage 1: orientation, Stage 2: adaptive
  
  // Stage 1 state
  stage1Complete: boolean;
  stage1Responses: Record<string, any>;
  
  // Probability distributions
  clusterDistribution: ProbabilityDistribution<UserCluster>;
  skillDistribution: ProbabilityDistribution<{ skillId: string; skillLabel: string }>;
  occupationDistribution?: ProbabilityDistribution<{ occupationId: string; occupationLabel: string }>;
  
  // Question history
  questionsAsked: string[];
  questionsRemaining: AdaptiveQuestion[];
  
  // Target metrics
  targetUncertainty: number; // Stop when entropy is below this
  minQuestions: number; // Minimum questions to ask
  maxQuestions: number; // Maximum questions to ask
}

// ============================================================================
// Predefined User Clusters
// ============================================================================

export const USER_CLUSTERS: UserCluster[] = [
  {
    id: 'helper-people',
    name: 'People Helper',
    description: 'Enjoys working with people, helping others, structured environments',
    preference: 'people',
    workStyle: 'structured',
    environment: 'indoor',
    collaboration: 'teamwork',
    pace: 'detail-patient',
    iscoGroups: ['5', '2', '3'], // Service, professionals, technicians
    coreSkills: ['key_7837', 'key_10081', 'key_7328', 'key_2045', 'key_9020'] // show empathy, listen actively, assist visitors, sell services, assist judge
  },
  {
    id: 'creative-maker',
    name: 'Creative Maker',
    description: 'Creative, hands-on, values variety and independence',
    preference: 'things',
    workStyle: 'variety',
    environment: 'mixed',
    collaboration: 'solo',
    pace: 'speed-action',
    iscoGroups: ['7', '3'], // Craft, technicians
    coreSkills: ['key_1389', 'key_2232', 'key_4101', 'key_11922', 'key_13953'] // create model, design floor, design props, build props, build trust
  },
  {
    id: 'tech-solver',
    name: 'Tech Problem Solver',
    description: 'Analytical, tech-oriented, structured problem solving',
    preference: 'information',
    workStyle: 'structured',
    environment: 'indoor',
    collaboration: 'mixed',
    pace: 'detail-patient',
    iscoGroups: ['2', '3'], // Professionals, technicians
    coreSkills: ['key_10726', 'key_2261', 'key_14533', 'key_3264', 'key_7843'] // solve problems, analyse loans, analyse issues, debug software, analyse images
  },
  {
    id: 'action-outdoor',
    name: 'Action Outdoor',
    description: 'Physical, outdoor work, fast-paced, practical',
    preference: 'things',
    workStyle: 'variety',
    environment: 'outdoor',
    collaboration: 'teamwork',
    pace: 'speed-action',
    iscoGroups: ['6', '7', '9'], // Agriculture, craft, elementary
    coreSkills: ['key_7493', 'key_3042', 'key_3453', 'key_10805', 'key_14780'] // coordinate care, coordinate events, coordinate shifts, coordinate patrols, coordinate security
  },
  {
    id: 'organizer-coordinator',
    name: 'Organizer & Coordinator',
    description: 'Detail-oriented, structured, planning and coordination',
    preference: 'information',
    workStyle: 'structured',
    environment: 'indoor',
    collaboration: 'teamwork',
    pace: 'detail-patient',
    iscoGroups: ['3', '4'], // Technicians, clerical
    coreSkills: ['key_13611', 'key_10246', 'key_6010', 'key_10012', 'key_6327'] // plan, plan events, manage work, manage data, plan menus
  },
  {
    id: 'entrepreneur-persuader',
    name: 'Entrepreneur & Persuader',
    description: 'People-oriented, persuasive, variety, fast-paced',
    preference: 'people',
    workStyle: 'variety',
    environment: 'mixed',
    collaboration: 'mixed',
    pace: 'speed-action',
    iscoGroups: ['1', '5', '3'], // Managers, service, sales
    coreSkills: ['key_2927', 'key_7738', 'key_2045', 'key_8199', 'key_3776'] // lead a team, lead others, sell services, sell art, sell tickets
  },
  {
    id: 'care-support',
    name: 'Care & Support Specialist',
    description: 'Empathetic, patient-focused, structured care environments',
    preference: 'people',
    workStyle: 'structured',
    environment: 'indoor',
    collaboration: 'teamwork',
    pace: 'detail-patient',
    iscoGroups: ['2', '5', '3'], // Health professionals, care workers
    coreSkills: ['key_7837', 'key_6655', 'key_7493', 'key_8568', 'key_4398'] // show empathy, support nurses, coordinate care, advise on career, advocate health
  },
  {
    id: 'analyst-researcher',
    name: 'Analyst & Researcher',
    description: 'Information-focused, deep analysis, independent work',
    preference: 'information',
    workStyle: 'structured',
    environment: 'indoor',
    collaboration: 'solo',
    pace: 'detail-patient',
    iscoGroups: ['2', '3'], // Professionals, technicians
    coreSkills: ['key_5921', 'key_2261', 'key_10476', 'key_7843', 'key_14533'] // study topics, analyse loans, assess others, analyse images, analyse issues
  }
];

// ============================================================================
// Bayesian Inference Functions
// ============================================================================

/**
 * Initialize Bayesian quiz state with uniform priors
 */
export function initializeBayesianState(sessionId: string): BayesianQuizState {
  // Start with uniform distribution over clusters
  const uniformProb = 1 / USER_CLUSTERS.length;
  const clusters = USER_CLUSTERS.map(cluster => ({
    ...cluster,
    probability: uniformProb
  }));
  
  return {
    sessionId,
    stage: 1,
    stage1Complete: false,
    stage1Responses: {},
    clusterDistribution: {
      items: clusters,
      entropy: calculateEntropy(clusters.map(c => c.probability)),
      topK: clusters.slice(0, 3)
    },
    skillDistribution: {
      items: [],
      entropy: 0,
      topK: []
    },
    questionsAsked: [],
    questionsRemaining: [],
    targetUncertainty: 0.5, // bits
    minQuestions: 4,
    maxQuestions: 8
  };
}

/**
 * Update probability distribution based on answer
 * Uses Bayes' theorem: P(cluster|answer) ∝ P(answer|cluster) * P(cluster)
 */
export function updatePosterior(
  priorDistribution: ProbabilityDistribution<UserCluster>,
  question: AdaptiveQuestion,
  answer: string | string[]
): ProbabilityDistribution<UserCluster> {
  const answers = Array.isArray(answer) ? answer : [answer];
  
  // Get likelihood for each cluster
  const updatedItems = priorDistribution.items.map(cluster => {
    // Calculate P(answer | cluster)
    let likelihood = 1.0;
    
    for (const ans of answers) {
      const option = question.options.find(opt => opt.value === ans);
      if (option?.clusterLikelihoods && option.clusterLikelihoods[cluster.id]) {
        likelihood *= option.clusterLikelihoods[cluster.id];
      } else {
        // No specific likelihood, assume neutral
        likelihood *= 0.5;
      }
    }
    
    // Bayes' theorem: posterior ∝ likelihood × prior
    const unnormalizedPosterior = likelihood * cluster.probability;
    
    return {
      ...cluster,
      probability: unnormalizedPosterior
    };
  });
  
  // Normalize probabilities to sum to 1
  const total = updatedItems.reduce((sum, item) => sum + item.probability, 0);
  const normalizedItems = updatedItems.map(item => ({
    ...item,
    probability: total > 0 ? item.probability / total : 1 / updatedItems.length
  }));
  
  // Sort by probability descending
  normalizedItems.sort((a, b) => b.probability - a.probability);
  
  return {
    items: normalizedItems,
    entropy: calculateEntropy(normalizedItems.map(i => i.probability)),
    topK: normalizedItems.slice(0, 5)
  };
}

/**
 * Calculate Shannon entropy of a probability distribution
 * H(X) = -Σ p(x) * log2(p(x))
 * Higher entropy = more uncertainty
 */
export function calculateEntropy(probabilities: number[]): number {
  let entropy = 0;
  for (const p of probabilities) {
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }
  return entropy;
}

/**
 * Calculate expected information gain for a question
 * Information gain = current entropy - expected entropy after answer
 */
export function calculateInformationGain(
  currentDistribution: ProbabilityDistribution<UserCluster>,
  question: AdaptiveQuestion
): number {
  const currentEntropy = currentDistribution.entropy;
  
  // Calculate expected entropy after asking this question
  let expectedEntropyAfterAnswer = 0;
  
  for (const option of question.options) {
    // P(answer = option)
    let pAnswer = 0;
    for (const cluster of currentDistribution.items) {
      const likelihood = option.clusterLikelihoods?.[cluster.id] || 0.5;
      pAnswer += likelihood * cluster.probability;
    }
    
    if (pAnswer > 0) {
      // Calculate posterior distribution if this answer is given
      const posteriorAfterThisAnswer = updatePosterior(
        currentDistribution,
        question,
        option.value
      );
      
      // Weight by probability of this answer
      expectedEntropyAfterAnswer += pAnswer * posteriorAfterThisAnswer.entropy;
    }
  }
  
  return currentEntropy - expectedEntropyAfterAnswer;
}

/**
 * Select next question to maximize information gain
 */
export function selectNextQuestion(
  state: BayesianQuizState,
  candidateQuestions: AdaptiveQuestion[]
): AdaptiveQuestion | null {
  if (candidateQuestions.length === 0) return null;
  
  // Filter out already asked questions
  const availableQuestions = candidateQuestions.filter(
    q => !state.questionsAsked.includes(q.question_id)
  );
  
  if (availableQuestions.length === 0) return null;
  
  // Calculate information gain for each question
  const questionsWithGain = availableQuestions.map(question => ({
    question,
    informationGain: calculateInformationGain(state.clusterDistribution, question)
  }));
  
  // Sort by information gain (descending)
  questionsWithGain.sort((a, b) => b.informationGain - a.informationGain);
  
  // Select top question
  const selected = questionsWithGain[0];
  selected.question.expectedInformationGain = selected.informationGain;
  
  return selected.question;
}

/**
 * Check if Stage 2 should end
 */
export function shouldEndStage2(state: BayesianQuizState): boolean {
  const questionsAsked = state.questionsAsked.length;
  
  // Must ask minimum questions
  if (questionsAsked < state.minQuestions) return false;
  
  // Stop if max questions reached
  if (questionsAsked >= state.maxQuestions) return true;
  
  // Stop if uncertainty is low enough
  if (state.clusterDistribution.entropy < state.targetUncertainty) return true;
  
  return false;
}

/**
 * Get top candidate occupations from cluster distribution
 */
export function getCandidateOccupations(
  clusterDistribution: ProbabilityDistribution<UserCluster>,
  allOccupations: Occupation[]
): { occupationId: string; score: number }[] {
  // Score occupations based on cluster probabilities and ISCO group matches
  const occupationScores = new Map<string, number>();
  
  for (const cluster of clusterDistribution.topK) {
    for (const occupation of allOccupations) {
      // Check if occupation's ISCO group matches cluster
      const occupationIsco = (occupation as any).isco_code?.substring(0, 1); // First digit
      
      if (cluster.iscoGroups.includes(occupationIsco || '')) {
        const currentScore = occupationScores.get(occupation.id) || 0;
        occupationScores.set(occupation.id, currentScore + cluster.probability);
      }
    }
  }
  
  // Convert to array and sort
  const scored = Array.from(occupationScores.entries())
    .map(([occupationId, score]) => ({ occupationId, score }))
    .sort((a, b) => b.score - a.score);
  
  return scored.slice(0, 30); // Top 30 candidates
}

/**
 * Generate skill distribution from cluster distribution
 */
export function generateSkillDistribution(
  clusterDistribution: ProbabilityDistribution<UserCluster>,
  identifiedSkills: IdentifiedSkill[]
): ProbabilityDistribution<{ skillId: string; skillLabel: string }> {
  const skillScores = new Map<string, number>();
  
  // Add probability from clusters
  for (const cluster of clusterDistribution.items) {
    for (const skillId of cluster.coreSkills) {
      const currentScore = skillScores.get(skillId) || 0;
      skillScores.set(skillId, currentScore + cluster.probability * 0.3); // Weight from cluster
    }
  }
  
  // Add probability from directly identified skills
  for (const skill of identifiedSkills) {
    const currentScore = skillScores.get(skill.skillId) || 0;
    const directWeight = skill.confidence / 100;
    skillScores.set(skill.skillId, currentScore + directWeight * 0.7); // Weight from direct evidence
  }
  
  // Normalize
  const total = Array.from(skillScores.values()).reduce((sum, score) => sum + score, 0);
  const items = Array.from(skillScores.entries())
    .map(([skillId, score]) => ({
      skillId,
      skillLabel: skillId, // Would resolve from DB in practice
      probability: total > 0 ? score / total : 0
    }))
    .sort((a, b) => b.probability - a.probability);
  
  return {
    items,
    entropy: calculateEntropy(items.map(i => i.probability)),
    topK: items.slice(0, 10)
  };
}
