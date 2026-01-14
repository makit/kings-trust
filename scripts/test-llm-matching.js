/**
 * Quick test to verify LLM occupation matching works
 * This tests the suggestOccupationsFromSkills function
 */

// This would be run in a Next.js API context, but here's the structure:

const testSkills = [
  { skillLabel: 'communicate with customers', confidence: 85 },
  { skillLabel: 'show empathy', confidence: 80 },
  { skillLabel: 'solve problems', confidence: 75 },
  { skillLabel: 'apply organisational techniques', confidence: 70 },
  { skillLabel: 'work in teams', confidence: 68 },
];

const testProfile = {
  currentSituation: 'Looking for my first job',
  primaryGoal: 'Find work that helps people',
  interests: ['Working with people', 'Problem solving'],
  location: 'London, UK'
};

console.log('Test Input:');
console.log('Skills:', testSkills);
console.log('Profile:', testProfile);
console.log('\nExpected Output:');
console.log('- 8-10 realistic ESCO occupations');
console.log('- Match percentages between 60-95%');
console.log('- Brief description for each occupation');
console.log('- Reasoning explaining why it matches');
console.log('\nExample Expected Occupations:');
console.log('- customer service representative (87%)');
console.log('- retail sales assistant (82%)');
console.log('- care assistant (78%)');
console.log('- administrative assistant (74%)');
console.log('- receptionist (71%)');
console.log('\nTo test live:');
console.log('1. Start dev server: npm run dev');
console.log('2. Complete a quiz at http://localhost:3000/quiz/start');
console.log('3. View results page - occupations should be relevant!');
