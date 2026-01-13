'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Briefcase, Search } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-600">
            <Briefcase size={28} />
            <span>ESCO Platform</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/skills"
              className={`font-medium transition-colors ${
                isActive('/skills')
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Skills
            </Link>
            <Link
              href="/occupations"
              className={`font-medium transition-colors ${
                isActive('/occupations')
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Occupations
            </Link>
            <Link
              href="/matcher"
              className={`font-medium transition-colors ${
                isActive('/matcher')
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Matcher
            </Link>
            <Link
              href="/quiz"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isActive('/quiz')
                  ? 'bg-primary-600 text-white'
                  : 'bg-primary-100 text-primary-600 hover:bg-primary-200'
              }`}
            >
              Take Quiz
            </Link>
          </nav>

          {/* Mobile menu button - simplified for now */}
          <button className="md:hidden p-2 text-gray-600">
            <Search size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}
