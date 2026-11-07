import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Add the Neon PostgreSQL connection string to .env');
}

const pool = new pg.Pool({
  connectionString,
  max: Number(process.env.PG_POOL_MAX) || (process.env.VERCEL ? 1 : 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 15_000,
});

pool.on('error', (err) => console.error('[db] idle client error:', err.message));

export default pool;
