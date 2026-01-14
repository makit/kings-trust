import { Pool, PoolClient, QueryResult } from 'pg';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

let pool: Pool | null = null;
let dbConfig: any = null;

interface DatabaseCredentials {
  username: string;
  password: string;
  host: string;
  port: number;
  dbname: string;
}

async function getDbCredentials(): Promise<DatabaseCredentials> {
  if (dbConfig) return dbConfig;

  // Check if running with Secrets Manager (production)
  if (process.env.DB_SECRET_ARN) {
    const client = new SecretsManagerClient({
      region: process.env.AWS_REGION || 'eu-west-2',
    });

    const response = await client.send(
      new GetSecretValueCommand({ SecretId: process.env.DB_SECRET_ARN })
    );

    const secret = JSON.parse(response.SecretString!);
    dbConfig = {
      username: secret.username,
      password: secret.password,
      host: secret.host,
      port: secret.port || 5432,
      dbname: secret.dbname || 'kingstrust',
    };
  } else {
    // Local development
    dbConfig = {
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      dbname: process.env.DB_NAME || 'kingstrust',
    };
  }

  return dbConfig;
}

export async function getPool(): Promise<Pool> {
  if (!pool) {
    const credentials = await getDbCredentials();

    pool = new Pool({
      user: credentials.username,
      password: credentials.password,
      host: credentials.host,
      port: credentials.port,
      database: credentials.dbname,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    pool.on('error', (err) => {
      console.error('Unexpected error on idle client', err);
    });
  }

  return pool;
}

export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const pool = await getPool();
  return pool.query<T>(text, params);
}

export async function getClient(): Promise<PoolClient> {
  const pool = await getPool();
  return pool.connect();
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    dbConfig = null;
  }
}

// Helper to parse alt_labels from string to array
export function parseAltLabels(altLabels: string | null): string[] {
  if (!altLabels || altLabels.trim() === '') return [];
  return altLabels.split('\n').map(label => label.trim()).filter(label => label.length > 0);
}
