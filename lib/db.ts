import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// PostgreSQL connection pool for database operations
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
});

// Execute SQL query with optional parameters and logging
export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
}

// Initialize database schema and tables
export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    // Create users table for authentication and user management
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'EMPLOYEE', -- EMPLOYEE, ADMIN, SUPER_ADMIN
        clearance_level INTEGER DEFAULT 1,
        status VARCHAR(50) DEFAULT 'ACTIVE',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create records table for financial transactions
    await client.query(`
      CREATE TABLE IF NOT EXISTS records (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(50) NOT NULL, -- 'INCOME' or 'EXPENSE'
        amount DECIMAL(12, 2) NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'PENDING', -- PENDING, APPROVED, DENIED
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create receipts table for file attachments
    await client.query(`
      CREATE TABLE IF NOT EXISTS receipts (
        id SERIAL PRIMARY KEY,
        record_id INTEGER REFERENCES records(id) ON DELETE CASCADE,
        file_url TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS job_titles (
          id SERIAL PRIMARY KEY,
          title VARCHAR(100) UNIQUE NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_titles (
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title_id INTEGER REFERENCES job_titles(id) ON DELETE CASCADE,
          PRIMARY KEY (user_id, title_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS system_logs (
          id SERIAL PRIMARY KEY,
          actor_id INTEGER REFERENCES users(id),
          target_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          record_id INTEGER REFERENCES records(id) ON DELETE SET NULL,
          action VARCHAR(255) NOT NULL,
          details TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS notifications (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          read_status BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS config (
          key VARCHAR(100) PRIMARY KEY,
          value JSONB NOT NULL
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS cloudinary_files (
          id SERIAL PRIMARY KEY,
          public_id VARCHAR(255) UNIQUE NOT NULL,
          media_url TEXT NOT NULL,
          resource_type VARCHAR(100) NOT NULL,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          record_id INTEGER REFERENCES records(id) ON DELETE CASCADE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // @sym:initDb: Bootstrap default config if empty
    const checkConfig = await client.query("SELECT key FROM config WHERE key = 'max_request_level_1'");
    if (checkConfig.rowCount === 0) {
       await client.query("INSERT INTO config (key, value) VALUES ('max_request_level_1', '500000')");
       await client.query("INSERT INTO config (key, value) VALUES ('max_request_level_2', '2000000')");
       await client.query("INSERT INTO config (key, value) VALUES ('max_request_level_3', '10000000')");
    }

    // Bootstrap Super Admin if not exists
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@dira.inc';
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'admin_dira';
    
    const res = await client.query('SELECT id FROM users WHERE email = $1', [superAdminEmail]);
    if (res.rowCount === 0) {
      const hash = await bcrypt.hash(superAdminPassword, 10);
      await client.query(`
        INSERT INTO users (name, email, password_hash, role, clearance_level)
        VALUES ($1, $2, $3, 'SUPER_ADMIN', 3)
      `, ['Dira Admin', superAdminEmail, hash]);
      console.log('Super Admin account created.');
    }

    await client.query('COMMIT');
    console.log('Database schema initialization verified.');
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('Failed to initialize database:', e);
    // don't throw to prevent unhandled rejection loop on server start if DB isn't up
  } finally {
    client.release();
  }
}
