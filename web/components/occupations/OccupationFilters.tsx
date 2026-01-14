'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export default function OccupationFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    router.push(`/occupations?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const search = formData.get('search') as string;
    const params = new URLSearchParams(searchParams.toString());
    if (search) {
      params.set('search', search);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/occupations?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="grid md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="md:col-span-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              name="search"
              defaultValue={searchParams.get('search') || ''}
              placeholder="Search occupations..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </form>
        </div>

        {/* Occupation Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Occupation Type
          </label>
          <select
            name="occupationType"
            value={searchParams.get('occupationType') || ''}
            onChange={(e) => handleFilterChange('occupationType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="escooccupation">ESCO Occupation</option>
            <option value="localoccupation">Local Occupation</option>
          </select>
        </div>

        {/* ISCO Group Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ISCO Group Code
          </label>
          <input
            type="text"
            name="iscoGroupCode"
            value={searchParams.get('iscoGroupCode') || ''}
            onChange={(e) => handleFilterChange('iscoGroupCode', e.target.value)}
            placeholder="e.g., 1120"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Reset Filters */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => router.push('/occupations')}
            className="w-full px-4 py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}
