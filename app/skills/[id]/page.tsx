import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSkillById, getOccupationsForSkill, parseAltLabels } from '@/lib/database';
import { ArrowLeft, Briefcase, Tag } from 'lucide-react';

export default async function SkillDetailPage({ params }: { params: { id: string } }) {
  const skill = await getSkillById(params.id);

  if (!skill) {
    notFound();
  }

  const occupations = await getOccupationsForSkill(params.id);
  const altLabels = parseAltLabels(skill.alt_labels);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        href="/skills"
        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Skills
      </Link>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {skill.preferred_label}
          </h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            {skill.skill_type && (
              <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                {skill.skill_type}
              </span>
            )}
            {skill.reuse_level && (
              <span className="px-3 py-1 bg-optional-100 text-optional-700 rounded-full text-sm font-medium">
                {skill.reuse_level}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {skill.description && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed">{skill.description}</p>
          </div>
        )}

        {/* Definition */}
        {skill.definition && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Definition</h2>
            <p className="text-gray-700 leading-relaxed">{skill.definition}</p>
          </div>
        )}

        {/* Scope Note */}
        {skill.scope_note && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Scope Note</h2>
            <p className="text-gray-700 leading-relaxed">{skill.scope_note}</p>
          </div>
        )}

        {/* Alternative Labels */}
        {altLabels.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              <Tag className="inline mr-2" size={20} />
              Alternative Labels
            </h2>
            <div className="flex flex-wrap gap-2">
              {altLabels.map((label, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Occupations that require this skill */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          <Briefcase className="inline mr-2" size={24} />
          Occupations Using This Skill
        </h2>

        {/* Essential Skills */}
        {occupations.essential.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-essential-600 mb-4">
              Essential Skill ({occupations.essential.length})
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {occupations.essential.map((occupation) => (
                <Link
                  key={occupation.id}
                  href={`/occupations/${occupation.id}`}
                  className="p-4 border border-essential-200 rounded-lg hover:border-essential-400 hover:shadow-md transition-all"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {occupation.preferred_label}
                  </h4>
                  {occupation.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {occupation.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Optional Skills */}
        {occupations.optional.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-optional-600 mb-4">
              Optional Skill ({occupations.optional.length})
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {occupations.optional.map((occupation) => (
                <Link
                  key={occupation.id}
                  href={`/occupations/${occupation.id}`}
                  className="p-4 border border-optional-200 rounded-lg hover:border-optional-400 hover:shadow-md transition-all"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {occupation.preferred_label}
                  </h4>
                  {occupation.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {occupation.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {occupations.essential.length === 0 && occupations.optional.length === 0 && (
          <p className="text-gray-500 italic">
            No occupations currently list this skill.
          </p>
        )}
      </div>
    </div>
  );
}
