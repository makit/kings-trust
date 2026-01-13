import Link from 'next/link';
import { getAllOccupations, parseAltLabels } from '@/lib/database';
import { Building2 } from 'lucide-react';
import OccupationFilters from '@/components/occupations/OccupationFilters';

export default async function OccupationsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string; occupationType?: string; iscoGroupCode?: string };
}) {
  const page = parseInt(searchParams.page || '1');
  const limit = 50;
  const offset = (page - 1) * limit;

  const filters: any = {};
  if (searchParams.occupationType) filters.occupationType = searchParams.occupationType;
  if (searchParams.iscoGroupCode) filters.iscoGroupCode = searchParams.iscoGroupCode;
  if (searchParams.search) filters.search = searchParams.search;

  const { occupations, total } = await getAllOccupations(limit, offset, filters);
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Occupations Browser</h1>
        <p className="text-lg text-gray-600">
          Explore {total.toLocaleString()} occupations from the ESCO taxonomy
        </p>
      </div>

      {/* Search and Filters */}
      <OccupationFilters />

      {/* Results */}
      <div className="space-y-4">
        {occupations.map((occupation) => {
          const altLabels = parseAltLabels(occupation.alt_labels);
          return (
            <Link
              key={occupation.id}
              href={`/occupations/${occupation.id}`}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md hover:border-primary-300 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-2">
                    <Building2 className="text-primary-600 mt-1" size={24} />
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-1">
                        {occupation.preferred_label}
                      </h3>
                      {occupation.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {occupation.description}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                      {occupation.occupation_type === 'escooccupation' ? 'ESCO' : 'Local'}
                    </span>
                    {occupation.isco_group_code && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                        ISCO: {occupation.isco_group_code}
                      </span>
                    )}
                    {altLabels.length > 0 && (
                      <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        +{altLabels.length} alternative names
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
              href={`/occupations?page=${page - 1}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.occupationType ? `&occupationType=${searchParams.occupationType}` : ''}${searchParams.iscoGroupCode ? `&iscoGroupCode=${searchParams.iscoGroupCode}` : ''}`}
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
              href={`/occupations?page=${page + 1}${searchParams.search ? `&search=${searchParams.search}` : ''}${searchParams.occupationType ? `&occupationType=${searchParams.occupationType}` : ''}${searchParams.iscoGroupCode ? `&iscoGroupCode=${searchParams.iscoGroupCode}` : ''}`}
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
