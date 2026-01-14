/**
 * Quiz Results Page
 * Display identified skills and occupation recommendations
 */

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Brain, Briefcase, TrendingUp, Award, Loader2 } from 'lucide-react';

interface QuizResult {
  identifiedSkills: Array<{
    skillLabel: string;
    confidence: number;
    proficiencyLevel?: string;
  }>;
  topOccupations: Array<{
    occupation: {
      id: string;
      preferredLabel: string;
      description?: string;
      conceptUri: string;
    };
    matchScore: number;
    reasoning?: string;
  }>;
  aiInsights?: {
    executiveSummary: string;
    keyStrengths: string[];
    growthOpportunities: string[];
    careerRecommendations: string;
    learningPath: string[];
    encouragement: string;
  };
  userProfile: {
    currentSituation?: string;
    primaryGoal?: string;
    dateOfBirth?: string;
    location?: string;
  };
  stats: {
    questionsAnswered: number;
    totalSkillsIdentified: number;
  };
  debugInfo?: {
    dob: string;
    location: string;
    topClusters: Array<{
      id: string;
      name: string;
      probability: number;
    }>;
    totalSkills: number;
    highConfidenceSkills: number;
  };
  clusterAnalysis?: {
    description: string;
    topClusters: Array<{
      id: string;
      name: string;
      description: string;
      probability: number;
    }>;
  };
}

export default function QuizResultsPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [result, setResult] = useState<QuizResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadResults() {
      try {
        const response = await fetch(`/api/quiz/results/${sessionId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load results');
        }

        const data = await response.json();
        setResult(data);
      } catch (err: any) {
        console.error('Error loading results:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadResults();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto mb-6" />
        <h2 className="text-2xl font-semibold mb-2">Analyzing your results...</h2>
        <p className="text-gray-600">Matching your skills to careers</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="container mx-auto px-4 py-24 max-w-md text-center">
        <p className="text-red-600 mb-4">Failed to load results</p>
        <Link href="/quiz" className="text-primary hover:underline">
          Start a new quiz
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      {/* Debug Info Section (collapsible) */}
      {result.debugInfo && (
        <details className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 mb-6">
          <summary className="cursor-pointer font-semibold text-sm text-gray-700 hover:text-brand-red">
            🔍 Debug Info (Click to expand)
          </summary>
          <div className="mt-4 space-y-2 text-sm">
            <p><strong>DOB:</strong> {result.debugInfo.dob}</p>
            <p><strong>Location:</strong> {result.debugInfo.location}</p>
            <p><strong>Top Clusters:</strong></p>
            <ul className="ml-4 space-y-1">
              {result.debugInfo.topClusters.map((cluster: any, i: number) => (
                <li key={i}>• {cluster.name}: {cluster.probability}%</li>
              ))}
            </ul>
            <p><strong>Total Skills:</strong> {result.debugInfo.totalSkills}</p>
            <p><strong>High Confidence Skills (≥60%):</strong> {result.debugInfo.highConfidenceSkills}</p>
          </div>
        </details>
      )}

      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6">
          <Award className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Your Skills Profile</h1>
        <p className="text-xl text-gray-600">
          We've identified <strong>{result.stats.totalSkillsIdentified} skills</strong> and found <strong>{result.topOccupations.length} matching careers</strong>
        </p>
      </div>

      {/* Cluster Analysis */}
      {result.clusterAnalysis && result.clusterAnalysis.topClusters.length > 0 && (
        <div className="bg-gradient-to-br from-brand-red/10 to-secondary-500/10 rounded-3xl p-6 mb-8 border-2 border-brand-red/20">
          <h2 className="text-2xl font-bold text-[#323232] mb-3 flex items-center gap-2">
            <span className="text-3xl">🎯</span>
            Your Career Personality
          </h2>
          <p className="text-lg text-[#323232] mb-4">
            {result.clusterAnalysis.description}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {result.clusterAnalysis.topClusters.map((cluster: any, i: number) => (
              <div key={i} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-[#323232]">{cluster.name}</span>
                  <span className="text-2xl">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-brand-red to-secondary-500 h-2 rounded-full"
                    style={{ width: `${cluster.probability}%` }}
                  />
                </div>
                <p className="text-sm text-[#323232]/70 mt-1">{cluster.probability}% match</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights (if available) */}
      {result.aiInsights && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-8 mb-8 border border-purple-200">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-6 h-6 text-purple-600" />
            <h2 className="text-2xl font-bold">AI-Powered Insights</h2>
          </div>
          
          <p className="text-lg text-gray-800 mb-6 leading-relaxed">
            {result.aiInsights.executiveSummary}
          </p>

          {result.aiInsights.keyStrengths.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Your Key Strengths</h3>
              <ul className="space-y-2">
                {result.aiInsights.keyStrengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-600 font-bold">✓</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.aiInsights.encouragement && (
            <div className="bg-white/80 rounded-lg p-4 mt-6">
              <p className="text-gray-800 italic">"{result.aiInsights.encouragement}"</p>
            </div>
          )}
        </div>
      )}

      {/* Identified Skills */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          Your Skills
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {result.identifiedSkills
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 12)
            .map((skill, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
              >
                <span className="font-medium text-gray-900">{skill.skillLabel}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${skill.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 w-10 text-right">
                    {skill.confidence}%
                  </span>
                </div>
              </div>
            ))}
        </div>

        {result.identifiedSkills.length > 12 && (
          <p className="text-center text-gray-500 mt-4">
            And {result.identifiedSkills.length - 12} more skills...
          </p>
        )}
      </div>

      {/* Career Matches */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-primary" />
          Career Matches
        </h2>
        
        <div className="space-y-4">
          {result.topOccupations.slice(0, 10).map((match, i) => (
            <div
              key={i}
              className="block p-5 border-2 border-gray-200 rounded-lg hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-xl text-gray-900 mb-1">
                    {match.occupation.preferredLabel}
                  </h3>
                  {match.occupation.description && (
                    <p className="text-sm text-gray-600 mb-2">
                      {match.occupation.description}
                    </p>
                  )}
                  {match.reasoning && (
                    <p className="text-sm text-brand-red/80 italic">
                      💡 {match.reasoning}
                    </p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <div className="text-3xl font-bold text-primary">
                    {match.matchScore}%
                  </div>
                  <div className="text-xs text-gray-500">match</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <p className="text-sm text-gray-500 mt-6 text-center">
          💡 Career suggestions powered by AI based on your demonstrated skills
        </p>
      </div>

      {/* Growth Opportunities */}
      {result.aiInsights?.growthOpportunities && result.aiInsights.growthOpportunities.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">Skills to Develop</h2>
          <p className="text-gray-700 mb-4">
            Here are some skills that could open up even more opportunities for you:
          </p>
          <ul className="space-y-2">
            {result.aiInsights.growthOpportunities.map((opportunity, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-600">→</span>
                <span className="text-gray-800">{opportunity}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="text-center space-y-4">
        <Link
          href="/skills"
          className="inline-block bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          Explore All Skills
        </Link>
        
        <div className="text-sm text-gray-500">
          <Link href="/quiz" className="hover:text-primary hover:underline">
            Take the quiz again
          </Link>
        </div>
      </div>
    </div>
  );
}
