/**
 * Quiz Database Functions - PostgreSQL Version
 * Replaces SQLite with PostgreSQL + JSONB for complex data
 */

import { query, getClient } from './db-postgres';

// ============================================================================
// Types
// ============================================================================

export interface QuizSession {
  session_id: string;
  user_id?: string;
  status: 'in-progress' | 'completed' | 'abandoned';
  current_situation?: string;
  experience_text?: string;
  interest_categories?: string[];
  strengths_text?: string;
  primary_goal?: string;
  current_phase: number;
  questions_answered: number;
  total_questions: number;
  identified_skills: IdentifiedSkill[];
  uncertain_skills: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
  last_question_id?: string;
  can_resume: boolean;
  
  quiz_stage?: 1 | 2;
  stage1_complete?: boolean;
  bayesian_state?: any;
  cluster_probabilities?: any;
  questions_asked?: string[];
  
  date_of_birth?: string;
  location?: string;
}

export interface IdentifiedSkill {
  skillId: string;
  skillLabel: string;
  confidence: number;
  evidence: string[];
  source: 'direct' | 'inferred' | 'validated' | 'ai-analysis' | 'ai-inferred';
  proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface QuizQuestion {
  question_id: string;
  phase: number;
  type: 'multiple-choice' | 'multi-select' | 'scenario' | 'scale' | 'free-text';
  text: string;
  description?: string;
  options?: QuestionOption[];
  target_skills: SkillMapping[];
  is_generated: boolean;
  generated_by?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimated_time?: number;
}

export interface QuestionOption {
  value: string;
  label: string;
  skillImplications?: SkillMapping[];
}

export interface SkillMapping {
  skillId: string;
  confidence: number;
  condition?: string;
  reasoning?: string;
}

export interface QuizResponse {
  response_id: string;
  session_id: string;
  question_id: string;
  question_text: string;
  question_type: string;
  user_response: any;
  response_time?: number;
  skills_inferred: string[];
  confidence_scores?: Record<string, number>;
  bedrock_analysis?: any;
  answered_at: string;
}

// ============================================================================
// Session Management
// ============================================================================

export async function createQuizSession(): Promise<QuizSession> {
  const result = await query<QuizSession>(
    `INSERT INTO quiz_sessions (
      status, current_phase, questions_answered, 
      total_questions, identified_skills, uncertain_skills, can_resume
    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    ['in-progress', 1, 0, 20, '[]', '[]', true]
  );

  return result.rows[0];
}

export async function getQuizSession(sessionId: string): Promise<QuizSession | null> {
  const result = await query<QuizSession>(
    'SELECT * FROM quiz_sessions WHERE session_id = $1',
    [sessionId]
  );

  return result.rows[0] || null;
}

export async function updateQuizSession(
  sessionId: string,
  updates: Partial<QuizSession>
): Promise<void> {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.status) {
    fields.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }
  if (updates.current_situation !== undefined) {
    fields.push(`current_situation = $${paramIndex++}`);
    values.push(updates.current_situation);
  }
  if (updates.experience_text !== undefined) {
    fields.push(`experience_text = $${paramIndex++}`);
    values.push(updates.experience_text);
  }
  if (updates.interest_categories) {
    fields.push(`interest_categories = $${paramIndex++}`);
    values.push(JSON.stringify(updates.interest_categories));
  }
  if (updates.strengths_text !== undefined) {
    fields.push(`strengths_text = $${paramIndex++}`);
    values.push(updates.strengths_text);
  }
  if (updates.primary_goal !== undefined) {
    fields.push(`primary_goal = $${paramIndex++}`);
    values.push(updates.primary_goal);
  }
  if (updates.current_phase !== undefined) {
    fields.push(`current_phase = $${paramIndex++}`);
    values.push(updates.current_phase);
  }
  if (updates.questions_answered !== undefined) {
    fields.push(`questions_answered = $${paramIndex++}`);
    values.push(updates.questions_answered);
  }
  if (updates.identified_skills) {
    fields.push(`identified_skills = $${paramIndex++}`);
    values.push(JSON.stringify(updates.identified_skills));
  }
  if (updates.uncertain_skills) {
    fields.push(`uncertain_skills = $${paramIndex++}`);
    values.push(JSON.stringify(updates.uncertain_skills));
  }
  if (updates.last_question_id !== undefined) {
    fields.push(`last_question_id = $${paramIndex++}`);
    values.push(updates.last_question_id);
  }
  if (updates.completed_at !== undefined) {
    fields.push(`completed_at = $${paramIndex++}`);
    values.push(updates.completed_at);
  }
  if (updates.quiz_stage !== undefined) {
    fields.push(`quiz_stage = $${paramIndex++}`);
    values.push(updates.quiz_stage);
  }
  if (updates.stage1_complete !== undefined) {
    fields.push(`stage1_complete = $${paramIndex++}`);
    values.push(updates.stage1_complete);
  }
  if (updates.bayesian_state !== undefined) {
    fields.push(`bayesian_state = $${paramIndex++}`);
    values.push(JSON.stringify(updates.bayesian_state));
  }
  if (updates.cluster_probabilities !== undefined) {
    fields.push(`cluster_probabilities = $${paramIndex++}`);
    values.push(JSON.stringify(updates.cluster_probabilities));
  }
  if (updates.questions_asked !== undefined) {
    fields.push(`questions_asked = $${paramIndex++}`);
    values.push(JSON.stringify(updates.questions_asked));
  }

  if (fields.length === 0) return;

  values.push(sessionId);

  await query(
    `UPDATE quiz_sessions SET ${fields.join(', ')} WHERE session_id = $${paramIndex}`,
    values
  );
}

// ============================================================================
// Question Management
// ============================================================================

export async function saveQuestion(question: QuizQuestion): Promise<void> {
  await query(
    `INSERT INTO quiz_questions (
      question_id, phase, type, text, description, options,
      target_skills, is_generated, generated_by, difficulty, estimated_time
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    ON CONFLICT (question_id) DO UPDATE SET
      phase = EXCLUDED.phase,
      type = EXCLUDED.type,
      text = EXCLUDED.text,
      description = EXCLUDED.description,
      options = EXCLUDED.options,
      target_skills = EXCLUDED.target_skills,
      is_generated = EXCLUDED.is_generated,
      generated_by = EXCLUDED.generated_by,
      difficulty = EXCLUDED.difficulty,
      estimated_time = EXCLUDED.estimated_time`,
    [
      question.question_id,
      question.phase,
      question.type,
      question.text,
      question.description || null,
      question.options ? JSON.stringify(question.options) : null,
      JSON.stringify(question.target_skills),
      question.is_generated,
      question.generated_by || null,
      question.difficulty || null,
      question.estimated_time || null
    ]
  );
}

export async function getQuestion(questionId: string): Promise<QuizQuestion | null> {
  const result = await query<any>(
    'SELECT * FROM quiz_questions WHERE question_id = $1',
    [questionId]
  );

  return result.rows[0] ? parseQuestion(result.rows[0]) : null;
}

export async function getQuestionsByPhase(phase: number): Promise<QuizQuestion[]> {
  const result = await query<any>(
    'SELECT * FROM quiz_questions WHERE phase = $1 AND is_generated = false ORDER BY question_id',
    [phase]
  );

  return result.rows.map(parseQuestion);
}

// ============================================================================
// Response Management
// ============================================================================

export async function saveResponse(response: Omit<QuizResponse, 'response_id' | 'answered_at'>): Promise<string> {
  const result = await query<{ response_id: string }>(
    `INSERT INTO quiz_responses (
      session_id, question_id, question_text, question_type,
      user_response, response_time, skills_inferred, confidence_scores, bedrock_analysis
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING response_id`,
    [
      response.session_id,
      response.question_id,
      response.question_text,
      response.question_type,
      JSON.stringify(response.user_response),
      response.response_time || null,
      JSON.stringify(response.skills_inferred || []),
      response.confidence_scores ? JSON.stringify(response.confidence_scores) : null,
      response.bedrock_analysis ? JSON.stringify(response.bedrock_analysis) : null
    ]
  );

  return result.rows[0].response_id;
}

export async function getResponsesForSession(sessionId: string): Promise<QuizResponse[]> {
  const result = await query<any>(
    'SELECT * FROM quiz_responses WHERE session_id = $1 ORDER BY answered_at',
    [sessionId]
  );

  return result.rows.map(parseResponse);
}

// ============================================================================
// Helper Functions
// ============================================================================

function parseQuestion(row: any): QuizQuestion {
  return {
    ...row,
    options: row.options || undefined,
    target_skills: row.target_skills || [],
  };
}

function parseResponse(row: any): QuizResponse {
  return {
    ...row,
    user_response: row.user_response || null,
    skills_inferred: row.skills_inferred || [],
    confidence_scores: row.confidence_scores || undefined,
    bedrock_analysis: row.bedrock_analysis || undefined,
  };
}
