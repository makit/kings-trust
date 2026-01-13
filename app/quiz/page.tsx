export default function QuizPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center py-20">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Skills Assessment Quiz
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Coming soon! Take an interactive quiz to discover your skills and get occupation recommendations.
        </p>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 max-w-2xl mx-auto">
          <p className="text-gray-700">
            The quiz will feature:
          </p>
          <ul className="text-left mt-4 space-y-2 text-gray-700">
            <li>• 20+ questions across multiple stages</li>
            <li>• Different question types (yes/no, proficiency, scenario-based)</li>
            <li>• Skill inference engine</li>
            <li>• Personalized occupation recommendations</li>
            <li>• Save and resume functionality</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
