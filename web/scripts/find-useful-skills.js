const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'esco.db');
const db = new sqlite3.Database(dbPath);

console.log('Finding relevant ESCO skills for young people...\n');

const keywords = [
  'communicate', 'teamwork', 'solve', 'organize', 'creative', 
  'learn', 'adapt', 'plan', 'assist', 'help', 'support',
  'coordinate', 'manage', 'teach', 'train', 'lead'
];

const query = `
  SELECT id, preferred_label, description
  FROM skills
  WHERE 
    preferred_label LIKE '%communicate%' OR
    preferred_label LIKE '%teamwork%' OR
    preferred_label LIKE '%solve%' OR
    preferred_label LIKE '%problem%' OR
    preferred_label LIKE '%organize%' OR
    preferred_label LIKE '%creative%' OR
    preferred_label LIKE '%learn%' OR
    preferred_label LIKE '%adapt%' OR
    preferred_label LIKE '%plan%' OR
    preferred_label LIKE '%assist%' OR
    preferred_label LIKE '%help%' OR
    preferred_label LIKE '%support%' OR
    preferred_label LIKE '%coordinate%' OR
    preferred_label LIKE '%manage%' OR
    preferred_label LIKE '%teach%' OR
    preferred_label LIKE '%train%' OR
    preferred_label LIKE '%lead%'
  LIMIT 50
`;

db.all(query, (err, rows) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  rows.forEach((row, idx) => {
    console.log(`${idx + 1}. ${row.id} | ${row.preferred_label}`);
    if (row.description && row.description.length > 0 && row.description.length < 200) {
      console.log(`   ${row.description}`);
    }
    console.log();
  });
  
  db.close();
});
