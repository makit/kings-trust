/**
 * Quiz Database Functions
 * SQLite-based storage for quiz sessions, responses, and results
 */

import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const dbPath = path.join(process.cwd(), 'esco.db');

async function getDb() {
  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}

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
}

export interface IdentifiedSkill {
  skillId: string;
  skillLabel: string;
  confidence: number;
  evidence: string[];
  source: 'direct' | 'inferred' | 'validated';
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
  const db = await getDb();
  const sessionId = uuidv4();
  
  await db.run(`
    INSERT INTO quiz_sessions (
      session_id, status, current_phase, questions_answered, 
      total_questions, identified_skills, uncertain_skills, can_resume
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    sessionId,
    'in-progress',
    1,
    0,
    20, // Estimated total
    JSON.stringify([]),
    JSON.stringify([]),
    1
  ]);
  
  const session = await db.get<QuizSession>(`
    SELECT * FROM quiz_sessions WHERE session_id = ?
  `, sessionId);
  
  await db.close();
  
  return parseSession(session!);
}

export async function getQuizSession(sessionId: string): Promise<QuizSession | null> {
  const db = await getDb();
  
  const session = await db.get<QuizSession>(`
    SELECT * FROM quiz_sessions WHERE session_id = ?
  `, sessionId);
  
  await db.close();
  
  return session ? parseSession(session) : null;
}

export async function updateQuizSession(
  sessionId: string,
  updates: Partial<QuizSession>
): Promise<void> {
  const db = await getDb();
  
  const fields: string[] = [];
  const values: any[] = [];
  
  if (updates.status) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.current_situation !== undefined) {
    fields.push('current_situation = ?');
    values.push(updates.current_situation);
  }
  if (updates.experience_text !== undefined) {
    fields.push('experience_text = ?');
    values.push(updates.experience_text);
  }
  if (updates.interest_categories) {
    fields.push('interest_categories = ?');
    values.push(JSON.stringify(updates.interest_categories));
  }
  if (updates.strengths_text !== undefined) {
    fields.push('strengths_text = ?');
    values.push(updates.strengths_text);
  }
  if (updates.primary_goal !== undefined) {
    fields.push('primary_goal = ?');
    values.push(updates.primary_goal);
  }
  if (updates.current_phase !== undefined) {
    fields.push('current_phase = ?');
    values.push(updates.current_phase);
  }
  if (updates.questions_answered !== undefined) {
    fields.push('questions_answered = ?');
    values.push(updates.questions_answered);
  }
  if (updates.identified_skills) {
    fields.push('identified_skills = ?');
    values.push(JSON.stringify(updates.identified_skills));
  }
  if (updates.uncertain_skills) {
    fields.push('uncertain_skills = ?');
    values.push(JSON.stringify(updates.uncertain_skills));
  }
  if (updates.last_question_id !== undefined) {
    fields.push('last_question_id = ?');
    values.push(updates.last_question_id);
  }
  if (updates.completed_at !== undefined) {
    fields.push('completed_at = ?');
    values.push(updates.completed_at);
  }
  
  fields.push('updated_at = datetime("now")');
  values.push(sessionId);
  
  await db.run(`
    UPDATE quiz_sessions 
    SET ${fields.join(', ')}
    WHERE session_id = ?
  `, values);
  
  await db.close();
}

// ============================================================================
// Question Management
// ============================================================================

export async function saveQuestion(question: QuizQuestion): Promise<void> {
  const db = await getDb();
  
  await db.run(`
    INSERT OR REPLACE INTO quiz_questions (
      question_id, phase, type, text, description, options,
      target_skills, is_generated, generated_by, difficulty, estimated_time
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    question.question_id,
    question.phase,
    question.type,
    question.text,
    question.description || null,
    question.options ? JSON.stringify(question.options) : null,
    JSON.stringify(question.target_skills),
    question.is_generated ? 1 : 0,
    question.generated_by || null,
    question.difficulty || null,
    question.estimated_time || null
  ]);
  
  await db.close();
}

export async function getQuestion(questionId: string): Promise<QuizQuestion | null> {
  const db = await getDb();
  
  const question = await db.get(`
    SELECT * FROM quiz_questions WHERE question_id = ?
  `, questionId);
  
  await db.close();
  
  return question ? parseQuestion(question) : null;
}

export async function getQuestionsByPhase(phase: number): Promise<QuizQuestion[]> {
  const db = await getDb();
  
  const questions = await db.all(`
    SELECT * FROM quiz_questions 
    WHERE phase = ? AND is_generated = 0
    ORDER BY question_id
  `, phase);
  
  await db.close();
  
  return questions.map(parseQuestion);
}

// ============================================================================
// Response Management
// ============================================================================

export async function saveResponse(response: Omit<QuizResponse, 'response_id' | 'answered_at'>): Promise<string> {
  const db = await getDb();
  const responseId = uuidv4();
  
  await db.run(`
    INSERT INTO quiz_responses (
      response_id, session_id, question_id, question_text, question_type,
      user_response, response_time, skills_inferred, confidence_scores, bedrock_analysis
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    responseId,
    response.session_id,
    response.question_id,
    response.question_text,
    response.question_type,
    JSON.stringify(response.user_response),
    response.response_time || null,
    JSON.stringify(response.skills_inferred || []),
    response.confidence_scores ? JSON.stringify(response.confidence_scores) : null,
    response.bedrock_analysis ? JSON.stringify(response.bedrock_analysis) : null
  ]);
  
  await db.close();
  
  return responseId;
}

export async function getResponsesForSession(sessionId: string): Promise<QuizResponse[]> {
  const db = await getDb();
  
  const responses = await db.all(`
    SELECT * FROM quiz_responses 
    WHERE session_id = ?
    ORDER BY answered_at
  `, sessionId);
  
  await db.close();
  
  return responses.map(parseResponse);
}

// ============================================================================
// Helper Functions
// ============================================================================

function parseSession(row: any): QuizSession {
  return {
    ...row,
    interest_categories: row.interest_categories ? JSON.parse(row.interest_categories) : [],
    identified_skills: row.identified_skills ? JSON.parse(row.identified_skills) : [],
    uncertain_skills: row.uncertain_skills ? JSON.parse(row.uncertain_skills) : [],
    can_resume: !!row.can_resume
  };
}

function parseQuestion(row: any): QuizQuestion {
  return {
    ...row,
    options: row.options ? JSON.parse(row.options) : undefined,
    target_skills: row.target_skills ? JSON.parse(row.target_skills) : [],
    is_generated: !!row.is_generated
  };
}

function parseResponse(row: any): QuizResponse {
  return {
    ...row,
    user_response: row.user_response ? JSON.parse(row.user_response) : null,
    skills_inferred: row.skills_inferred ? JSON.parse(row.skills_inferred) : [],
    confidence_scores: row.confidence_scores ? JSON.parse(row.confidence_scores) : undefined,
    bedrock_analysis: row.bedrock_analysis ? JSON.parse(row.bedrock_analysis) : undefined
  };
}
