/**
 * Mapping from legacy S-code skill IDs to ESCO key_* skill IDs
 * 
 * This mapping allows us to translate the hardcoded S codes in Stage 2 questions
 * to actual ESCO database skills, ensuring results are accurate and relevant.
 */

export const SKILL_CODE_MAPPING: Record<string, string> = {
  'S1.0.1': 'key_2426', // Communication
  'S1.0.2': 'key_1958', // persuade clients with alternatives
  'S1.0.3': 'key_2079', // communicate verbal instructions
  'S2.2.1': 'key_7837', // show empathy
  'S1.3.1': 'key_5129', // think analytically
  'S2.1.1': 'key_4795', // exercise self-reflection
  'S4.3.1': 'key_1268', // show initiative
  'S1.3.3': 'key_10726', // solve problems
  'S3.4.5': 'key_12014', // think creatively
  'S9.2.1': 'key_10308', // teamwork principles
  'S2.1.3': 'key_7961', // cope with stress
  'S3.2.3': 'key_6408', // apply numeracy skills
  'S4.1.1': 'key_2240', // work in an organised manner
  'S4.1.2': 'key_13027', // manage time
  'S4.1.3': 'key_13611', // plan 
  'S3.2.1': 'key_4015', // use ICT systems
  'S3.2.2': 'key_12168', // use ICT systems
  'S4.3.2': 'key_5277', // adapt to change
  'S2.2.2': 'key_10081', // listen actively
  'S1.3.2': 'key_11803', // think innovately
  'S3.4.3': 'key_2299', // adjust to physical demands
  'S9.2.2': 'key_7837', // Need something aorund helping
  'S9.3.3': 'key_9536',   // resolve conflicts
  'S5.2.1': 'key_1422',   // carry out event management
  'S6.1.1': 'key_7961',   // cope with stress
  'S6.1.2': 'key_7972',   // deal with pressure from unexpected circumstances
  'S6.2.1': 'key_6344',   // cope with uncertainty
  'S10.2.1': 'key_2865',   // perform risk analysis
  'S9.3.1': 'key_7738', // lead others
  'T4.1.3': 'key_7923', // negotiate compromises
  'S3.1.1': 'key_9817', // demonstrate willingness to learn
  'P3.1.1': 'key_13877', // perform manual work autonomously
  'S2.1.2': 'key_6210', // exercise self-control
  'S3.4.4': 'key_8108', // use hand tools
  'S5.1.2': 'key_9810'   // follow reporting procedures
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
