import { query, parseAltLabels } from './db-postgres';

// Type definitions matching our database schema
export interface Skill {
  id: string;
  origin_uri: string;
  uuid_history: string;
  skill_type: string;
  reuse_level: string;
  preferred_label: string;
  alt_labels: string;
  description: string;
  definition: string;
  scope_note: string;
  created_at: string;
  updated_at: string;
}

export interface SkillGroup {
  id: string;
  origin_uri: string;
  uuid_history: string;
  code: string;
  preferred_label: string;
  alt_labels: string;
  description: string;
  scope_note: string;
  created_at: string;
  updated_at: string;
}

export interface Occupation {
  id: string;
  origin_uri: string;
  uuid_history: string;
  isco_group_code: string;
  code: string;
  preferred_label: string;
  alt_labels: string;
  description: string;
  definition: string;
  scope_note: string;
  regulated_profession_note: string;
  occupation_type: string;
  is_localized: boolean;
  created_at: string;
  updated_at: string;
}

export interface ISCOGroup {
  id: string;
  origin_uri: string;
  uuid_history: string;
  code: string;
  preferred_label: string;
  alt_labels: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface OccupationSkillRelation {
  occupation_type: string;
  occupation_id: string;
  relation_type: string;
  skill_id: string;
  created_at: string;
  updated_at: string;
}

export interface SkillHierarchy {
  parent_object_type: string;
  parent_id: string;
  child_id: string;
  child_object_type: string;
  created_at: string;
  updated_at: string;
}

export interface OccupationHierarchy {
  parent_object_type: string;
  parent_id: string;
  child_id: string;
  child_object_type: string;
  created_at: string;
  updated_at: string;
}

export { parseAltLabels };

// Skills queries
export async function getAllSkills(
  limit: number = 50,
  offset: number = 0,
  filters?: {
    skillType?: string;
    reuseLevel?: string;
    search?: string;
  }
): Promise<{ skills: Skill[]; total: number }> {
  const whereConditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (filters?.skillType) {
    whereConditions.push(`skill_type = $${paramIndex++}`);
    params.push(filters.skillType);
  }

  if (filters?.reuseLevel) {
    whereConditions.push(`reuse_level = $${paramIndex++}`);
    params.push(filters.reuseLevel);
  }

  if (filters?.search) {
    whereConditions.push(`(preferred_label ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR definition ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM skills ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0]?.count || '0');

  const skills = await query<Skill>(
    `SELECT * FROM skills ${whereClause} ORDER BY preferred_label LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  return { skills: skills.rows, total };
}

export async function getSkillById(id: string): Promise<Skill | undefined> {
  const result = await query<Skill>('SELECT * FROM skills WHERE id = $1', [id]);
  return result.rows[0];
}

export async function getSkillOrGroupByCodeOrId(codeOrId: string): Promise<{ id: string; preferred_label: string } | undefined> {
  let result = await query<{ id: string; preferred_label: string }>(
    'SELECT id, preferred_label FROM skills WHERE id = $1',
    [codeOrId]
  );
  if (result.rows[0]) return result.rows[0];

  result = await query<{ id: string; preferred_label: string }>(
    'SELECT id, preferred_label FROM skill_groups WHERE code = $1',
    [codeOrId]
  );
  if (result.rows[0]) return result.rows[0];

  result = await query<{ id: string; preferred_label: string }>(
    'SELECT id, preferred_label FROM skill_groups WHERE id = $1',
    [codeOrId]
  );
  return result.rows[0];
}

export async function getSkillsForOccupation(occupationId: string): Promise<{
  essential: Skill[];
  optional: Skill[];
}> {
  const result = await query<Skill & { relation_type: string }>(
    `SELECT s.*, osr.relation_type
     FROM skills s
     JOIN occupation_skill_relations osr ON s.id = osr.skill_id
     WHERE osr.occupation_id = $1`,
    [occupationId]
  );

  return {
    essential: result.rows.filter(s => s.relation_type === 'essential'),
    optional: result.rows.filter(s => s.relation_type === 'optional'),
  };
}

// Occupations queries
export async function getAllOccupations(
  limit: number = 50,
  offset: number = 0,
  filters?: {
    occupationType?: string;
    iscoGroupCode?: string;
    search?: string;
  }
): Promise<{ occupations: Occupation[]; total: number }> {
  const whereConditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (filters?.occupationType) {
    whereConditions.push(`occupation_type = $${paramIndex++}`);
    params.push(filters.occupationType);
  }

  if (filters?.iscoGroupCode) {
    whereConditions.push(`isco_group_code = $${paramIndex++}`);
    params.push(filters.iscoGroupCode);
  }

  if (filters?.search) {
    whereConditions.push(`(preferred_label ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
    params.push(`%${filters.search}%`);
    paramIndex++;
  }

  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM occupations ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0]?.count || '0');

  const occupations = await query<Occupation>(
    `SELECT * FROM occupations ${whereClause} ORDER BY preferred_label LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
    [...params, limit, offset]
  );

  return { occupations: occupations.rows, total };
}

export async function getOccupationById(id: string): Promise<Occupation | undefined> {
  const result = await query<Occupation>('SELECT * FROM occupations WHERE id = $1', [id]);
  return result.rows[0];
}

export async function getOccupationsForSkill(skillId: string): Promise<{
  essential: Occupation[];
  optional: Occupation[];
}> {
  const result = await query<Occupation & { relation_type: string }>(
    `SELECT o.*, osr.relation_type
     FROM occupations o
     JOIN occupation_skill_relations osr ON o.id = osr.occupation_id
     WHERE osr.skill_id = $1`,
    [skillId]
  );

  return {
    essential: result.rows.filter(o => o.relation_type === 'essential'),
    optional: result.rows.filter(o => o.relation_type === 'optional'),
  };
}

// ISCO Groups queries
export async function getAllISCOGroups(): Promise<ISCOGroup[]> {
  const result = await query<ISCOGroup>('SELECT * FROM isco_groups ORDER BY code');
  return result.rows;
}

export async function getISCOGroupByCode(code: string): Promise<ISCOGroup | undefined> {
  const result = await query<ISCOGroup>('SELECT * FROM isco_groups WHERE code = $1', [code]);
  return result.rows[0];
}

// Skill groups queries
export async function getAllSkillGroups(): Promise<SkillGroup[]> {
  const result = await query<SkillGroup>('SELECT * FROM skill_groups ORDER BY code');
  return result.rows;
}

// Match occupations based on skills
export interface OccupationMatch {
  occupation: Occupation;
  matchScore: number;
  essentialSkillsMatched: string[];
  optionalSkillsMatched: string[];
  essentialSkillsMissing: string[];
  optionalSkillsMissing: string[];
  totalEssentialSkills: number;
  totalOptionalSkills: number;
}

export async function matchOccupationsToSkills(skillIds: string[]): Promise<OccupationMatch[]> {
  const occupationsResult = await query<Occupation>('SELECT * FROM occupations');
  const occupations = occupationsResult.rows;

  const matches: OccupationMatch[] = [];

  for (const occupation of occupations) {
    const skills = await getSkillsForOccupation(occupation.id);

    const essentialSkillIds = skills.essential.map(s => s.id);
    const optionalSkillIds = skills.optional.map(s => s.id);

    const essentialMatched = essentialSkillIds.filter(id => skillIds.includes(id));
    const optionalMatched = optionalSkillIds.filter(id => skillIds.includes(id));

    const essentialMissing = essentialSkillIds.filter(id => !skillIds.includes(id));
    const optionalMissing = optionalSkillIds.filter(id => !skillIds.includes(id));

    let matchScore = 0;

    if (essentialSkillIds.length > 0) {
      matchScore += (essentialMatched.length / essentialSkillIds.length) * 0.7;
    } else {
      matchScore += 0.7;
    }

    if (optionalSkillIds.length > 0) {
      matchScore += (optionalMatched.length / optionalSkillIds.length) * 0.3;
    } else {
      matchScore += 0.3;
    }

    if (matchScore > 0 || essentialMatched.length > 0) {
      matches.push({
        occupation,
        matchScore: Math.round(matchScore * 100),
        essentialSkillsMatched: essentialMatched,
        optionalSkillsMatched: optionalMatched,
        essentialSkillsMissing: essentialMissing,
        optionalSkillsMissing: optionalMissing,
        totalEssentialSkills: essentialSkillIds.length,
        totalOptionalSkills: optionalSkillIds.length,
      });
    }
  }

  return matches.sort((a, b) => b.matchScore - a.matchScore);
}
