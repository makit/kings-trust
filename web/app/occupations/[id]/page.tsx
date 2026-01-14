import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOccupationById, getSkillsForOccupation } from '@/lib/database';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default async function OccupationDetailPage({ params }: { params: { id: string } }) {
  const occupation = await getOccupationById(params.id);

  if (!occupation) {
    notFound();
  }

  const skills = await getSkillsForOccupation(params.id);

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {/* Back Link */}
        <Link
          href="/occupations"
          className="inline-flex items-center gap-2 text-brand-red font-medium mb-6 hover:gap-3 transition-all"
        >
          <ArrowLeft size={20} />
          Back
        </Link>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-4 border-2 border-brand-red/10">
          {/* Title with emoji indicator */}
          <div className="mb-4">
            <div className="inline-block bg-gradient-to-br from-brand-red to-brand-red/80 p-3 rounded-2xl mb-3">
              <Sparkles size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#323232] mb-2">
              {occupation.preferred_label}
            </h1>
          </div>

          {/* Description */}
          {occupation.description && (
            <div className="mb-6">
              <p className="text-[#323232] leading-relaxed text-base">
                {occupation.description}
              </p>
            </div>
          )}
        </div>

        {/* Skills Section */}
        {(skills.essential.length > 0 || skills.optional.length > 0) && (
          <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-secondary-500/10">
            <h2 className="text-xl font-bold text-[#323232] mb-4 flex items-center gap-2">
              <span className="text-2xl">💪</span>
              Skills You'll Need
            </h2>

            {/* Essential Skills */}
            {skills.essential.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-brand-red">Must Have</span>
                  <span className="text-xs text-[#323232]/60">({skills.essential.length})</span>
                </div>
                <div className="space-y-2">
                  {skills.essential.map((skill) => (
                    <Link
                      key={skill.id}
                      href={`/skills/${skill.id}`}
                      className="block p-3 bg-brand-red/5 border-2 border-brand-red/20 rounded-2xl hover:border-brand-red hover:shadow-md transition-all transform hover:scale-[1.02]"
                    >
                      <span className="font-medium text-[#323232]">
                        {skill.preferred_label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Skills */}
            {skills.optional.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-secondary-500">Nice to Have</span>
                  <span className="text-xs text-[#323232]/60">({skills.optional.length})</span>
                </div>
                <div className="space-y-2">
                  {skills.optional.map((skill) => (
                    <Link
                      key={skill.id}
                      href={`/skills/${skill.id}`}
                      className="block p-3 bg-secondary-500/5 border-2 border-secondary-500/20 rounded-2xl hover:border-secondary-500 hover:shadow-md transition-all transform hover:scale-[1.02]"
                    >
                      <span className="font-medium text-[#323232]">
                        {skill.preferred_label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
