/**
 * Quiz Landing Page
 * Introduction and start button
 */

import Link from 'next/link';
import { Brain, Clock, Target, TrendingUp } from 'lucide-react';

export default function QuizPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
          <Brain className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Discover Your Skills</h1>
        <p className="text-xl text-gray-600 mb-2">
          Take our AI-powered quiz to find out what you're great at
        </p>
        <p className="text-lg text-gray-500">
          Designed for young people by The King&apos;s Trust
        </p>
      </div>

      {/* What to Expect */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-6">What to expect</h2>
        
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">About 15 minutes</h3>
              <p className="text-gray-600 text-sm">
                Take your time - there are no wrong answers
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Personal to you</h3>
              <p className="text-gray-600 text-sm">
                Questions adapt based on your answers
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">Real career matches</h3>
              <p className="text-gray-600 text-sm">
                Get job recommendations based on your skills
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">AI-powered insights</h3>
              <p className="text-gray-600 text-sm">
                Personalized feedback using advanced AI
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">No work experience? No problem!</h3>
          <p className="text-blue-800 text-sm">
            This quiz is designed for young people. We'll ask about school, hobbies, 
            volunteering, gaming, and everyday experiences - not just "proper jobs". 
            Everyone has skills, and we'll help you discover yours!
          </p>
        </div>
      </div>

      {/* What You'll Get */}
      <div className="bg-gradient-to-r from-primary/5 to-purple-50 rounded-lg p-8 mb-8">
        <h2 className="text-2xl font-semibold mb-4">What you'll get</h2>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              ✓
            </div>
            <span className="text-gray-700">
              <strong>Your skills profile</strong> - See what you're naturally good at
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              ✓
            </div>
            <span className="text-gray-700">
              <strong>Career recommendations</strong> - Jobs that match your skills
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              ✓
            </div>
            <span className="text-gray-700">
              <strong>Personalized advice</strong> - AI-generated insights about your strengths
            </span>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              ✓
            </div>
            <span className="text-gray-700">
              <strong>Next steps</strong> - Ideas for building on your skills
            </span>
          </li>
        </ul>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/quiz/start"
          className="inline-block bg-slate-50 px-12 py-4 rounded-lg text-lg font-semibold hover:bg-primary/90 transition-colors shadow-lg hover:shadow-xl"
        >
          Start the Quiz
        </Link>
        <p className="text-sm text-gray-500 mt-4">
          Free • No account needed • Takes about 15 minutes
        </p>
      </div>
    </div>
  );
}
