/**
 * Active Quiz Interface
 * Main quiz taking experience with question renderer
 */

'use client';

const TOTAL_QUESTIONS = 15;

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sparkles, Target, Loader2 } from 'lucide-react';
import MultipleChoice from '@/components/quiz/MultipleChoice';
import MultiSelect from '@/components/quiz/MultiSelect';
import FreeText from '@/components/quiz/FreeText';
import ScaleQuestion from '@/components/quiz/ScaleQuestion';
import ScenarioQuestion from '@/components/quiz/ScenarioQuestion';

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
  const [progress, setProgress] = useState({ current: 0, total: TOTAL_QUESTIONS, percentage: 0 });
  const [startTime] = useState(Date.now());
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Nice one! 🎉');

  // Load initial question
  useEffect(() => {
    async function loadFirstQuestion() {
      try {
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

  async function submitAnswer(response: unknown) {
    if (!question) return;

    setSubmitting(true);
    setShowSuccess(true);

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

      // Store success message if provided
      if (data.successMessage) {
        setSuccessMessage(data.successMessage);
      }

      // Show success animation briefly
      setTimeout(() => {
        // Check if quiz is complete
        if (data.isComplete) {
          setShowSuccess(false);
          router.push(`/quiz/${sessionId}/results`);
          return;
        }

        // Load next question
        if (data.nextQuestion) {
          // IMPORTANT: Hide success FIRST, then update question
          // This allows the ScenarioQuestion loading state to show
          setShowSuccess(false);
          
          // Small delay to ensure state update completes
          setTimeout(() => {
            setQuestion(data.nextQuestion);
            setSuccessMessage('Nice one! 🎉'); // Reset for next time
            setProgress({
              current: data.progress.current,
              total: TOTAL_QUESTIONS,
              percentage: Math.round((data.progress.current / TOTAL_QUESTIONS) * 100)
            });
          }, 50);
        } else {
          setShowSuccess(false);
          router.push(`/quiz/${sessionId}/results`);
        }
      }, 1000);
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('Failed to submit answer. Please try again.');
      setShowSuccess(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block bg-gradient-to-br from-brand-red to-brand-red/80 p-4 rounded-3xl mb-4 animate-bounce">
            <Sparkles size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-semibold text-[#323232] mb-2">Loading your quiz...</h2>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#323232]/60">No question available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Success Animation Overlay */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="fixed inset-0 z-50 flex items-center justify-center animate-bounce-in">
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-center transform scale-110 max-w-md">
              <div className="text-6xl mb-2">🎉</div>
              <p className="text-xl font-bold text-brand-red gap-3">{successMessage}</p>
              {/* Spinner + thinking text */}
              <div className="flex items-center justify-center gap-3 mb-4">
                <Loader2 size={28} className="animate-spin text-brand-red" aria-hidden="true" />
                <span className="text-sm text-[#323232]/70 font-medium">thinking....</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-brand-red" />
              <span className="text-sm font-bold text-[#323232]">
                Question {progress.current + 1}
              </span>
            </div>
            {/* <span className="text-sm font-semibold text-secondary-500">{progress.percentage}%</span> */}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-red to-secondary-500 h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Phase Indicator */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`
            px-3 py-1 rounded-full text-xs font-semibold
            ${question.question_id.includes('stage1') 
              ? 'bg-brand-red/10 text-brand-red' 
              : 'bg-secondary-500/10 text-secondary-500'
            }
          `}>
            {question.question_id.includes('stage1') && question.type !== 'scenario' ? '👋 Getting to know you' : question.type === "scenario" ? '🤖 Personalised Scenario Question' : '💪 Discovering your skills'}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 mb-6 border-2 border-brand-red/10 animate-slide-up">
          <h2 className="text-2xl font-bold text-[#323232] mb-3">
            {question.text}
          </h2>
          
          {question.description && question.type !== 'scenario' && (
            <p className="text-[#323232]/70 mb-6 text-base">{question.description}</p>
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
              <ScenarioQuestion
                questionId={question.question_id}
                questionText={question.text}
                scenarioContext={question.description}
                onSubmit={submitAnswer}
              />
            )}
          </div>
        </div>

        {/* Motivation Message */}
        <div className="text-center">
          <p className="text-sm text-[#323232]/60">
            {progress.percentage < 30 && "You're doing great! Keep going! 💪"}
            {progress.percentage >= 30 && progress.percentage < 60 && "Awesome progress! You're almost halfway! 🎯"}
            {progress.percentage >= 60 && progress.percentage < 90 && "Nearly there! Keep it up! 🚀"}
            {progress.percentage >= 90 && "Final stretch! You've got this! 🏆"}
          </p>
        </div>
      </div>
    </div>
  );
}
