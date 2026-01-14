import Link from 'next/link';
import { getAllSkills, parseAltLabels } from '@/lib/database';
import SkillFilters from '@/components/skills/SkillFilters';

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; skillType?: string; reuseLevel?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const limit = 50;
  const offset = (page - 1) * limit;

  const filters: any = {};
  if (searchParams.skillType) filters.skillType = searchParams.skillType;
  if (searchParams.reuseLevel) filters.reuseLevel = searchParams.reuseLevel;
  if (searchParams.search) filters.search = searchParams.search;

  const { skills, total } = await getAllSkills(limit, offset, filters);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Skills Browser</h1>
        <p className="text-lg text-gray-600">
          Explore {total.toLocaleString()} skills from the ESCO taxonomy
        </p>
      </div>

      {/* Search and Filters */}
      <SkillFilters />

      {/* Results */}
      <div className="space-y-4">
        {skills.map((skill) => {
          const altLabels = parseAltLabels(skill.alt_labels);
          return (
            <Link
              key={skill.id}
              href={`/skills/${skill.id}`}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary-300 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {skill.preferred_label}
                  </h3>
                  {skill.description && (
                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {skill.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
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
                    {altLabels.length > 0 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        +{altLabels.length} alternative labels
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {page > 1 && (
            <Link
              href={`/skills?page=${page - 1}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.skillType ? `&skillType=${searchParams.skillType}` : ''}${searchParams.reuseLevel ? `&reuseLevel=${searchParams.reuseLevel}` : ''}`}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Previous
            </Link>
          )}
          
          <span className="px-4 py-2 bg-primary-600 text-white rounded-lg">
            Page {page} of {totalPages}
          </span>
          
          {page < totalPages && (
            <Link
              href={`/skills?page=${page + 1}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.skillType ? `&skillType=${searchParams.skillType}` : ''}${searchParams.reuseLevel ? `&reuseLevel=${searchParams.reuseLevel}` : ''}`}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
