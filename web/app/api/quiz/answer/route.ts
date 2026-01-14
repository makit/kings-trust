/**
 * POST /api/quiz/answer
 * Submit an answer and get the next question
 * Now using two-stage Bayesian adaptive quiz system
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getQuizSession,
  updateQuizSession,
  saveResponse,
  getResponsesForSession
} from '@/lib/quiz-db';
import { getSkillOrGroupByCodeOrId } from '@/lib/database';
import { translateSkillCode, isLegacySkillCode } from '@/lib/skill-code-mapping';
import {
  getNextAdaptiveQuestion,
  processAdaptiveAnswer,
  checkStage1Completion,
  extractSkillsFromState,
  serializeBayesianState,
  deserializeBayesianState,
  generateProgressSummary,
  generateProgressMessage
} from '@/lib/adaptive-quiz-controller';
import { initializeBayesianState, BayesianQuizState, AdaptiveQuestion } from '@/lib/bayesian-quiz-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, questionId, response, responseTime } = body;
    
    console.log('[Quiz Answer] Received request:', { sessionId, questionId, response });
    
    if (!sessionId || !questionId || response === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get session
    const session = await getQuizSession(sessionId);
    console.log('[Quiz Answer] Session found:', session ? 'YES' : 'NO');
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Get or initialize Bayesian state
    let bayesianState: BayesianQuizState;
    if (session.bayesian_state) {
      console.log('[Quiz Answer] Deserializing existing Bayesian state');
      bayesianState = deserializeBayesianState(session.bayesian_state);
    } else {
      console.log('[Quiz Answer] Initializing new Bayesian state');
      bayesianState = initializeBayesianState(sessionId);
    }
    console.log('[Quiz Answer] Bayesian state stage:', bayesianState.stage);
    
    // Get the current question
    const currentQuestion = await getCurrentAdaptiveQuestion(questionId, bayesianState);
    console.log('[Quiz Answer] Current question found:', currentQuestion ? 'YES' : 'NO');
    if (!currentQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }
    
    // Process answer and update Bayesian state
    console.log('[Quiz Answer] Processing answer...');
    bayesianState = processAdaptiveAnswer(bayesianState, currentQuestion, response);
    
    // Extract any skills from the answer
    let skillsFromAnswer = await extractSkillsFromAnswer(currentQuestion, response);
    
    // If this is an AI scenario question, analyze the free-text response
    if (currentQuestion.type === 'scenario' && typeof response === 'string') {
      console.log('[Quiz Answer] Analyzing AI scenario response...');
      console.log('[Quiz Answer] Response text:', response.substring(0, 100) + '...');
      console.log('[Quiz Answer] AWS credentials configured:', !!process.env.AWS_ACCESS_KEY_ID);
      try {
        const startTime = Date.now();
        const { analyzeAIResponse } = await import('@/lib/ai-adaptive-questions');
        const aiSkills = await analyzeAIResponse(
          currentQuestion,
          response,
          currentQuestion.targetSkills || []
        );
        const analysisTime = Date.now() - startTime;
        // Merge AI-detected skills with existing
        skillsFromAnswer = [...skillsFromAnswer, ...aiSkills];
        console.log('[Quiz Answer] AI analysis took', analysisTime, 'ms');
        console.log('[Quiz Answer] AI detected skills:', aiSkills.length, aiSkills.map(s => s.skillLabel));
      } catch (error) {
        console.error('[Quiz Answer] Failed to analyze AI response:', error);
        // Continue without AI analysis
      }
    }
    
    // Save response
    await saveResponse({
      session_id: sessionId,
      question_id: questionId,
      question_text: currentQuestion.text,
      question_type: currentQuestion.type,
      user_response: response,
      response_time: responseTime,
      skills_inferred: skillsFromAnswer.map(s => s.skillId)
    });
    
    // Merge skills with existing
    const updatedSkills = mergeSkills(session.identified_skills, skillsFromAnswer);
    
    // Generate final skill list from Bayesian state (now async)
    const finalSkills = await extractSkillsFromState(bayesianState, updatedSkills);
    
    // Check for stage transitions
    let stageTransition = false;
    if (bayesianState.stage === 1) {
      const { isComplete, updatedState } = checkStage1Completion(bayesianState);
      if (isComplete && updatedState) {
        bayesianState = updatedState;
        stageTransition = true;
      }
    }
    
    // Update session
    const questionsAsked = bayesianState.questionsAsked || [];
    await updateQuizSession(sessionId, {
      questions_answered: questionsAsked.length,
      identified_skills: finalSkills,
      bayesian_state: serializeBayesianState(bayesianState),
      cluster_probabilities: JSON.stringify(bayesianState.clusterDistribution),
      questions_asked: questionsAsked,
      quiz_stage: bayesianState.stage,
      stage1_complete: bayesianState.stage1Complete,
      last_question_id: questionId
    });
    
    // Get next question
    const nextQuestion = await getNextAdaptiveQuestion(session, bayesianState);
    
    // Check if quiz is complete
    const isComplete = nextQuestion === null && bayesianState.stage === 2;
    
    if (isComplete) {
      await updateQuizSession(sessionId, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });
    }
    
    // Generate progress summary
    const progressSummary = generateProgressSummary(bayesianState);
    const progressMessage = generateProgressMessage(bayesianState);
    
    // Generate cluster-based success message for variety
    const topCluster = progressSummary.topClusters[0];
    const clusterMessages = [
      `Nice one! You might be a ${topCluster?.name}! 🎯`,
      `Interesting choice! ${topCluster?.name} energy! ✨`,
      `That tells us a lot! Getting ${topCluster?.name} vibes 💪`,
      `Cool! We're learning about your ${topCluster?.name} side 🚀`,
      `Great answer! Very ${topCluster?.name}-ish! 🌟`,
      `Noted! Building your ${topCluster?.name} profile 📝`,
      `Good stuff! ${topCluster?.name} traits shining through ⭐`,
      `Love it! ${topCluster?.name} personality coming through 🎨`,
      `Brilliant! That's so ${topCluster?.name}! 💡`,
      `Perfect! Adding to your ${topCluster?.name} score 🎲`,
      `Sweet! ${topCluster?.name} skills detected 🔍`,
      `Amazing! Classic ${topCluster?.name} response 🎪`,
      `Fantastic! ${topCluster?.name} vibes for sure 🌈`,
      `Awesome sauce! ${topCluster?.name} all the way! 🎭`,
      `Spot on! Definitely ${topCluster?.name} material 🎯`
    ];
    const successMessage = topCluster && questionsAsked.length > 2 
      ? clusterMessages[Math.floor(Math.random() * clusterMessages.length)]
      : null;
    
    return NextResponse.json({
      nextQuestion,
      progress: {
        current: questionsAsked.length,
        estimated: questionsAsked.length + progressSummary.estimatedRemaining,
        stage: bayesianState.stage,
        stageTransition,
        message: progressMessage,
        confidence: progressSummary.confidence
      },
      skillsIdentified: finalSkills.slice(0, 10), // Top 10 skills
      topClusters: progressSummary.topClusters.map(c => ({
        name: c.name,
        description: c.description,
        probability: Math.round((c.probability || 0) * 100)
      })),
      successMessage,
      isComplete
    });
    
  } catch (error: any) {
    console.error('[Quiz Answer] Error submitting answer:', error);
    console.error('[Quiz Answer] Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to submit answer', details: error.message },
      { status: 500 }
    );
  }
}

// Map old question IDs to new ones for backward compatibility
const OLD_TO_NEW_QUESTION_ID_MAP: Record<string, string> = {
  'onboarding_1': 'stage1_q1_preference',
  'onboarding_2': 'stage1_q2_work_style',
  'onboarding_3': 'stage1_q3_environment',
  'onboarding_4': 'stage1_q4_collaboration',
  'onboarding_5': 'stage1_q5_pace'
};

// Get current question from Bayesian quiz system
async function getCurrentAdaptiveQuestion(
  questionId: string,
  bayesianState: BayesianQuizState
): Promise<AdaptiveQuestion | null> {
  // Import question banks
  const { getStage1Questions } = await import('@/lib/quiz-stage1-questions');
  const { getStage2QuestionBank } = await import('@/lib/quiz-stage2-questions');
  
  console.log('[getCurrentAdaptiveQuestion] Looking for question:', questionId);
  
  // Map old question IDs to new ones
  const mappedQuestionId = OLD_TO_NEW_QUESTION_ID_MAP[questionId] || questionId;
  if (mappedQuestionId !== questionId) {
    console.log('[getCurrentAdaptiveQuestion] Mapped old ID', questionId, 'to new ID', mappedQuestionId);
  }
  
  // Check Stage 1 questions
  const stage1Questions = getStage1Questions();
  const stage1Question = stage1Questions.find(q => q.question_id === mappedQuestionId);
  if (stage1Question) {
    console.log('[getCurrentAdaptiveQuestion] Found in Stage 1');
    return stage1Question;
  }
  
  // Check Stage 2 questions
  const stage2Questions = getStage2QuestionBank();
  const stage2Question = stage2Questions.find(q => q.question_id === mappedQuestionId);
  if (stage2Question) {
    console.log('[getCurrentAdaptiveQuestion] Found in Stage 2');
    return stage2Question;
  }
  
  // Check if this is an AI-generated scenario question
  if (mappedQuestionId.startsWith('ai_scenario_')) {
    console.log('[getCurrentAdaptiveQuestion] AI scenario question - reconstructing from session state');
    // AI questions are dynamic, return a placeholder that will be handled specially
    // The actual question data comes from the frontend
    return {
      question_id: mappedQuestionId,
      type: 'scenario',
      text: 'AI Generated Scenario',
      description: '',
      options: [{ value: 'free_text', label: 'Free text response' }],
      targetSkills: [mappedQuestionId.split('_').pop() || ''], // Extract skill ID from question ID
      difficulty: 3
    } as AdaptiveQuestion;
  }
  
  console.log('[getCurrentAdaptiveQuestion] Question not found! Tried:', mappedQuestionId);
  return null;
}

// Extract skills from user's answer based on question type
async function extractSkillsFromAnswer(question: AdaptiveQuestion, response: any) {
  if (!question || !question.options) return [];
  
  const skills: any[] = [];
  
  // Handle different question types
  if (question.type === 'multiple-choice') {
    // Single selection - find the selected option
    const selectedOption = question.options.find((opt: any) => opt.value === response);
    if (selectedOption?.skillLikelihoods) {
      // Extract skills from skillLikelihoods
      Object.entries(selectedOption.skillLikelihoods).forEach(([skillId, likelihood]) => {
        if (typeof likelihood === 'number' && likelihood > 0.5) {
          // Translate legacy S-code to ESCO key_* format
          const translatedSkillId = translateSkillCode(skillId);
          skills.push({
            skillId: translatedSkillId,
            skillLabel: translatedSkillId,
            confidence: Math.round(likelihood * 100),
            evidence: [question.question_id],
            source: 'direct' as const
          });
        }
      });
    }
  } else if (question.type === 'multi-select') {
    // Multiple selections - process each selected option
    const selectedValues = Array.isArray(response) ? response : [response];
    selectedValues.forEach((value: string) => {
      const selectedOption = question.options.find((opt: any) => opt.value === value);
      if (selectedOption?.skillLikelihoods) {
        Object.entries(selectedOption.skillLikelihoods).forEach(([skillId, likelihood]) => {
          if (typeof likelihood === 'number' && likelihood > 0.5) {
            // Translate legacy S-code to ESCO key_* format
            const translatedSkillId = translateSkillCode(skillId);
            skills.push({
              skillId: translatedSkillId,
              skillLabel: translatedSkillId,
              confidence: Math.round(likelihood * 100),
              evidence: [question.question_id],
              source: 'direct' as const
            });
          }
        });
      }
    });
  } else if (question.type === 'scale') {
    // Scale questions - confidence based on scale value
    const scaleValue = parseInt(response);
    if (!isNaN(scaleValue) && question.targetSkills) {
      question.targetSkills.forEach((skillId: string) => {
        // Translate legacy S-code to ESCO key_* format
        const translatedSkillId = translateSkillCode(skillId);
        skills.push({
          skillId: translatedSkillId,
          skillLabel: translatedSkillId,
          confidence: Math.min(scaleValue * 20, 100), // 1-5 scale to 20-100
          evidence: [question.question_id],
          source: 'direct' as const
        });
      });
    }
  }
  
  // Resolve skill labels from database
  const skillsWithLabels = await Promise.all(
    skills.map(async (skill) => {
      try {
        const skillData = await getSkillOrGroupByCodeOrId(skill.skillId);
        return {
          ...skill,
          skillLabel: skillData?.preferred_label || skill.skillId
        };
      } catch {
        return skill;
      }
    })
  );
  
  return skillsWithLabels;
}

// Merge new skills with existing ones (accumulate confidence)
function mergeSkills(existingSkills: any[], newSkills: any[]) {
  const skillMap = new Map();
  
  // Add existing skills
  existingSkills.forEach(skill => {
    skillMap.set(skill.skillId, {
      ...skill,
      evidence: Array.isArray(skill.evidence) ? skill.evidence : []
    });
  });
  
  // Merge new skills
  newSkills.forEach(newSkill => {
    if (skillMap.has(newSkill.skillId)) {
      const existing = skillMap.get(newSkill.skillId);
      // Average the confidence scores
      const combinedConfidence = Math.round(
        (existing.confidence + newSkill.confidence) / 2
      );
      skillMap.set(newSkill.skillId, {
        ...existing,
        confidence: Math.min(combinedConfidence, 100),
        evidence: [...existing.evidence, ...newSkill.evidence]
      });
    } else {
      skillMap.set(newSkill.skillId, newSkill);
    }
  });
  
  return Array.from(skillMap.values());
}
