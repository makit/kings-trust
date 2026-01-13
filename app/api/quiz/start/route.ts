/**
 * POST /api/quiz/start
 * Start a new quiz session with Bayesian adaptive quiz
 */

import { NextRequest, NextResponse } from 'next/server';
import { createQuizSession, updateQuizSession } from '@/lib/quiz-db';
import { initializeBayesianState } from '@/lib/bayesian-quiz-engine';
import { serializeBayesianState } from '@/lib/adaptive-quiz-controller';
import { getStage1Questions } from '@/lib/quiz-stage1-questions';

export async function POST(request: NextRequest) {
  try {
    // Create new quiz session
    const session = await createQuizSession();
    
    // Initialize Bayesian state
    const bayesianState = initializeBayesianState(session.session_id);
    
    // Update session with initial Bayesian state
    await updateQuizSession(session.session_id, {
      quiz_stage: 1,
      stage1_complete: false,
      bayesian_state: serializeBayesianState(bayesianState),
      cluster_probabilities: JSON.stringify(bayesianState.clusterDistribution),
      questions_asked: []
    });
    
    // Get first Stage 1 question
    const stage1Questions = getStage1Questions();
    const firstQuestion = stage1Questions[0];
    
    return NextResponse.json({
      sessionId: session.session_id,
      firstQuestion,
      quizInfo: {
        stage: 1,
        stageDescription: 'Getting to know you',
        estimatedQuestions: '14-23 questions',
        estimatedTime: '5-8 minutes'
      }
    });
    
  } catch (error: any) {
    console.error('Error starting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to start quiz', details: error.message },
      { status: 500 }
    );
  }
}
