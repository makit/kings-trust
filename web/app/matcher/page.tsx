export default function MatcherPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Skills to Occupation Matcher
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Coming soon! This feature will help you match your skills to the best occupations.
        </p>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
          <p className="text-gray-700">
            The matcher will allow you to:
          </p>
          <ul className="text-left mt-4 space-y-2 text-gray-700">
            <li>• Select multiple skills you possess</li>
            <li>• Get matched with occupations based on skill requirements</li>
            <li>• See match scores and skill gap analysis</li>
            <li>• Filter and sort results</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
