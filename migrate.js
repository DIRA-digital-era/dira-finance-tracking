const { Client } = require('pg');
const c = new Client({ connectionString: 'postgres://postgres:theslowpoke@localhost:5432/Dira-finance-tracking' });
c.connect().then(async () => {
    await c.query(`
      CREATE TABLE IF NOT EXISTS job_titles (id SERIAL PRIMARY KEY, title VARCHAR(100) UNIQUE NOT NULL);
      CREATE TABLE IF NOT EXISTS user_titles (user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, title_id INTEGER REFERENCES job_titles(id) ON DELETE CASCADE, PRIMARY KEY (user_id, title_id));
      CREATE TABLE IF NOT EXISTS system_logs (id SERIAL PRIMARY KEY, actor_id INTEGER REFERENCES users(id), target_id INTEGER REFERENCES users(id) ON DELETE SET NULL, record_id INTEGER REFERENCES records(id) ON DELETE SET NULL, action VARCHAR(255) NOT NULL, details TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS notifications (id SERIAL PRIMARY KEY, user_id INTEGER REFERENCES users(id) ON DELETE CASCADE, title VARCHAR(255) NOT NULL, message TEXT NOT NULL, read_status BOOLEAN DEFAULT FALSE, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP);
      CREATE TABLE IF NOT EXISTS config (key VARCHAR(100) PRIMARY KEY, value JSONB NOT NULL);
      INSERT INTO config (key, value) VALUES ('max_request_level_1', '500000') ON CONFLICT DO NOTHING;
      INSERT INTO config (key, value) VALUES ('max_request_level_2', '2000000') ON CONFLICT DO NOTHING;
      INSERT INTO config (key, value) VALUES ('max_request_level_3', '10000000') ON CONFLICT DO NOTHING;
    `);
    console.log("Migration complete");
    c.end();
}).catch(console.error);
