import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getOccupationById, getSkillsForOccupation, parseAltLabels } from '@/lib/database';
import { ArrowLeft, Tag, Lightbulb, AlertCircle } from 'lucide-react';

export default async function OccupationDetailPage({ params }: { params: { id: string } }) {
  const occupation = await getOccupationById(params.id);

  if (!occupation) {
    notFound();
  }

  const skills = await getSkillsForOccupation(params.id);
  const altLabels = parseAltLabels(occupation.alt_labels);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Link */}
      <Link
        href="/occupations"
        className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Occupations
      </Link>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {occupation.preferred_label}
          </h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
              {occupation.occupation_type === 'escooccupation' ? 'ESCO Occupation' : 'Local Occupation'}
            </span>
            {occupation.isco_group_code && (
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                ISCO Group: {occupation.isco_group_code}
              </span>
            )}
            {occupation.is_localized === 1 && (
              <span className="px-3 py-1 bg-optional-100 text-optional-700 rounded-full text-sm font-medium">
                Localized
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {occupation.description && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-gray-700 leading-relaxed">{occupation.description}</p>
          </div>
        )}

        {/* Definition */}
        {occupation.definition && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Definition</h2>
            <p className="text-gray-700 leading-relaxed">{occupation.definition}</p>
          </div>
        )}

        {/* Scope Note */}
        {occupation.scope_note && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Scope Note</h2>
            <p className="text-gray-700 leading-relaxed">{occupation.scope_note}</p>
          </div>
        )}

        {/* Regulated Profession Note */}
        {occupation.regulated_profession_note && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              <AlertCircle size={20} />
              Regulated Profession
            </h2>
            <p className="text-yellow-800 leading-relaxed">{occupation.regulated_profession_note}</p>
          </div>
        )}

        {/* Alternative Labels */}
        {altLabels.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              <Tag className="inline mr-2" size={20} />
              Alternative Names
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

      {/* Required Skills */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          <Lightbulb className="inline mr-2" size={24} />
          Required Skills
        </h2>

        {/* Essential Skills */}
        {skills.essential.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-essential-600 mb-4">
              Essential Skills ({skills.essential.length})
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              These skills are must-have requirements for this occupation.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {skills.essential.map((skill) => (
                <Link
                  key={skill.id}
                  href={`/skills/${skill.id}`}
                  className="p-4 border-2 border-essential-200 bg-essential-50 rounded-lg hover:border-essential-400 hover:shadow-md transition-all"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {skill.preferred_label}
                  </h4>
                  {skill.skill_type && (
                    <span className="text-xs text-essential-600">
                      {skill.skill_type}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Optional Skills */}
        {skills.optional.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-optional-600 mb-4">
              Optional Skills ({skills.optional.length})
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              These skills are beneficial but not required for this occupation.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {skills.optional.map((skill) => (
                <Link
                  key={skill.id}
                  href={`/skills/${skill.id}`}
                  className="p-4 border border-optional-200 bg-optional-50 rounded-lg hover:border-optional-400 hover:shadow-md transition-all"
                >
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {skill.preferred_label}
                  </h4>
                  {skill.skill_type && (
                    <span className="text-xs text-optional-600">
                      {skill.skill_type}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {skills.essential.length === 0 && skills.optional.length === 0 && (
          <p className="text-gray-500 italic">
            No skills currently defined for this occupation.
          </p>
        )}
      </div>
    </div>
  );
}
