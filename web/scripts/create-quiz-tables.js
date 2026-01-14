/**
 * Create Quiz Tables in SQLite Database
 * Run with: node scripts/create-quiz-tables.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'esco.db');
const db = new sqlite3.Database(dbPath);

console.log('Creating quiz tables in SQLite database...\n');

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

const tables = [
  {
    name: 'quiz_sessions',
    sql: `CREATE TABLE IF NOT EXISTS quiz_sessions (
      session_id TEXT PRIMARY KEY,
      user_id TEXT,
      status TEXT NOT NULL CHECK(status IN ('in-progress', 'completed', 'abandoned')),
      
      -- Onboarding responses
      current_situation TEXT,
      experience_text TEXT,
      interest_categories TEXT, -- JSON array
      strengths_text TEXT,
      primary_goal TEXT,
      
      -- Progress tracking
      current_phase INTEGER DEFAULT 1 CHECK(current_phase BETWEEN 1 AND 4),
      questions_answered INTEGER DEFAULT 0,
      total_questions INTEGER DEFAULT 0,
      
      -- Identified skills (JSON)
      identified_skills TEXT, -- JSON array of IdentifiedSkill objects
      uncertain_skills TEXT,  -- JSON array of skill IDs to explore
      
      -- Metadata
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      completed_at TEXT,
      
      -- Save/Resume support
      last_question_id TEXT,
      can_resume INTEGER DEFAULT 1
    )`
  },
  {
    name: 'quiz_questions',
    sql: `CREATE TABLE IF NOT EXISTS quiz_questions (
      question_id TEXT PRIMARY KEY,
      phase INTEGER NOT NULL CHECK(phase BETWEEN 1 AND 4),
      type TEXT NOT NULL CHECK(type IN ('multiple-choice', 'multi-select', 'scenario', 'scale', 'free-text')),
      
      -- Question content
      text TEXT NOT NULL,
      description TEXT,
      options TEXT, -- JSON array of QuestionOption objects
      
      -- Skill mappings
      target_skills TEXT, -- JSON array of SkillMapping objects
      
      -- Dynamic generation metadata
      is_generated INTEGER DEFAULT 0,
      generated_by TEXT,
      generation_prompt TEXT,
      
      -- Adaptive logic
      prerequisite_responses TEXT, -- JSON array
      skip_conditions TEXT, -- JSON array
      
      -- Metadata
      difficulty TEXT CHECK(difficulty IN ('beginner', 'intermediate', 'advanced')),
      estimated_time INTEGER, -- seconds
      
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )`
  },
  {
    name: 'quiz_responses',
    sql: `CREATE TABLE IF NOT EXISTS quiz_responses (
      response_id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      
      -- Response data
      question_text TEXT NOT NULL,
      question_type TEXT NOT NULL,
      user_response TEXT NOT NULL, -- JSON for complex responses
      response_time INTEGER, -- milliseconds
      
      -- Analysis results
      skills_inferred TEXT, -- JSON array of skill IDs
      confidence_scores TEXT, -- JSON object mapping skill IDs to scores
      bedrock_analysis TEXT, -- JSON from Bedrock response (if applicable)
      
      -- Metadata
      answered_at TEXT NOT NULL DEFAULT (datetime('now')),
      
      FOREIGN KEY (session_id) REFERENCES quiz_sessions(session_id) ON DELETE CASCADE
    )`
  },
  {
    name: 'quiz_results',
    sql: `CREATE TABLE IF NOT EXISTS quiz_results (
      result_id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL UNIQUE,
      user_id TEXT,
      
      -- Skills Profile (JSON)
      identified_skills TEXT NOT NULL, -- Array of IdentifiedSkillResult
      skills_by_category TEXT, -- Object with arrays by category
      
      -- Occupation Matches (JSON)
      top_occupations TEXT, -- Array of OccupationMatch objects
      career_paths TEXT, -- Array of CareerPath objects
      
      -- Recommendations (JSON)
      recommended_skills TEXT, -- Array of RecommendedSkill
      learning_paths TEXT, -- Array of LearningPath
      
      -- AI-Generated Insights
      personalized_summary TEXT,
      strengths_analysis TEXT,
      growth_areas TEXT,
      career_advice TEXT,
      
      -- Metadata
      generated_at TEXT NOT NULL DEFAULT (datetime('now')),
      processing_time INTEGER, -- milliseconds
      
      FOREIGN KEY (session_id) REFERENCES quiz_sessions(session_id) ON DELETE CASCADE
    )`
  }
];

// Create tables sequentially
function createTables(index = 0) {
  if (index >= tables.length) {
    console.log('\n✓ All quiz tables created successfully!\n');
    
    // Create indexes
    console.log('Creating indexes...\n');
    createIndexes();
    return;
  }
  
  const table = tables[index];
  console.log(`Creating table: ${table.name}...`);
  
  db.run(table.sql, (err) => {
    if (err) {
      console.error(`✗ Error creating ${table.name}:`, err.message);
      db.close();
      process.exit(1);
    } else {
      console.log(`✓ ${table.name} created`);
      createTables(index + 1);
    }
  });
}

function createIndexes() {
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_quiz_sessions_status ON quiz_sessions(status)',
    'CREATE INDEX IF NOT EXISTS idx_quiz_sessions_created ON quiz_sessions(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_quiz_responses_session ON quiz_responses(session_id)',
    'CREATE INDEX IF NOT EXISTS idx_quiz_results_session ON quiz_results(session_id)',
    'CREATE INDEX IF NOT EXISTS idx_quiz_questions_phase ON quiz_questions(phase)'
  ];
  
  let completed = 0;
  
  indexes.forEach((sql, i) => {
    db.run(sql, (err) => {
      if (err) {
        console.error(`✗ Error creating index:`, err.message);
      } else {
        console.log(`✓ Index ${i + 1} created`);
      }
      
      completed++;
      if (completed === indexes.length) {
        console.log('\n✓ All indexes created successfully!\n');
        db.close();
        console.log('Database setup complete. Ready for quiz implementation.\n');
      }
    });
  });
}

// Start table creation
createTables();
