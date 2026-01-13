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
    
    // Save response
    await saveResponse({
      session_id: sessionId,
      question_id: questionId,
      question_text: 'Question text', // We'll get this from the question bank
      question_type: 'multiple-choice',
      user_response: response,
      response_time: responseTime,
      skills_inferred: []
    });
    
    // Update session progress
    const newQuestionsAnswered = session.questions_answered + 1;
    
    // Handle onboarding responses (Phase 1)
    if (questionId.startsWith('onboarding_')) {
      await handleOnboardingResponse(session, questionId, response);
    }
    
    // Determine next question
    const nextQuestion = await getNextQuestion(session, questionId);
    
    // Update session
    await updateQuizSession(sessionId, {
      questions_answered: newQuestionsAnswered,
      last_question_id: questionId
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
      skillsIdentified: session.identified_skills,
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
