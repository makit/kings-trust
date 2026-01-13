/**
 * Migration script to add Bayesian quiz fields to quiz_sessions table
 * Run this to upgrade the database schema
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(process.cwd(), 'esco.db');

async function migrate() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
      
      console.log('Connected to database');
      
      // Add new columns for Bayesian quiz
      db.serialize(() => {
        const alterStatements = [
          'ALTER TABLE quiz_sessions ADD COLUMN quiz_stage INTEGER DEFAULT 1',
          'ALTER TABLE quiz_sessions ADD COLUMN stage1_complete INTEGER DEFAULT 0',
          'ALTER TABLE quiz_sessions ADD COLUMN bayesian_state TEXT',
          'ALTER TABLE quiz_sessions ADD COLUMN cluster_probabilities TEXT',
          'ALTER TABLE quiz_sessions ADD COLUMN questions_asked TEXT DEFAULT "[]"'
        ];
        
        let completed = 0;
        let errors = [];
        
        alterStatements.forEach((statement, index) => {
          db.run(statement, (err) => {
            if (err) {
              // Column might already exist, check if that's the error
              if (err.message.includes('duplicate column name')) {
                console.log(`Column ${index + 1} already exists, skipping...`);
              } else {
                console.error(`Error executing statement ${index + 1}:`, err.message);
                errors.push(err);
              }
            } else {
              console.log(`Successfully executed statement ${index + 1}`);
            }
            
            completed++;
            
            if (completed === alterStatements.length) {
              db.close((err) => {
                if (err) {
                  console.error('Error closing database:', err);
                  reject(err);
                } else {
                  console.log('Database migration complete');
                  if (errors.length > 0 && errors.some(e => !e.message.includes('duplicate'))) {
                    reject(errors);
                  } else {
                    resolve();
                  }
                }
              });
            }
          });
        });
      });
    });
  });
}

// Run migration
migrate()
  .then(() => {
    console.log('✓ Migration successful');
    process.exit(0);
  })
  .catch((err) => {
    console.error('✗ Migration failed:', err);
    process.exit(1);
  });
