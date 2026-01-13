/**
 * Quiz Start Page
 * Initializes quiz session and redirects to quiz interface
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizStartPage() {
  const router = useRouter();

  useEffect(() => {
    async function startQuiz() {
      try {
        const response = await fetch('/api/quiz/start', {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Failed to start quiz');
        }

        const data = await response.json();
        router.push(`/quiz/${data.sessionId}`);
      } catch (error) {
        console.error('Error starting quiz:', error);
        alert('Failed to start quiz. Please try again.');
        router.push('/quiz');
      }
    }

    startQuiz();
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-24 max-w-md text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-6"></div>
      <h2 className="text-2xl font-semibold mb-2">Starting your quiz...</h2>
      <p className="text-gray-600">This will just take a moment</p>
    </div>
  );
}
