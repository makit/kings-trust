/**
 * Quiz Start Page
 * Collects DOB and location before starting quiz
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Calendar, Sparkles } from 'lucide-react';

export default function QuizStartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dob: '',
    location: ''
  });

  async function handleStart(e: React.FormEvent) {
    e.preventDefault();
    
    if (!formData.dob || !formData.location) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/quiz/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dob: formData.dob,
          location: formData.location
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start quiz');
      }

      const data = await response.json();
      router.push(`/quiz/${data.sessionId}`);
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Hero Section */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="inline-block bg-gradient-to-br from-brand-red to-brand-red/80 p-4 rounded-3xl mb-4 animate-bounce-in">
            <Sparkles size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-[#323232] mb-3">
            Let's Find Your Path! 🎯
          </h1>
          <p className="text-[#323232]/70 text-lg">
            Answer a few quick questions to discover careers that match your vibe
          </p>
        </div>

        {/* Form Card */}
        <form onSubmit={handleStart} className="bg-white rounded-3xl shadow-xl p-6 border-2 border-brand-red/10 animate-slide-up">
          <div className="space-y-5">
            {/* Date of Birth */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#323232] mb-2">
                <Calendar size={18} className="text-brand-red" />
                When's your birthday?
              </label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-brand-red focus:outline-none transition-colors text-[#323232] bg-white"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-[#323232] mb-2">
                <MapPin size={18} className="text-brand-red" />
                Where are you based?
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., London, Manchester, Birmingham..."
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-brand-red focus:outline-none transition-colors text-[#323232] placeholder:text-[#323232]/40 bg-white"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-red to-brand-red/90 text-white py-4 px-6 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Starting...
                </>
              ) : (
                <>
                  Let's Go! ✨
                </>
              )}
            </button>
          </div>

          {/* Privacy Note */}
          <p className="text-xs text-[#323232]/50 text-center mt-4">
            We use this info to personalize your experience. Your data is safe with us! 🔒
          </p>
        </form>

        {/* Decorative Elements */}
        <div className="mt-6 flex justify-center gap-2 opacity-50">
          <div className="w-2 h-2 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-secondary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-brand-red rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
