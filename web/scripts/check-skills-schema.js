const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'esco.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking skills table schema...\n');

db.all(`PRAGMA table_info(skills);`, (err, rows) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  console.log('Columns:');
  rows.forEach(col => {
    console.log(`  ${col.name} (${col.type})`);
  });
  
  // Also check sample data
  db.all(`SELECT * FROM skills LIMIT 3;`, (err2, samples) => {
    if (err2) {
      console.error('Error fetching samples:', err2);
      db.close();
      return;
    }
    
    console.log('\nSample data:');
    samples.forEach((row, idx) => {
      console.log(`\n${idx + 1}.`, JSON.stringify(row, null, 2));
    });
    
    db.close();
  });
});
