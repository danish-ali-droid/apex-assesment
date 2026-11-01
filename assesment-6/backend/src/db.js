const { Pool } = require('pg');

const isProduction = process.env.NODE_ENV === 'production';

// Configuration supporting either standard PG env variables or RDS Secrets Manager format
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'librarydb',
  max: parseInt(process.env.DB_POOL_MAX || '10', 10),
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
};

// Enable SSL when in production or when explicitly configured for AWS RDS
if (process.env.DB_SSL === 'true' || isProduction) {
  poolConfig.ssl = {
    rejectUnauthorized: false, // For AWS RDS default certificate bundle
  };
}

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('[DB] Unexpected error on idle client:', err.message);
});

/**
 * Initializes Library database schema with retry logic for container orchestrators (ECS / Docker Compose)
 */
async function initializeDatabase(retries = 10, delayMs = 3000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[DB] Attempting connection to Library database (${poolConfig.host}:${poolConfig.port}). Attempt ${attempt}/${retries}...`);
      const client = await pool.connect();

      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS books (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            author VARCHAR(255) NOT NULL,
            isbn VARCHAR(50) UNIQUE NOT NULL,
            genre VARCHAR(100) DEFAULT 'General',
            published_year INT,
            status VARCHAR(50) DEFAULT 'Available',
            borrower_name VARCHAR(255),
            borrowed_at TIMESTAMP WITH TIME ZONE,
            tier_source VARCHAR(50) DEFAULT 'AWS ECS Fargate',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `);

        // Check if sample books exist; if not, seed initial library collection
        const countRes = await client.query('SELECT COUNT(*) FROM books');
        if (parseInt(countRes.rows[0].count, 10) === 0) {
          await client.query(`
            INSERT INTO books (title, author, isbn, genre, published_year, status, borrower_name, borrowed_at, tier_source)
            VALUES 
              ('Designing Data-Intensive Applications', 'Martin Kleppmann', '978-1449373320', 'Technology', 2017, 'Available', NULL, NULL, 'Tier 3 RDS Seed'),
              ('Clean Code: A Handbook of Agile Software Craftsmanship', 'Robert C. Martin', '978-0132350884', 'Technology', 2008, 'Borrowed', 'Alice Vance', CURRENT_TIMESTAMP - INTERVAL '3 days', 'Tier 3 RDS Seed'),
              ('The Pragmatic Programmer', 'Andrew Hunt & David Thomas', '978-0135957059', 'Software Engineering', 2019, 'Available', NULL, NULL, 'Tier 3 RDS Seed'),
              ('Site Reliability Engineering', 'Betsy Beyer & Niall Murphy', '978-1491929124', 'Cloud DevOps', 2016, 'Available', NULL, NULL, 'Tier 3 RDS Seed'),
              ('Dune', 'Frank Herbert', '978-0441172719', 'Science Fiction', 1965, 'Borrowed', 'Bob Jenkins', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Tier 3 RDS Seed'),
              ('Project Hail Mary', 'Andy Weir', '978-0593135204', 'Science Fiction', 2021, 'Available', NULL, NULL, 'Tier 3 RDS Seed');
          `);
          console.log('[DB] Seeded initial collection into Library database.');
        }

        console.log('[DB] Successfully connected and verified Library database schema.');
        return;
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn(`[DB] Connection attempt ${attempt} failed: ${err.message}`);
      if (attempt === retries) {
        throw new Error(`Failed to initialize Library database after ${retries} attempts: ${err.message}`);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

/**
 * Health check query for ALB / ECS container readiness
 */
async function checkHealth() {
  const start = Date.now();
  const res = await pool.query('SELECT NOW() AS now, current_database() AS db');
  const countRes = await pool.query('SELECT COUNT(*) AS total_books FROM books');
  const durationMs = Date.now() - start;
  return {
    status: 'healthy',
    connected: true,
    timestamp: res.rows[0].now,
    database: res.rows[0].db,
    totalBooks: parseInt(countRes.rows[0].total_books, 10),
    latencyMs: durationMs,
  };
}

module.exports = {
  pool,
  initializeDatabase,
  checkHealth,
};
