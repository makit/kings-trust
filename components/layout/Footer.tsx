import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t-2 border-brand-red/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-[#323232]/70 flex items-center gap-2">
            Made with <Heart size={16} className="text-brand-red fill-brand-red inline animate-pulse" /> by King&apos;s Trust
          </p>
          <p className="text-xs text-[#323232]/50">
            Helping young people discover their career path
          </p>
        </div>
      </div>
    </footer>
  );
}
