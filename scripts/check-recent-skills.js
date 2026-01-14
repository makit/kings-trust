const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'local.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking recent identified skills...\n');

db.all(`
  SELECT 
    session_id,
    skillId, 
    skillLabel, 
    confidence, 
    source 
  FROM identified_skills 
  WHERE session_id IN (
    SELECT session_id FROM quiz_sessions 
    ORDER BY created_at DESC 
    LIMIT 3
  )
  ORDER BY session_id, confidence DESC
`, (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  const bySession = {};
  rows.forEach(row => {
    if (!bySession[row.session_id]) {
      bySession[row.session_id] = [];
    }
    bySession[row.session_id].push(row);
  });
  
  Object.keys(bySession).forEach(sessionId => {
    console.log(`\n=== Session: ${sessionId} ===`);
    bySession[sessionId].forEach(skill => {
      console.log(`  ${skill.skillId} | ${skill.skillLabel} | ${skill.confidence}% | ${skill.source}`);
    });
  });
  
  db.close();
});
