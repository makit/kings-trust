/**
 * Test script to verify skill code mapping
 * Run with: node scripts/test-skill-mapping.js
 */

const { translateSkillCode, isLegacySkillCode, SKILL_CODE_MAPPING } = require('../lib/skill-code-mapping');

console.log('=== Testing Skill Code Mapping ===\n');

// Test legacy code detection
console.log('1. Testing legacy code detection:');
console.log(`   S2.2.1 is legacy: ${isLegacySkillCode('S2.2.1')}`); // Should be true
console.log(`   key_7837 is legacy: ${isLegacySkillCode('key_7837')}`); // Should be false
console.log();

// Test translations
console.log('2. Testing S-code translations:');
const testCodes = [
  'S1.0.1', // Communication
  'S2.2.1', // Empathy
  'S1.3.1', // Analytical thinking
  'S9.3.3', // Conflict resolution
  'S4.3.1', // Budget management
  'S6.1.1', // Design
  'S10.2.1', // Risk assessment
];

testCodes.forEach(code => {
  const translated = translateSkillCode(code);
  console.log(`   ${code} → ${translated}`);
});
console.log();

// Test that real ESCO codes pass through unchanged
console.log('3. Testing real ESCO codes (should pass through):');
const realCodes = ['key_7837', 'key_10726', 'key_2927'];
realCodes.forEach(code => {
  const translated = translateSkillCode(code);
  console.log(`   ${code} → ${translated} (${code === translated ? '✓ unchanged' : '✗ ERROR'})`);
});
console.log();

// Count mappings
console.log('4. Summary:');
const mappingCount = Object.keys(SKILL_CODE_MAPPING).length;
console.log(`   Total S-code mappings: ${mappingCount}`);
console.log();

// List all mappings by category
console.log('5. All mappings:');
Object.entries(SKILL_CODE_MAPPING).forEach(([scode, escoKey]) => {
  console.log(`   ${scode} → ${escoKey}`);
});

console.log('\n=== Test Complete ===');
