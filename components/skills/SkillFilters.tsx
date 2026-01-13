'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

export default function SkillFilters() {
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
    router.push(`/skills?${params.toString()}`);
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
    router.push(`/skills?${params.toString()}`);
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
              placeholder="Search skills..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </form>
        </div>

        {/* Skill Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Skill Type
          </label>
          <select
            name="skillType"
            value={searchParams.get('skillType') || ''}
            onChange={(e) => handleFilterChange('skillType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Types</option>
            <option value="skill/competence">Skill/Competence</option>
            <option value="knowledge">Knowledge</option>
            <option value="language">Language</option>
            <option value="attitude">Attitude</option>
          </select>
        </div>

        {/* Reuse Level Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reuse Level
          </label>
          <select
            name="reuseLevel"
            value={searchParams.get('reuseLevel') || ''}
            onChange={(e) => handleFilterChange('reuseLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            <option value="">All Levels</option>
            <option value="transversal">Transversal</option>
            <option value="cross-sector">Cross-sector</option>
            <option value="sector-specific">Sector-specific</option>
            <option value="occupation-specific">Occupation-specific</option>
          </select>
        </div>

        {/* Reset Filters */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={() => router.push('/skills')}
            className="w-full px-4 py-2 text-center border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
}
