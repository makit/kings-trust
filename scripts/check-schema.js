const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'esco.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking quiz_sessions table schema...\n');

db.all(`PRAGMA table_info(quiz_sessions);`, (err, rows) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  console.log('Current columns:');
  rows.forEach(col => {
    console.log(`  ${col.name} (${col.type}${col.notnull ? ', NOT NULL' : ''}${col.dflt_value ? `, DEFAULT ${col.dflt_value}` : ''})`);
  });
  
  db.close();
});
