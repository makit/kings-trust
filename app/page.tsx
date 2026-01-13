import Link from 'next/link';
import { Sparkles, Target, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="inline-block bg-gradient-to-br from-brand-red to-brand-red/80 p-5 rounded-3xl mb-6 animate-bounce float">
          <Sparkles size={48} className="text-white" />
        </div>
        
        <h1 className="text-5xl md:text-6xl font-bold text-[#323232] mb-6 animate-slide-up">
          Find Your Perfect Path 🎯
        </h1>
        
        <p className="text-xl md:text-2xl text-[#323232]/70 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '100ms' }}>
          Discover careers that match your vibe. Quick quiz, real results, zero boring stuff.
        </p>
        
        <Link
          href="/quiz/start"
          className="inline-block bg-gradient-to-r from-brand-red to-brand-red/90 text-white px-10 py-5 rounded-full font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 transition-all duration-200 animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          Let's Go! ✨
        </Link>

        <p className="text-sm text-[#323232]/50 mt-6">
          Takes about 10 minutes · No signup required
        </p>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-brand-red/10 hover:border-brand-red/30 transition-all hover:shadow-xl transform hover:scale-[1.02]">
            <div className="bg-gradient-to-br from-brand-red to-brand-red/80 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
              <Target className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#323232]">Super Quick</h3>
            <p className="text-[#323232]/70">
              About 10 minutes. Answer questions about what you like and what you're good at.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-secondary-500/10 hover:border-secondary-500/30 transition-all hover:shadow-xl transform hover:scale-[1.02]">
            <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
              <Zap className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#323232]">Made For You</h3>
            <p className="text-[#323232]/70">
              Questions adapt to your answers. Get personalized career matches that actually fit.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-3xl shadow-lg border-2 border-brand-red/10 hover:border-brand-red/30 transition-all hover:shadow-xl transform hover:scale-[1.02]">
            <div className="bg-gradient-to-br from-brand-red to-brand-red/80 w-14 h-14 rounded-2xl flex items-center justify-center mb-4">
              <Sparkles className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2 text-[#323232]">Real Jobs</h3>
            <p className="text-[#323232]/70">
              Discover actual careers you might love, with skills you already have or can learn.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-br from-brand-red to-brand-red/90 text-white mt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Discover What You're Great At? 🚀
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of young people finding their path with King's Trust
          </p>
          <Link
            href="/quiz/start"
            className="inline-block bg-white text-brand-red px-10 py-5 rounded-full font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 active:scale-95 transition-all duration-200"
          >
            Start Your Quiz ✨
          </Link>
        </div>
      </div>
    </div>
  );
}
