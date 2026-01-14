-- Kings Trust Database Schema for PostgreSQL
-- Migrated from SQLite

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ESCO Skills & Occupations Tables (Read-Heavy)
-- ============================================================================

CREATE TABLE skill_groups (
  id TEXT PRIMARY KEY,
  origin_uri TEXT,
  uuid_history TEXT,
  code TEXT,
  preferred_label TEXT,
  alt_labels TEXT,
  description TEXT,
  scope_note TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE skills (
  id TEXT PRIMARY KEY,
  origin_uri TEXT,
  uuid_history TEXT,
  skill_type TEXT,
  reuse_level TEXT,
  preferred_label TEXT,
  alt_labels TEXT,
  description TEXT,
  definition TEXT,
  scope_note TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE skill_hierarchy (
  parent_object_type TEXT NOT NULL,
  parent_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  child_object_type TEXT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  PRIMARY KEY (parent_id, child_id)
);

CREATE TABLE skill_skill_relations (
  requiring_id TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  required_id TEXT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  PRIMARY KEY (requiring_id, required_id)
);

CREATE TABLE isco_groups (
  id TEXT PRIMARY KEY,
  origin_uri TEXT,
  uuid_history TEXT,
  code TEXT,
  preferred_label TEXT,
  alt_labels TEXT,
  description TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE occupations (
  id TEXT PRIMARY KEY,
  origin_uri TEXT,
  uuid_history TEXT,
  isco_group_code TEXT,
  code TEXT,
  preferred_label TEXT,
  alt_labels TEXT,
  description TEXT,
  definition TEXT,
  scope_note TEXT,
  regulated_profession_note TEXT,
  occupation_type TEXT,
  is_localized BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE occupation_hierarchy (
  parent_object_type TEXT NOT NULL,
  parent_id TEXT NOT NULL,
  child_id TEXT NOT NULL,
  child_object_type TEXT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  PRIMARY KEY (parent_id, child_id)
);

CREATE TABLE occupation_skill_relations (
  occupation_type TEXT NOT NULL,
  occupation_id TEXT NOT NULL,
  relation_type TEXT NOT NULL,
  skill_id TEXT NOT NULL,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  PRIMARY KEY (occupation_id, skill_id)
);

-- ============================================================================
-- Quiz System Tables (Write-Heavy)
-- ============================================================================

CREATE TABLE quiz_sessions (
  session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('in-progress', 'completed', 'abandoned')),
  current_situation TEXT,
  experience_text TEXT,
  interest_categories JSONB DEFAULT '[]'::jsonb,
  strengths_text TEXT,
  primary_goal TEXT,
  current_phase INTEGER DEFAULT 1,
  questions_answered INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  identified_skills JSONB DEFAULT '[]'::jsonb,
  uncertain_skills JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP,
  last_question_id TEXT,
  can_resume BOOLEAN DEFAULT TRUE,
  quiz_stage INTEGER DEFAULT 1 CHECK (quiz_stage IN (1, 2)),
  stage1_complete BOOLEAN DEFAULT FALSE,
  bayesian_state JSONB,
  cluster_probabilities JSONB,
  questions_asked JSONB DEFAULT '[]'::jsonb,
  date_of_birth DATE,
  location TEXT
);

CREATE TABLE quiz_questions (
  question_id TEXT PRIMARY KEY,
  phase INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('multiple-choice', 'multi-select', 'scenario', 'scale', 'free-text')),
  text TEXT NOT NULL,
  description TEXT,
  options JSONB,
  target_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_generated BOOLEAN DEFAULT FALSE,
  generated_by TEXT,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_time INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE quiz_responses (
  response_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(session_id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  user_response JSONB NOT NULL,
  response_time INTEGER,
  skills_inferred JSONB DEFAULT '[]'::jsonb,
  confidence_scores JSONB,
  bedrock_analysis JSONB,
  answered_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE quiz_results (
  result_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES quiz_sessions(session_id) ON DELETE CASCADE,
  final_skills JSONB NOT NULL,
  recommended_occupations JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================

-- ESCO data indexes
CREATE INDEX idx_skills_type ON skills(skill_type);
CREATE INDEX idx_skills_reuse ON skills(reuse_level);
CREATE INDEX idx_skills_label ON skills(preferred_label);
CREATE INDEX idx_occupations_type ON occupations(occupation_type);
CREATE INDEX idx_occupations_isco ON occupations(isco_group_code);
CREATE INDEX idx_occupations_label ON occupations(preferred_label);
CREATE INDEX idx_occ_skill_rel_occ ON occupation_skill_relations(occupation_id);
CREATE INDEX idx_occ_skill_rel_skill ON occupation_skill_relations(skill_id);
CREATE INDEX idx_skill_hierarchy_parent ON skill_hierarchy(parent_id);
CREATE INDEX idx_skill_hierarchy_child ON skill_hierarchy(child_id);
CREATE INDEX idx_occ_hierarchy_parent ON occupation_hierarchy(parent_id);
CREATE INDEX idx_occ_hierarchy_child ON occupation_hierarchy(child_id);

-- Quiz system indexes
CREATE INDEX idx_quiz_sessions_status ON quiz_sessions(status);
CREATE INDEX idx_quiz_sessions_user ON quiz_sessions(user_id);
CREATE INDEX idx_quiz_sessions_created ON quiz_sessions(created_at DESC);
CREATE INDEX idx_quiz_responses_session ON quiz_responses(session_id);
CREATE INDEX idx_quiz_responses_answered ON quiz_responses(answered_at DESC);
CREATE INDEX idx_quiz_results_session ON quiz_results(session_id);

-- Full-text search indexes for ESCO data
CREATE INDEX idx_skills_search ON skills USING gin(to_tsvector('english', 
  COALESCE(preferred_label, '') || ' ' || 
  COALESCE(description, '') || ' ' || 
  COALESCE(definition, '')
));

CREATE INDEX idx_occupations_search ON occupations USING gin(to_tsvector('english',
  COALESCE(preferred_label, '') || ' ' || 
  COALESCE(description, '')
));

-- ============================================================================
-- Triggers for automatic timestamp updates
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_quiz_sessions_updated_at
  BEFORE UPDATE ON quiz_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments for documentation
-- ============================================================================

COMMENT ON TABLE skills IS 'ESCO skills taxonomy - read-only reference data';
COMMENT ON TABLE occupations IS 'ESCO occupations taxonomy - read-only reference data';
COMMENT ON TABLE quiz_sessions IS 'User quiz sessions with Bayesian adaptive state';
COMMENT ON TABLE quiz_responses IS 'Individual question responses with AI analysis';
COMMENT ON TABLE quiz_results IS 'Final quiz results with skill assessments and occupation recommendations';
