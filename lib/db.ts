import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres',
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  console.log('executed query', { text, duration, rows: res.rowCount });
  return res;
}

export async function initDb() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
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

    await client.query(`
      CREATE TABLE IF NOT EXISTS receipts (
        id SERIAL PRIMARY KEY,
        record_id INTEGER REFERENCES records(id) ON DELETE CASCADE,
        file_url TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

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
