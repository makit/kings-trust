import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

const dbPath = path.join(process.cwd(), process.env.DATABASE_PATH || './esco.db');

let db: Database<sqlite3.Database, sqlite3.Statement> | null = null;

export async function getDatabase(): Promise<Database<sqlite3.Database, sqlite3.Statement>> {
  if (!db) {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READONLY
    });
  }
  return db;
}

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
  is_localized: number;
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

// Helper to parse alt_labels from string to array
export function parseAltLabels(altLabels: string): string[] {
  if (!altLabels || altLabels.trim() === '') return [];
  return altLabels.split('\n').map(label => label.trim()).filter(label => label.length > 0);
}

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
  const db = await getDatabase();
  
  let whereConditions: string[] = [];
  let params: any[] = [];
  
  if (filters?.skillType) {
    whereConditions.push('skill_type = ?');
    params.push(filters.skillType);
  }
  
  if (filters?.reuseLevel) {
    whereConditions.push('reuse_level = ?');
    params.push(filters.reuseLevel);
  }
  
  if (filters?.search) {
    whereConditions.push('(preferred_label LIKE ? OR description LIKE ? OR definition LIKE ?)');
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  
  // Get total count
  const countResult = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM skills ${whereClause}`, ...params);
  const count = countResult?.count || 0;
  
  // Get paginated results
  const skills = await db.all<Skill[]>(`
    SELECT * FROM skills 
    ${whereClause}
    ORDER BY preferred_label
    LIMIT ? OFFSET ?
  `, ...params, limit, offset);
  
  return { skills, total: count };
}

export async function getSkillById(id: string): Promise<Skill | undefined> {
  const db = await getDatabase();
  return await db.get<Skill>('SELECT * FROM skills WHERE id = ?', id);
}

export async function getSkillOrGroupByCodeOrId(codeOrId: string): Promise<{ id: string; preferred_label: string } | undefined> {
  const db = await getDatabase();
  
  // Try to find as skill by ID
  let result = await db.get<Skill>('SELECT id, preferred_label FROM skills WHERE id = ?', codeOrId);
  if (result) return result;
  
  // Try to find as skill group by code (like S2.2.1)
  result = await db.get<any>('SELECT id, preferred_label FROM skill_groups WHERE code = ?', codeOrId);
  if (result) return result;
  
  // Try to find as skill group by ID
  result = await db.get<any>('SELECT id, preferred_label FROM skill_groups WHERE id = ?', codeOrId);
  return result;
}

export async function getSkillsForOccupation(occupationId: string): Promise<{
  essential: Skill[];
  optional: Skill[];
}> {
  const db = await getDatabase();
  
  const results = await db.all<(Skill & { relation_type: string })[]>(`
    SELECT s.*, osr.relation_type
    FROM skills s
    JOIN occupation_skill_relations osr ON s.id = osr.skill_id
    WHERE osr.occupation_id = ?
  `, occupationId);
  
  return {
    essential: results.filter(s => s.relation_type === 'essential'),
    optional: results.filter(s => s.relation_type === 'optional'),
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
  const db = await getDatabase();
  
  let whereConditions: string[] = [];
  let params: any[] = [];
  
  if (filters?.occupationType) {
    whereConditions.push('occupation_type = ?');
    params.push(filters.occupationType);
  }
  
  if (filters?.iscoGroupCode) {
    whereConditions.push('isco_group_code = ?');
    params.push(filters.iscoGroupCode);
  }
  
  if (filters?.search) {
    whereConditions.push('(preferred_label LIKE ? OR description LIKE ?)');
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm);
  }
  
  const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
  
  // Get total count
  const countResult = await db.get<{ count: number }>(`SELECT COUNT(*) as count FROM occupations ${whereClause}`, ...params);
  const count = countResult?.count || 0;
  
  // Get paginated results
  const occupations = await db.all<Occupation[]>(`
    SELECT * FROM occupations 
    ${whereClause}
    ORDER BY preferred_label
    LIMIT ? OFFSET ?
  `, ...params, limit, offset);
  
  return { occupations, total: count };
}

export async function getOccupationById(id: string): Promise<Occupation | undefined> {
  const db = await getDatabase();
  return await db.get<Occupation>('SELECT * FROM occupations WHERE id = ?', id);
}

export async function getOccupationsForSkill(skillId: string): Promise<{
  essential: Occupation[];
  optional: Occupation[];
}> {
  const db = await getDatabase();
  
  const results = await db.all<(Occupation & { relation_type: string })[]>(`
    SELECT o.*, osr.relation_type
    FROM occupations o
    JOIN occupation_skill_relations osr ON o.id = osr.occupation_id
    WHERE osr.skill_id = ?
  `, skillId);
  
  return {
    essential: results.filter(o => o.relation_type === 'essential'),
    optional: results.filter(o => o.relation_type === 'optional'),
  };
}

// ISCO Groups queries
export async function getAllISCOGroups(): Promise<ISCOGroup[]> {
  const db = await getDatabase();
  return await db.all<ISCOGroup[]>('SELECT * FROM isco_groups ORDER BY code');
}

export async function getISCOGroupByCode(code: string): Promise<ISCOGroup | undefined> {
  const db = await getDatabase();
  return await db.get<ISCOGroup>('SELECT * FROM isco_groups WHERE code = ?', code);
}

// Skill groups queries
export async function getAllSkillGroups(): Promise<SkillGroup[]> {
  const db = await getDatabase();
  return await db.all<SkillGroup[]>('SELECT * FROM skill_groups ORDER BY code');
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
  const db = await getDatabase();
  
  // Get all occupations with their skill requirements
  const occupations = await db.all<Occupation[]>('SELECT * FROM occupations');
  
  const matches: OccupationMatch[] = [];
  
  for (const occupation of occupations) {
    const skills = await getSkillsForOccupation(occupation.id);
    
    const essentialSkillIds = skills.essential.map(s => s.id);
    const optionalSkillIds = skills.optional.map(s => s.id);
    
    const essentialMatched = essentialSkillIds.filter(id => skillIds.includes(id));
    const optionalMatched = optionalSkillIds.filter(id => skillIds.includes(id));
    
    const essentialMissing = essentialSkillIds.filter(id => !skillIds.includes(id));
    const optionalMissing = optionalSkillIds.filter(id => !skillIds.includes(id));
    
    // Calculate match score
    // Formula: (essential_matched / total_essential * 0.7) + (optional_matched / total_optional * 0.3)
    let matchScore = 0;
    
    if (essentialSkillIds.length > 0) {
      matchScore += (essentialMatched.length / essentialSkillIds.length) * 0.7;
    } else {
      matchScore += 0.7; // If no essential skills, give full essential weight
    }
    
    if (optionalSkillIds.length > 0) {
      matchScore += (optionalMatched.length / optionalSkillIds.length) * 0.3;
    } else {
      matchScore += 0.3; // If no optional skills, give full optional weight
    }
    
    // Only include occupations with at least some match
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
  
  // Sort by match score descending
  return matches.sort((a, b) => b.matchScore - a.matchScore);
}
