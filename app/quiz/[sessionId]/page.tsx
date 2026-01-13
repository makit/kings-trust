/**
 * Active Quiz Interface
 * Main quiz taking experience with question renderer
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Clock, Brain } from 'lucide-react';
import MultipleChoice from '@/components/quiz/MultipleChoice';
import MultiSelect from '@/components/quiz/MultiSelect';
import FreeText from '@/components/quiz/FreeText';
import ScaleQuestion from '@/components/quiz/ScaleQuestion';

interface QuizQuestion {
  question_id: string;
  phase: number;
  type: string;
  text: string;
  description?: string;
  options?: Array<{ value: string; label: string }>;
  estimated_time?: number;
}

export default function QuizSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  const [question, setQuestion] = useState<QuizQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 20, percentage: 0 });
  const [startTime] = useState(Date.now());

  // Load initial question
  useEffect(() => {
    async function loadFirstQuestion() {
      try {
        // The session was created, so we start with the first onboarding question
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
          estimated_time: 30
        };

        setQuestion(firstQuestion);
        setLoading(false);
      } catch (error) {
        console.error('Error loading question:', error);
        alert('Failed to load quiz. Please try again.');
        router.push('/quiz');
      }
    }

    loadFirstQuestion();
  }, [sessionId, router]);

  async function submitAnswer(response: any) {
    if (!question) return;

    setSubmitting(true);

    try {
      const responseTime = Date.now() - startTime;

      const res = await fetch('/api/quiz/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          questionId: question.question_id,
          response,
          responseTime
        })
      });

      if (!res.ok) {
        throw new Error('Failed to submit answer');
      }

      const data = await res.json();

      // Update progress
      setProgress(data.progress);

      // Check if quiz is complete
      if (data.isComplete) {
        router.push(`/quiz/${sessionId}/results`);
        return;
      }

      // Load next question
      if (data.nextQuestion) {
        setQuestion(data.nextQuestion);
      } else {
        // No more questions
        router.push(`/quiz/${sessionId}/results`);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
        <h2 className="text-2xl font-semibold mb-2">Loading quiz...</h2>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        <p className="text-gray-600">No question available</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Question {progress.current + 1} of {progress.total}
          </span>
          <span className="text-sm text-gray-500">{progress.percentage}% complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress.percentage}%` }}
          />
        </div>
      </div>

      {/* Phase Indicator */}
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-5 h-5 text-primary" />
        <span className="text-sm font-medium text-gray-600">
          {question.phase === 1 ? 'Getting to know you' : 'Discovering your skills'}
        </span>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {question.text}
        </h2>
        
        {question.description && (
          <p className="text-gray-600 mb-6">{question.description}</p>
        )}

        {question.estimated_time && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
            <Clock className="w-4 h-4" />
            <span>About {Math.round(question.estimated_time / 60)} minute{question.estimated_time >= 120 ? 's' : ''}</span>
          </div>
        )}

        {/* Render appropriate question type */}
        <div className="mt-6">
          {question.type === 'multiple-choice' && (
            <MultipleChoice
              options={question.options || []}
              onSubmit={submitAnswer}
              disabled={submitting}
            />
          )}

          {question.type === 'multi-select' && (
            <MultiSelect
              options={question.options || []}
              onSubmit={submitAnswer}
              disabled={submitting}
            />
          )}

          {question.type === 'free-text' && (
            <FreeText
              onSubmit={submitAnswer}
              disabled={submitting}
              placeholder="Tell us about your experiences..."
            />
          )}

          {question.type === 'scale' && (
            <ScaleQuestion
              options={question.options || []}
              onSubmit={submitAnswer}
              disabled={submitting}
            />
          )}

          {question.type === 'scenario' && (
            <MultiSelect
              options={question.options || []}
              onSubmit={submitAnswer}
              disabled={submitting}
              description="Choose all that apply"
            />
          )}
        </div>
      </div>

      {submitting && (
        <div className="text-center text-gray-600">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p>Processing your answer...</p>
        </div>
      )}
    </div>
  );
}
