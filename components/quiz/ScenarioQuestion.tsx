/**
 * Scenario Question Component
 * Free-text response for AI-powered natural language questions
 */

'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Sparkles } from 'lucide-react';

interface ScenarioQuestionProps {
  questionId: string;
  questionText: string;
  scenarioContext?: string;
  onSubmit: (response: string) => void;
}

export default function ScenarioQuestion({
  questionId,
  questionText,
  scenarioContext,
  onSubmit
}: ScenarioQuestionProps) {
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const minChars = 30;
  const maxChars = 500;

  // Reset state when question changes
  useEffect(() => {
    setResponse('');
    setIsSubmitting(false);
    setIsLoading(true);
    
    // Small delay to show loading animation
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [questionId]);

  const handleSubmit = () => {
    if (response.trim().length < minChars) {
      alert(`Please write at least ${minChars} characters`);
      return;
    }

    setIsSubmitting(true);
    onSubmit(response);
  };

  const charCount = response.length;
  const isValid = charCount >= minChars && charCount <= maxChars;

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="bg-gradient-to-br from-secondary-500/10 to-brand-red/10 rounded-3xl p-6 border-2 border-secondary-500/20">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-gray-300 rounded flex-shrink-0 mt-1"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-4 bg-gray-300 rounded w-full"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
        <div className="text-center space-y-2">
          <div className="h-8 bg-gray-300 rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
        </div>
        <div className="h-32 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Scenario Context */}
      {scenarioContext && (
        <div className="bg-gradient-to-br from-secondary-500/10 to-brand-red/10 rounded-3xl p-6 border-2 border-secondary-500/20">
          <div className="flex items-start gap-3">
            <MessageSquare className="w-6 h-6 text-brand-red flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-semibold text-[#323232] mb-2">Imagine this...</h4>
              <p className="text-[#323232]/80 leading-relaxed">{scenarioContext}</p>
            </div>
          </div>
        </div>
      )}

      {/* Question */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-[#323232] mb-2">{questionText}</h3>
        <p className="text-[#323232]/60 text-sm">
          <Sparkles className="inline w-4 h-4 mr-1" />
          Tell us what you'd do in your own words
        </p>
      </div>

      {/* Text Area */}
      <div className="space-y-2">
        <textarea
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Type your answer here... Be honest and think about how you'd really handle this situation!"
          className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 focus:border-brand-red focus:outline-none transition-colors text-[#323232] placeholder:text-[#323232]/40 resize-none bg-white"
          rows={6}
          maxLength={maxChars}
          disabled={isSubmitting}
        />
        
        {/* Character Counter */}
        <div className="flex justify-between items-center text-sm">
          <span className={`${
            charCount < minChars 
              ? 'text-gray-400' 
              : isValid 
                ? 'text-secondary-500 font-semibold' 
                : 'text-red-500'
          }`}>
            {charCount < minChars 
              ? `${minChars - charCount} more characters needed`
              : charCount > maxChars
                ? `${charCount - maxChars} characters over limit`
                : '✓ Looking good!'
            }
          </span>
          <span className="text-gray-400">
            {charCount}/{maxChars}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || isSubmitting}
        className="w-full bg-gradient-to-r from-brand-red to-brand-red/90 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            Analyzing your answer...
          </>
        ) : (
          <>
            Submit Answer ✨
          </>
        )}
      </button>

      {/* Helpful Tip */}
      <div className="text-center text-sm text-[#323232]/50">
        💡 Tip: There's no "right" answer - we're learning about how you think!
      </div>
    </div>
  );
}
