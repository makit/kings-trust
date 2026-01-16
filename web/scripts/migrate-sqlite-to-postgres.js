#!/usr/bin/env node
/**
 * Migrate ESCO data from SQLite to PostgreSQL
 * Run: node scripts/migrate-sqlite-to-postgres.js
 */

const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const path = require('path');

const SQLITE_DB = path.join(__dirname, '..', 'esco.db');
const BATCH_SIZE = 1000;

// PostgreSQL connection from environment
const pgConfig = {
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'kingstrust',
};

const TABLES = [
  'skill_groups',
  'skills',
  'skill_hierarchy',
  'skill_skill_relations',
  'isco_groups',
  'occupations',
  'occupation_hierarchy',
  'occupation_skill_relations',
];

async function getAllRows(db, tableName) {
  return new Promise((resolve, reject) => {
    db.all(`SELECT * FROM ${tableName}`, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function insertBatch(pgClient, tableName, rows) {
  if (rows.length === 0) return;

  const columns = Object.keys(rows[0]);
  const placeholders = rows.map((_, rowIdx) => {
    const rowPlaceholders = columns.map((_, colIdx) => {
      return `$${rowIdx * columns.length + colIdx + 1}`;
    });
    return `(${rowPlaceholders.join(', ')})`;
  }).join(', ');

  const values = rows.flatMap(row => columns.map(col => {
    const val = row[col];
    // Convert SQLite INTEGER to PostgreSQL BOOLEAN for is_localized
    if (col === 'is_localized' && val !== null) {
      return val === 1;
    }
    return val;
  }));

  const query = `
    INSERT INTO ${tableName} (${columns.join(', ')})
    VALUES ${placeholders}
    ON CONFLICT DO NOTHING
  `;

  await pgClient.query(query, values);
}

async function migrateTable(sqliteDb, pgClient, tableName) {
  console.log(`\nMigrating ${tableName}...`);
  
  const rows = await getAllRows(sqliteDb, tableName);
  console.log(`  Found ${rows.length} rows`);

  if (rows.length === 0) {
    console.log(`  Skipped (empty table)`);
    return;
  }

  // Insert in batches
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await insertBatch(pgClient, tableName, batch);
    console.log(`  Inserted ${Math.min(i + BATCH_SIZE, rows.length)}/${rows.length}`);
  }

  console.log(`  ✓ Completed ${tableName}`);
}

async function main() {
  console.log('=== ESCO Data Migration: SQLite → PostgreSQL ===\n');
  console.log(`Source: ${SQLITE_DB}`);
  console.log(`Target: ${pgConfig.host}:${pgConfig.port}/${pgConfig.database}\n`);

  // Connect to SQLite
  const sqliteDb = new sqlite3.Database(SQLITE_DB, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Failed to connect to SQLite:', err);
      process.exit(1);
    }
  });

  // Connect to PostgreSQL
  const pgClient = new Client(pgConfig);
  await pgClient.connect();
  console.log('✓ Connected to PostgreSQL\n');

  try {
    // Migrate each table
    for (const table of TABLES) {
      await migrateTable(sqliteDb, pgClient, table);
    }

    console.log('\n=== Migration Complete ===');
    console.log('Summary:');
    for (const table of TABLES) {
      const result = await pgClient.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`  ${table}: ${result.rows[0].count} rows`);
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  } finally {
    sqliteDb.close();
    await pgClient.end();
  }
}

main();
