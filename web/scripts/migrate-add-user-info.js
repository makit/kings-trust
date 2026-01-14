const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'esco.db');
const db = new sqlite3.Database(dbPath);

console.log('Adding date_of_birth and location columns to quiz_sessions...\n');

// Add date_of_birth column
db.run(`ALTER TABLE quiz_sessions ADD COLUMN date_of_birth TEXT;`, (err) => {
  if (err && !err.message.includes('duplicate column')) {
    console.error('Error adding date_of_birth:', err);
    return;
  }
  console.log('✓ Added date_of_birth column');
  
  // Add location column
  db.run(`ALTER TABLE quiz_sessions ADD COLUMN location TEXT;`, (err2) => {
    if (err2 && !err2.message.includes('duplicate column')) {
      console.error('Error adding location:', err2);
      return;
    }
    console.log('✓ Added location column');
    
    console.log('\nMigration complete!');
    db.close();
  });
});
