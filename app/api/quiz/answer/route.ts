/**
 * POST /api/quiz/answer
 * Submit an answer and get the next question
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getQuizSession,
  updateQuizSession,
  saveResponse,
  getResponsesForSession
} from '@/lib/quiz-db';
import { getOnboardingQuestions, getPhase2Questions } from '@/lib/quiz-questions';
import { getSkillOrGroupByCodeOrId } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, questionId, response, responseTime } = body;
    
    if (!sessionId || !questionId || response === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Get session
    const session = await getQuizSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }
    
    // Get the question to extract skill implications
    const currentQuestion = await getCurrentQuestion(questionId, session);
    
    // Extract skills from the answer
    const skillsFromAnswer = extractSkillsFromAnswer(currentQuestion, response);
    
    // Resolve skill labels from database
    const skillsWithLabels = await Promise.all(
      skillsFromAnswer.map(async (skill) => {
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
    
    // Save response
    await saveResponse({
      session_id: sessionId,
      question_id: questionId,
      question_text: currentQuestion?.text || 'Question',
      question_type: currentQuestion?.type || 'multiple-choice',
      user_response: response,
      response_time: responseTime,
      skills_inferred: skillsWithLabels.map(s => s.skillId)
    });
    
    // Update identified skills in session
    const updatedSkills = mergeSkills(session.identified_skills, skillsWithLabels);
    
    // Update session progress
    const newQuestionsAnswered = session.questions_answered + 1;
    
    // Handle onboarding responses (Phase 1)
    if (questionId.startsWith('onboarding_')) {
      await handleOnboardingResponse(session, questionId, response);
    }
    
    // Update session with new skills
    await updateQuizSession(sessionId, {
      identified_skills: updatedSkills
    });
    
    // Determine next question
    const nextQuestion = await getNextQuestion(session, questionId);
    
    // Update session
    await updateQuizSession(sessionId, {
      questions_answered: newQuestionsAnswered,
      last_question_id: questionId,
      identified_skills: updatedSkills
    });
    
    // Check if quiz is complete
    const isComplete = nextQuestion === null;
    
    if (isComplete) {
      await updateQuizSession(sessionId, {
        status: 'completed',
        completed_at: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      nextQuestion,
      progress: {
        current: newQuestionsAnswered,
        total: session.total_questions,
        percentage: Math.round((newQuestionsAnswered / session.total_questions) * 100)
      },
      skillsIdentified: updatedSkills,
      isComplete
    });
    
  } catch (error: any) {
    console.error('Error submitting answer:', error);
    return NextResponse.json(
      { error: 'Failed to submit answer', details: error.message },
      { status: 500 }
    );
  }
}

// Get current question from question bank
async function getCurrentQuestion(questionId: string, session: any) {
  // Check onboarding questions
  const onboardingQuestions = getOnboardingQuestions();
  const onboardingQuestion = onboardingQuestions.find(q => q.question_id === questionId);
  if (onboardingQuestion) return onboardingQuestion;
  
  // Check phase 2 questions
  const phase2Questions = await getPhase2Questions(session);
  const phase2Question = phase2Questions.find(q => q.question_id === questionId);
  if (phase2Question) return phase2Question;
  
  return null;
}

// Extract skills from user's answer based on question type
function extractSkillsFromAnswer(question: any, response: any) {
  if (!question || !question.options) return [];
  
  const skills: any[] = [];
  
  // Handle different question types
  if (question.type === 'multiple-choice') {
    // Single selection - find the selected option
    const selectedOption = question.options.find((opt: any) => opt.value === response);
    if (selectedOption?.skillImplications) {
      selectedOption.skillImplications.forEach((impl: any) => {
        skills.push({
          skillId: impl.skillId,
          skillLabel: impl.skillId, // We'll resolve the label later
          confidence: impl.confidence,
          evidence: [question.question_id],
          source: 'direct' as const
        });
      });
    }
  } else if (question.type === 'multi-select' || question.type === 'scenario') {
    // Multiple selections - process each selected option
    const selectedValues = Array.isArray(response) ? response : [response];
    selectedValues.forEach((value: string) => {
      const selectedOption = question.options.find((opt: any) => opt.value === value);
      if (selectedOption?.skillImplications) {
        selectedOption.skillImplications.forEach((impl: any) => {
          skills.push({
            skillId: impl.skillId,
            skillLabel: impl.skillId,
            confidence: impl.confidence,
            evidence: [question.question_id],
            source: 'direct' as const
          });
        });
      }
    });
  } else if (question.type === 'scale') {
    // Scale questions - confidence based on scale value
    const scaleValue = parseInt(response);
    if (!isNaN(scaleValue) && question.target_skills) {
      question.target_skills.forEach((target: any) => {
        skills.push({
          skillId: target.skillId,
          skillLabel: target.skillId,
          confidence: Math.min(scaleValue * 20, 100), // 1-5 scale to 20-100
          evidence: [question.question_id],
          source: 'direct' as const
        });
      });
    }
  }
  
  return skills;
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

async function handleOnboardingResponse(
  session: any,
  questionId: string,
  response: any
) {
  const updates: any = {};
  
  switch (questionId) {
    case 'onboarding_1':
      updates.current_situation = response;
      break;
    case 'onboarding_2':
      updates.experience_text = response;
      break;
    case 'onboarding_3':
      updates.interest_categories = Array.isArray(response) ? response : [response];
      break;
    case 'onboarding_4':
      updates.strengths_text = response;
      break;
    case 'onboarding_5':
      updates.primary_goal = response;
      // Move to phase 2 after onboarding
      updates.current_phase = 2;
      break;
  }
  
  if (Object.keys(updates).length > 0) {
    await updateQuizSession(session.session_id, updates);
  }
}

async function getNextQuestion(session: any, currentQuestionId: string) {
  // Onboarding questions (Phase 1)
  const onboardingQuestions = getOnboardingQuestions();
  const currentOnboardingIndex = onboardingQuestions.findIndex(
    (q: any) => q.question_id === currentQuestionId
  );
  
  if (currentOnboardingIndex !== -1 && currentOnboardingIndex < onboardingQuestions.length - 1) {
    return onboardingQuestions[currentOnboardingIndex + 1];
  }
  
  // Move to Phase 2 questions
  if (session.current_phase === 1 && currentQuestionId === 'onboarding_5') {
    const phase2Questions = await getPhase2Questions(session);
    return phase2Questions[0] || null;
  }
  
  // Phase 2 questions
  if (session.current_phase === 2) {
    const phase2Questions = await getPhase2Questions(session);
    const responses = await getResponsesForSession(session.session_id);
    const answeredInPhase2 = responses.filter(r => 
      r.question_id.startsWith('phase2_') || r.question_id.startsWith('generated_')
    ).length;
    
    // Continue Phase 2 if we have more questions
    if (answeredInPhase2 < phase2Questions.length) {
      return phase2Questions[answeredInPhase2] || null;
    }
    
    // End of quiz for now
    return null;
  }
  
  return null;
}
