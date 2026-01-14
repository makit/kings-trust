'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  return (
    <header className="bg-white border-b-2 border-brand-red/10 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg group">
            <div className="bg-gradient-to-br from-brand-red to-brand-red/80 p-2 rounded-2xl transform group-hover:rotate-12 transition-transform duration-300">
              <Sparkles size={20} className="text-white" />
            </div>
            <span className="text-[#323232]">King&apos;s Trust</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-3">
            <Link
              href="/quiz"
              className={`
                px-5 py-2.5 rounded-full font-semibold text-sm
                transform hover:scale-105 active:scale-95
                transition-all duration-200 shadow-md hover:shadow-lg
                ${isActive('/quiz')
                  ? 'bg-brand-red text-white'
                  : 'bg-white text-brand-red border-2 border-brand-red'
                }
              `}
            >
              ✨ Take Quiz
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
