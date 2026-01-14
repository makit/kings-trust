import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        About This Platform
      </h1>
      
      <div className="prose prose-lg max-w-none">
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What is ESCO?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            ESCO (European Skills, Competences, Qualifications and Occupations) is the European 
            multilingual classification of skills, competences, qualifications and occupations. 
            It provides a common language to describe occupations and skills that can be used 
            by different stakeholders across education, employment and training sectors.
          </p>
          <p className="text-gray-700 leading-relaxed">
            ESCO is part of the Europa 2020 strategy and supports job mobility across Europe 
            and a more integrated and efficient labour market.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">About This Platform</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            This platform helps users discover career opportunities based on their skills using 
            ESCO taxonomy data. Whether you&apos;re exploring new career paths, looking to upskill, 
            or trying to understand what occupations match your abilities, this tool provides 
            insights based on standardized European classification data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Key Features</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex gap-3">
              <span className="text-primary-600 font-bold">•</span>
              <span><strong>Skills Browser:</strong> Explore over 13,000 skills categorized by type and reuse level</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-600 font-bold">•</span>
              <span><strong>Occupations Browser:</strong> Browse 3,000+ occupation profiles with detailed requirements</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-600 font-bold">•</span>
              <span><strong>Skills Matcher:</strong> Input your skills and get matched with suitable occupations</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary-600 font-bold">•</span>
              <span><strong>Skills Assessment Quiz:</strong> Take an interactive quiz to identify your skills</span>
            </li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Source</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            All data on this platform comes from the{' '}
            <a
              href="https://esco.ec.europa.eu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              ESCO Portal
            </a>
            {' '}via{' '}
            <a
              href="https://tabiya.tech/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary-600 hover:text-primary-700 underline"
            >
              Tabiya Open Taxonomy
            </a>
            . The data includes skills, occupations, ISCO groups, and their relationships.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Understanding Skills</h2>
          <div className="bg-gray-50 p-6 rounded-lg mb-4">
            <h3 className="font-semibold text-gray-900 mb-2">Skill Types:</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li><strong>Skill/Competence:</strong> Ability to apply knowledge and use know-how</li>
              <li><strong>Knowledge:</strong> Body of facts, principles, theories and practices</li>
              <li><strong>Language:</strong> Ability to communicate in different languages</li>
              <li><strong>Attitude:</strong> Disposition or state of mind</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">Reuse Levels:</h3>
            <ul className="space-y-2 text-gray-700 text-sm">
              <li><strong>Transversal:</strong> Applicable across all sectors and occupations</li>
              <li><strong>Cross-sector:</strong> Relevant to multiple but not all sectors</li>
              <li><strong>Sector-specific:</strong> Specific to one particular sector</li>
              <li><strong>Occupation-specific:</strong> Unique to a specific occupation</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get Started</h2>
          <div className="flex gap-4">
            <Link
              href="/skills"
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Skills
            </Link>
            <Link
              href="/occupations"
              className="px-6 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Browse Occupations
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
