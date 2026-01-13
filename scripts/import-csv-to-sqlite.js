#!/usr/bin/env node

/**
 * Import ESCO CSV data into SQLite database
 * 
 * This script reads the Tabiya CSV files and imports them into a SQLite database.
 * Run with: node scripts/import-csv-to-sqlite.js
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { parse } = require('csv-parse/sync');

const DATA_DIR = path.join(__dirname, '../data');
const DB_PATH = path.join(__dirname, '../esco.db');

// Helper function to parse list fields (separated by \n)
function parseList(value) {
  if (!value || value.trim() === '') return [];
  return value.split('\n').map(item => item.trim()).filter(item => item.length > 0);
}

// Helper function to parse boolean values
function parseBoolean(value) {
  if (!value || value.trim() === '') return null;
  return value.toLowerCase() === 'true';
}

// Create database and tables
function createDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('✓ Connected to SQLite database');
      
      db.serialize(() => {
        // Drop existing tables
        const tables = [
          'skill_groups',
          'skills',
          'skill_hierarchy',
          'skill_skill_relations',
          'isco_groups',
          'occupations',
          'occupation_hierarchy',
          'occupation_skill_relations'
        ];
        
        tables.forEach(table => {
          db.run(`DROP TABLE IF EXISTS ${table}`);
        });
        
        // Create Skill Groups table
        db.run(`
          CREATE TABLE skill_groups (
            id TEXT PRIMARY KEY,
            origin_uri TEXT,
            uuid_history TEXT,
            code TEXT,
            preferred_label TEXT,
            alt_labels TEXT,
            description TEXT,
            scope_note TEXT,
            created_at TEXT,
            updated_at TEXT
          )
        `);
        
        // Create Skills table
        db.run(`
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
            created_at TEXT,
            updated_at TEXT
          )
        `);
        
        // Create Skill Hierarchy table
        db.run(`
          CREATE TABLE skill_hierarchy (
            parent_object_type TEXT,
            parent_id TEXT,
            child_id TEXT,
            child_object_type TEXT,
            created_at TEXT,
            updated_at TEXT,
            PRIMARY KEY (parent_id, child_id)
          )
        `);
        
        // Create Skill to Skill Relations table
        db.run(`
          CREATE TABLE skill_skill_relations (
            requiring_id TEXT,
            relation_type TEXT,
            required_id TEXT,
            created_at TEXT,
            updated_at TEXT,
            PRIMARY KEY (requiring_id, required_id)
          )
        `);
        
        // Create ISCO Groups table
        db.run(`
          CREATE TABLE isco_groups (
            id TEXT PRIMARY KEY,
            origin_uri TEXT,
            uuid_history TEXT,
            code TEXT,
            preferred_label TEXT,
            alt_labels TEXT,
            description TEXT,
            created_at TEXT,
            updated_at TEXT
          )
        `);
        
        // Create Occupations table
        db.run(`
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
            is_localized INTEGER,
            created_at TEXT,
            updated_at TEXT
          )
        `);
        
        // Create Occupation Hierarchy table
        db.run(`
          CREATE TABLE occupation_hierarchy (
            parent_object_type TEXT,
            parent_id TEXT,
            child_id TEXT,
            child_object_type TEXT,
            created_at TEXT,
            updated_at TEXT,
            PRIMARY KEY (parent_id, child_id)
          )
        `);
        
        // Create Occupation to Skill Relations table
        db.run(`
          CREATE TABLE occupation_skill_relations (
            occupation_type TEXT,
            occupation_id TEXT,
            relation_type TEXT,
            skill_id TEXT,
            created_at TEXT,
            updated_at TEXT,
            PRIMARY KEY (occupation_id, skill_id)
          )
        `, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log('✓ Created database tables');
            resolve(db);
          }
        });
      });
    });
  });
}

// Import Skill Groups
function importSkillGroups(db) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(DATA_DIR, 'skillGroups.csv');
    console.log('Importing Skill Groups...');
    
    const csvData = fs.readFileSync(filePath, 'utf-8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    });
    
    const stmt = db.prepare(`
      INSERT INTO skill_groups (
        id, origin_uri, uuid_history, code, preferred_label, 
        alt_labels, description, scope_note, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    records.forEach(record => {
      stmt.run(
        record.ID,
        record.ORIGINURI,
        record.UUIDHISTORY,
        record.CODE,
        record.PREFERREDLABEL,
        record.ALTLABELS,
        record.DESCRIPTION,
        record.SCOPENOTE,
        record.CREATEDAT,
        record.UPDATEDAT
      );
    });
    
    stmt.finalize((err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`✓ Imported ${records.length} skill groups`);
        resolve();
      }
    });
  });
}

// Import Skills
function importSkills(db) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(DATA_DIR, 'skills.csv');
    console.log('Importing Skills...');
    
    const csvData = fs.readFileSync(filePath, 'utf-8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    });
    
    const stmt = db.prepare(`
      INSERT INTO skills (
        id, origin_uri, uuid_history, skill_type, reuse_level,
        preferred_label, alt_labels, description, definition, 
        scope_note, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    records.forEach(record => {
      stmt.run(
        record.ID,
        record.ORIGINURI,
        record.UUIDHISTORY,
        record.SKILLTYPE,
        record.REUSELEVEL,
        record.PREFERREDLABEL,
        record.ALTLABELS,
        record.DESCRIPTION,
        record.DEFINITION,
        record.SCOPENOTE,
        record.CREATEDAT,
        record.UPDATEDAT
      );
    });
    
    stmt.finalize((err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`✓ Imported ${records.length} skills`);
        resolve();
      }
    });
  });
}

// Import Skill Hierarchy
function importSkillHierarchy(db) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(DATA_DIR, 'skills_hierarchy.csv');
    console.log('Importing Skill Hierarchy...');
    
    const csvData = fs.readFileSync(filePath, 'utf-8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    });
    
    const stmt = db.prepare(`
      INSERT INTO skill_hierarchy (
        parent_object_type, parent_id, child_id, child_object_type,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    records.forEach(record => {
      stmt.run(
        record.PARENTOBJECTTYPE,
        record.PARENTID,
        record.CHILDID,
        record.CHILDOBJECTTYPE,
        record.CREATEDAT,
        record.UPDATEDAT
      );
    });
    
    stmt.finalize((err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`✓ Imported ${records.length} skill hierarchy relations`);
        resolve();
      }
    });
  });
}

// Import Skill to Skill Relations
function importSkillSkillRelations(db) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(DATA_DIR, 'skill_skill_relations.csv');
    console.log('Importing Skill-to-Skill Relations...');
    
    const csvData = fs.readFileSync(filePath, 'utf-8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    });
    
    const stmt = db.prepare(`
      INSERT INTO skill_skill_relations (
        requiring_id, relation_type, required_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?)
    `);
    
    records.forEach(record => {
      stmt.run(
        record.REQUIRINGID,
        record.RELATIONTYPE,
        record.REQUIREDID,
        record.CREATEDAT,
        record.UPDATEDAT
      );
    });
    
    stmt.finalize((err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`✓ Imported ${records.length} skill-to-skill relations`);
        resolve();
      }
    });
  });
}

// Import ISCO Groups
function importISCOGroups(db) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(DATA_DIR, 'ISCOGroups.csv');
    console.log('Importing ISCO Groups...');
    
    const csvData = fs.readFileSync(filePath, 'utf-8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    });
    
    const stmt = db.prepare(`
      INSERT INTO isco_groups (
        id, origin_uri, uuid_history, code, preferred_label,
        alt_labels, description, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    records.forEach(record => {
      stmt.run(
        record.ID,
        record.ORIGINURI,
        record.UUIDHISTORY,
        record.CODE,
        record.PREFERREDLABEL,
        record.ALTLABELS,
        record.DESCRIPTION,
        record.CREATEDAT,
        record.UPDATEDAT
      );
    });
    
    stmt.finalize((err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`✓ Imported ${records.length} ISCO groups`);
        resolve();
      }
    });
  });
}

// Import Occupations
function importOccupations(db) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(DATA_DIR, 'occupations.csv');
    console.log('Importing Occupations...');
    
    const csvData = fs.readFileSync(filePath, 'utf-8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    });
    
    const stmt = db.prepare(`
      INSERT INTO occupations (
        id, origin_uri, uuid_history, isco_group_code, code,
        preferred_label, alt_labels, description, definition,
        scope_note, regulated_profession_note, occupation_type,
        is_localized, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    records.forEach(record => {
      stmt.run(
        record.ID,
        record.ORIGINURI,
        record.UUIDHISTORY,
        record.ISCOGROUPCODE,
        record.CODE,
        record.PREFERREDLABEL,
        record.ALTLABELS,
        record.DESCRIPTION,
        record.DEFINITION,
        record.SCOPENOTE,
        record.REGULATEDPROFESSIONNOTE,
        record.OCCUPATIONTYPE,
        parseBoolean(record.ISLOCALIZED) ? 1 : 0,
        record.CREATEDAT,
        record.UPDATEDAT
      );
    });
    
    stmt.finalize((err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`✓ Imported ${records.length} occupations`);
        resolve();
      }
    });
  });
}

// Import Occupation Hierarchy
function importOccupationHierarchy(db) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(DATA_DIR, 'occupations_hierarchy.csv');
    console.log('Importing Occupation Hierarchy...');
    
    const csvData = fs.readFileSync(filePath, 'utf-8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    });
    
    const stmt = db.prepare(`
      INSERT INTO occupation_hierarchy (
        parent_object_type, parent_id, child_id, child_object_type,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    records.forEach(record => {
      stmt.run(
        record.PARENTOBJECTTYPE,
        record.PARENTID,
        record.CHILDID,
        record.CHILDOBJECTTYPE,
        record.CREATEDAT,
        record.UPDATEDAT
      );
    });
    
    stmt.finalize((err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`✓ Imported ${records.length} occupation hierarchy relations`);
        resolve();
      }
    });
  });
}

// Import Occupation to Skill Relations
function importOccupationSkillRelations(db) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(DATA_DIR, 'occupation_skill_relations.csv');
    console.log('Importing Occupation-to-Skill Relations...');
    
    const csvData = fs.readFileSync(filePath, 'utf-8');
    const records = parse(csvData, {
      columns: true,
      skip_empty_lines: true,
      bom: true
    });
    
    const stmt = db.prepare(`
      INSERT INTO occupation_skill_relations (
        occupation_type, occupation_id, relation_type, skill_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    records.forEach(record => {
      stmt.run(
        record.OCCUPATIONTYPE,
        record.OCCUPATIONID,
        record.RELATIONTYPE,
        record.SKILLID,
        record.CREATEDAT,
        record.UPDATEDAT
      );
    });
    
    stmt.finalize((err) => {
      if (err) {
        reject(err);
      } else {
        console.log(`✓ Imported ${records.length} occupation-to-skill relations`);
        resolve();
      }
    });
  });
}

// Create indexes for better query performance
function createIndexes(db) {
  return new Promise((resolve, reject) => {
    console.log('Creating indexes...');
    
    db.serialize(() => {
      db.run('CREATE INDEX idx_skills_type ON skills(skill_type)');
      db.run('CREATE INDEX idx_skills_reuse ON skills(reuse_level)');
      db.run('CREATE INDEX idx_occupations_type ON occupations(occupation_type)');
      db.run('CREATE INDEX idx_occupations_isco ON occupations(isco_group_code)');
      db.run('CREATE INDEX idx_occ_skill_rel_occ ON occupation_skill_relations(occupation_id)');
      db.run('CREATE INDEX idx_occ_skill_rel_skill ON occupation_skill_relations(skill_id)');
      db.run('CREATE INDEX idx_skill_hierarchy_parent ON skill_hierarchy(parent_id)');
      db.run('CREATE INDEX idx_skill_hierarchy_child ON skill_hierarchy(child_id)');
      db.run('CREATE INDEX idx_occ_hierarchy_parent ON occupation_hierarchy(parent_id)');
      db.run('CREATE INDEX idx_occ_hierarchy_child ON occupation_hierarchy(child_id)', (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('✓ Created indexes');
          resolve();
        }
      });
    });
  });
}

// Main import function
async function importData() {
  try {
    console.log('Starting ESCO data import...\n');
    
    const db = await createDatabase();
    
    // Import all data
    await importSkillGroups(db);
    await importSkills(db);
    await importSkillHierarchy(db);
    await importSkillSkillRelations(db);
    await importISCOGroups(db);
    await importOccupations(db);
    await importOccupationHierarchy(db);
    await importOccupationSkillRelations(db);
    
    // Create indexes
    await createIndexes(db);
    
    console.log('\n✓ Import completed successfully!');
    console.log(`Database created at: ${DB_PATH}`);
    
    db.close();
  } catch (error) {
    console.error('Error during import:', error);
    process.exit(1);
  }
}

// Run import
importData();
