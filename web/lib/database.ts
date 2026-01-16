// Auto-detect environment and use appropriate database
if (process.env.DB_SECRET_ARN || process.env.DB_HOST) {
  // Production (Aurora) or local PostgreSQL
  export * from './database-postgres';
} else {
  // Local development with SQLite
  export * from './database-sqlite';
}
