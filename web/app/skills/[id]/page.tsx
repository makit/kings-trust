import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSkillById, getOccupationsForSkill } from '@/lib/database';
import { ArrowLeft, Zap } from 'lucide-react';

export default async function SkillDetailPage({ params }: { params: { id: string } }) {
  const skill = await getSkillById(params.id);

  if (!skill) {
    notFound();
  }

  const occupations = await getOccupationsForSkill(params.id);

  return (
    <div className="min-h-screen pb-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        {/* Back Link */}
        <Link
          href="/skills"
          className="inline-flex items-center gap-2 text-brand-red font-medium mb-6 hover:gap-3 transition-all"
        >
          <ArrowLeft size={20} />
          Back
        </Link>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-4 border-2 border-secondary-500/10">
          {/* Title with icon */}
          <div className="mb-4">
            <div className="inline-block bg-gradient-to-br from-secondary-500 to-secondary-600 p-3 rounded-2xl mb-3">
              <Zap size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-[#323232] mb-2">
              {skill.preferred_label}
            </h1>
          </div>

          {/* Description */}
          {skill.description && (
            <div className="mb-4">
              <p className="text-[#323232] leading-relaxed text-base">
                {skill.description}
              </p>
            </div>
          )}
        </div>

        {/* Jobs using this skill */}
        {(occupations.essential.length > 0 || occupations.optional.length > 0) && (
          <div className="bg-white rounded-3xl shadow-lg p-6 border-2 border-brand-red/10">
            <h2 className="text-xl font-bold text-[#323232] mb-4 flex items-center gap-2">
              <span className="text-2xl">💼</span>
              Jobs Using This Skill
            </h2>

            {/* Essential */}
            {occupations.essential.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-brand-red">Required for</span>
                  <span className="text-xs text-[#323232]/60">({occupations.essential.length})</span>
                </div>
                <div className="space-y-2">
                  {occupations.essential.map((occupation) => (
                    <Link
                      key={occupation.id}
                      href={`/occupations/${occupation.id}`}
                      className="block p-4 bg-brand-red/5 border-2 border-brand-red/20 rounded-2xl hover:border-brand-red hover:shadow-md transition-all transform hover:scale-[1.02]"
                    >
                      <h3 className="font-semibold text-[#323232] mb-1">
                        {occupation.preferred_label}
                      </h3>
                      {occupation.description && (
                        <p className="text-sm text-[#323232]/70 line-clamp-2">
                          {occupation.description}
                        </p>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Optional */}
            {occupations.optional.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-semibold text-secondary-500">Nice to have for</span>
                  <span className="text-xs text-[#323232]/60">({occupations.optional.length})</span>
                </div>
                <div className="space-y-2">
                  {occupations.optional.map((occupation) => (
                    <Link
                      key={occupation.id}
                      href={`/occupations/${occupation.id}`}
                      className="block p-4 bg-secondary-500/5 border-2 border-secondary-500/20 rounded-2xl hover:border-secondary-500 hover:shadow-md transition-all transform hover:scale-[1.02]"
                    >
                      <h3 className="font-semibold text-[#323232] mb-1">
                        {occupation.preferred_label}
                      </h3>
                      {occupation.description && (
                        <p className="text-sm text-[#323232]/70 line-clamp-2">
                          {occupation.description}
                        </p>
                      )}
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
