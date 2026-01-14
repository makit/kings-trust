const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'esco.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking recent quiz sessions...\n');

db.all(`
  SELECT 
    session_id,
    status,
    questions_answered,
    identified_skills,
    cluster_probabilities,
    date_of_birth,
    location,
    created_at
  FROM quiz_sessions 
  ORDER BY created_at DESC 
  LIMIT 2
`, (err, rows) => {
  if (err) {
    console.error('Error:', err);
    db.close();
    return;
  }
  
  rows.forEach((row, idx) => {
    console.log(`\n=== Session ${idx + 1}: ${row.session_id} ===`);
    console.log(`Status: ${row.status}`);
    console.log(`Questions Answered: ${row.questions_answered}`);
    console.log(`DOB: ${row.date_of_birth || 'Not provided'}`);
    console.log(`Location: ${row.location || 'Not provided'}`);
    console.log(`Created: ${row.created_at}`);
    
    if (row.identified_skills) {
      console.log('\nIdentified Skills:');
      const skills = JSON.parse(row.identified_skills);
      skills.slice(0, 10).forEach(skill => {
        console.log(`  ${skill.skillId} | ${skill.skillLabel} | ${skill.confidence}% | ${skill.source}`);
      });
      if (skills.length > 10) {
        console.log(`  ... and ${skills.length - 10} more skills`);
      }
    }
    
    if (row.cluster_probabilities) {
      console.log('\nTop Clusters:');
      const clusters = JSON.parse(row.cluster_probabilities);
      const items = clusters.items || clusters.topK || [];
      items.slice(0, 3).forEach(cluster => {
        const prob = Math.round((cluster.probability || 0) * 100);
        console.log(`  ${cluster.id} - ${prob}%`);
      });
    }
  });
  
  db.close();
});
