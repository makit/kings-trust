import Link from 'next/link';
import { Github, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="text-white font-semibold mb-4">About</h3>
            <p className="text-sm mb-4">
              A platform to help users discover career opportunities based on their skills 
              using ESCO taxonomy data.
            </p>
            <div className="flex gap-3">
              <a href="https://github.com" className="hover:text-white transition-colors">
                <Github size={20} />
              </a>
              <a href="mailto:contact@example.com" className="hover:text-white transition-colors">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-white font-semibold mb-4">Explore</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/skills" className="hover:text-white transition-colors">
                  Browse Skills
                </Link>
              </li>
              <li>
                <Link href="/occupations" className="hover:text-white transition-colors">
                  Browse Occupations
                </Link>
              </li>
              <li>
                <Link href="/isco-groups" className="hover:text-white transition-colors">
                  ISCO Groups
                </Link>
              </li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h3 className="text-white font-semibold mb-4">Tools</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/matcher" className="hover:text-white transition-colors">
                  Skills Matcher
                </Link>
              </li>
              <li>
                <Link href="/quiz" className="hover:text-white transition-colors">
                  Skills Quiz
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="https://esco.ec.europa.eu/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  ESCO Portal
                </a>
              </li>
              <li>
                <a
                  href="https://tabiya.tech/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  Tabiya Open Taxonomy
                </a>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About This Platform
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>
            © {new Date().getFullYear()} ESCO Skills Platform. Data from{' '}
            <a
              href="https://esco.ec.europa.eu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-400 hover:text-primary-300"
            >
              ESCO
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
