/**
 * Quiz Landing Page
 * Introduction and start button
 */

import Link from 'next/link';
import { Sparkles, Clock, Target, Zap, Trophy } from 'lucide-react';

export default function QuizPage() {
  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-br from-brand-red to-brand-red/80 p-5 rounded-3xl mb-6 animate-bounce">
            <Sparkles size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#323232] mb-4">
            Discover What You&apos;re Great At! 🎯
          </h1>
          <p className="text-xl text-[#323232]/70 mb-2">
            Quick quiz, real results, zero boring stuff
          </p>
        </div>

        {/* What to Expect */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-6 border-2 border-brand-red/10">
          <h2 className="text-2xl font-bold text-[#323232] mb-6">What to expect</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-brand-red" />
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-1 text-[#323232]">~10 minutes</h3>
                <p className="text-[#323232]/70 text-sm">
                  Quick and fun. No stress, no wrong answers!
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-secondary-500/10 flex items-center justify-center">
                  <Target className="w-6 h-6 text-secondary-500" />
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-1 text-[#323232]">Made for you</h3>
                <p className="text-[#323232]/70 text-sm">
                  Questions adapt based on your answers
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-brand-red/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-brand-red" />
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-1 text-[#323232]">AI-powered</h3>
                <p className="text-[#323232]/70 text-sm">
                  Smart matching to find your perfect career
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-secondary-500/10 flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-secondary-500" />
                </div>
              </div>
              <div>
                <h3 className="font-bold mb-1 text-[#323232]">Real results</h3>
                <p className="text-[#323232]/70 text-sm">
                  Get actual job matches that fit you
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* No Experience Callout */}
        <div className="bg-gradient-to-br from-secondary-500/10 to-secondary-500/5 border-2 border-secondary-500/20 rounded-3xl p-6 mb-6">
          <h3 className="font-bold text-[#323232] mb-2 flex items-center gap-2">
            <span className="text-2xl">💪</span>
            No work experience? No worries!
          </h3>
          <p className="text-[#323232]/70">
            We'll ask about school, hobbies, gaming, volunteering, and everyday stuff. 
            Everyone has skills - we'll help you discover yours!
          </p>
        </div>

        {/* What You'll Get */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-8 border-2 border-brand-red/10">
          <h2 className="text-2xl font-bold text-[#323232] mb-6">What you'll get</h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-red to-brand-red/80 text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-sm">
                ✓
              </div>
              <span className="text-[#323232]">
                <strong>Your skills profile</strong> - See what you&apos;re naturally good at
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-red to-brand-red/80 text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-sm">
                ✓
              </div>
              <span className="text-[#323232]">
                <strong>Career matches</strong> - Jobs that actually fit your vibe
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-red to-brand-red/80 text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-sm">
                ✓
              </div>
              <span className="text-[#323232]">
                <strong>Personalized tips</strong> - How to level up your skills
              </span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-red to-brand-red/80 text-white flex items-center justify-center flex-shrink-0 mt-0.5 font-bold text-sm">
                ✓
              </div>
              <span className="text-[#323232]">
                <strong>Next steps</strong> - Clear path to your dream job
              </span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/quiz/start"
            className="inline-block bg-gradient-to-r from-brand-red to-brand-red/90 text-white px-12 py-5 rounded-full text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Let's Go! ✨
          </Link>
          <p className="text-sm text-[#323232]/50 mt-4">
            Free • No signup • Takes ~10 mins
          </p>
        </div>
      </div>
    </div>
  );
}
