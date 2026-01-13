import Link from 'next/link';
import { Briefcase, Lightbulb, Users, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Discover Your Career Path
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Explore career opportunities matched to your skills with The King&apos;s Trust Career AI.
            Powered by European Skills taxonomy data.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/quiz"
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
            >
              Take Skills Quiz
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/matcher"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold border-2 border-primary-600 hover:bg-primary-50 transition-colors"
            >
              Match Skills to Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="bg-primary-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Lightbulb className="text-primary-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Explore Skills</h3>
            <p className="text-gray-600 mb-4">
              Browse through thousands of skills categorized by type, reuse level, and skill groups. 
              Discover what makes you unique.
            </p>
            <Link href="/skills" className="text-primary-600 font-medium hover:text-primary-700 inline-flex items-center gap-1">
              Browse Skills
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="bg-essential-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Briefcase className="text-essential-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Find Occupations</h3>
            <p className="text-gray-600 mb-4">
              Search through occupation listings with detailed skill requirements. See which careers 
              match your experience.
            </p>
            <Link href="/occupations" className="text-primary-600 font-medium hover:text-primary-700 inline-flex items-center gap-1">
              Browse Occupations
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="bg-optional-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
              <Users className="text-optional-600" size={24} />
            </div>
            <h3 className="text-xl font-semibold mb-3">Get Matched</h3>
            <p className="text-gray-600 mb-4">
              Use our smart matching algorithm to find occupations that fit your skill profile. 
              See gap analysis and recommendations.
            </p>
            <Link href="/matcher" className="text-primary-600 font-medium hover:text-primary-700 inline-flex items-center gap-1">
              Try Matcher
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Not Sure Where to Start?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Take our interactive skills assessment quiz to discover your strengths 
            and get personalized occupation recommendations.
          </p>
          <Link
            href="/quiz"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors inline-flex items-center gap-2"
          >
            Start Skills Quiz
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl font-bold text-primary-600 mb-2">13,000+</div>
            <div className="text-gray-600">Skills in Database</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary-600 mb-2">3,000+</div>
            <div className="text-gray-600">Occupation Profiles</div>
          </div>
          <div>
            <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
            <div className="text-gray-600">Powered by European Skills Data</div>
          </div>
        </div>
      </div>
    </div>
  );
}
