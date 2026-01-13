/**
 * POST /api/quiz/start
 * Start a new quiz session
 */

import { NextRequest, NextResponse } from 'next/server';
import { createQuizSession } from '@/lib/quiz-db';

export async function POST(request: NextRequest) {
  try {
    // Create new quiz session
    const session = await createQuizSession();
    
    // Return first onboarding question
    const firstQuestion = {
      question_id: 'onboarding_1',
      phase: 1,
      type: 'multiple-choice',
      text: 'What are you up to right now?',
      description: 'This helps us understand your current situation',
      options: [
        { value: 'in-school', label: 'In school/college' },
        { value: 'just-finished', label: 'Just finished school/college' },
        { value: 'first-job', label: 'Looking for my first job' },
        { value: 'between-jobs', label: 'Between jobs' },
        { value: 'part-time', label: 'Working part-time' },
        { value: 'volunteering', label: 'Volunteering' },
        { value: 'taking-break', label: 'Taking a break/figuring things out' },
        { value: 'other', label: 'Other' }
      ],
      target_skills: [],
      is_generated: false,
      estimated_time: 15
    };
    
    return NextResponse.json({
      sessionId: session.session_id,
      firstQuestion,
      estimatedTime: 15 // minutes
    });
    
  } catch (error: any) {
    console.error('Error starting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to start quiz', details: error.message },
      { status: 500 }
    );
  }
}
