/**
 * Mapping from legacy S-code skill IDs to ESCO key_* skill IDs
 * 
 * This mapping allows us to translate the hardcoded S codes in Stage 2 questions
 * to actual ESCO database skills, ensuring results are accurate and relevant.
 */

export const SKILL_CODE_MAPPING: Record<string, string> = {
  // Communication & Language Skills
  'S1.0.1': 'key_2927', // Communication → communicate with customers
  'S1.0.2': 'key_2927', // Persuasion → communicate with customers
  'S1.0.3': 'key_10548', // Instruction → teach languages
  
  // Social & Emotional Skills
  'S2.2.1': 'key_7837', // Empathy → show empathy
  
  // Analytical & Problem-Solving
  'S1.3.1': 'key_1428', // Analytical thinking → create solutions to problems
  'S2.1.1': 'key_1428', // Research → create solutions to problems
  'S2.1.2': 'key_10726', // Medical diagnosis → solve problems
  'S2.1.3': 'key_1428', // Technical interpretation → create solutions to problems
  
  // Organizational Skills
  'S4.1.1': 'key_8093', // Opportunity identification → apply organisational techniques
  'S4.1.2': 'key_1411', // Planning → plan retail space
  'S4.1.3': 'key_8093', // Policy development → apply organisational techniques
  'S4.3.1': 'key_1354', // Budget/resource management → manage supplies
  
  // People Skills & Care
  'S3.1.1': 'key_1490', // Counseling → support harmed social service users
  'S3.2.1': 'key_7837', // Medical care → show empathy
  'S3.2.2': 'key_10726', // Surgical procedures → solve problems
  'S3.4.4': 'key_1490', // General assistance → support harmed social service users
  
  // Conflict & Negotiation
  'S9.3.1': 'key_2927', // Negotiation → communicate with customers
  'S9.3.3': 'key_1428', // Conflict resolution → create solutions to problems
  
  // Technical Skills
  'S5.1.1': 'key_1428', // Programming → create solutions to problems
  'S5.1.2': 'key_1428', // System administration → create solutions to problems
  'S5.2.1': 'key_3596', // Equipment operation → manipulate tools
  
  // Creative Skills
  'S6.1.1': 'key_11134', // Design → develop artistic project
  'S6.1.2': 'key_11134', // Visual arts → develop artistic project
  'S6.2.1': 'key_11134', // Music → develop artistic project
  
  // Physical & Outdoor
  'S7.1.1': 'key_3596', // Manual dexterity → manipulate tools
  'S7.1.2': 'key_3596', // Physical coordination → manipulate tools
  'S7.2.1': 'key_3596', // Equipment maintenance → manipulate tools
  
  // Leadership & Management
  'S8.1.1': 'key_1260', // Team leadership → manage musical staff (generic management)
  'S8.1.2': 'key_8093', // Delegation → apply organisational techniques
  'S8.2.1': 'key_8093', // Strategic planning → apply organisational techniques
  
  // Entrepreneurial Skills
  'S10.1.1': 'key_8093', // Business development → apply organisational techniques
  'S10.1.2': 'key_2927', // Sales → communicate with customers
  'S10.2.1': 'key_1284', // Risk assessment → enterprise risk management
  
  // Adaptability & Learning
  'S11.1.1': 'key_1428', // Learning agility → create solutions to problems
  'S11.1.2': 'key_1428', // Flexibility → create solutions to problems
  
  // Teaching & Training
  'S1.3.3': 'key_10548', // Training → teach languages
};

/**
 * Translate an S-code skill ID to an ESCO key_* skill ID
 * Returns the original ID if no mapping exists
 */
export function translateSkillCode(sCode: string): string {
  return SKILL_CODE_MAPPING[sCode] || sCode;
}

/**
 * Check if a skill ID is a legacy S-code format
 */
export function isLegacySkillCode(skillId: string): boolean {
  return /^S\d+\.\d+\.\d+$/.test(skillId);
}

/**
 * Translate all skill IDs in a collection, preserving confidence and other properties
 */
export function translateSkillCollection(
  skills: Array<{ skillId: string; [key: string]: any }>
): Array<{ skillId: string; [key: string]: any }> {
  return skills.map(skill => ({
    ...skill,
    skillId: translateSkillCode(skill.skillId)
  }));
}
