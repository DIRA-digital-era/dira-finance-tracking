const { Client } = require('pg');
const c = new Client({ connectionString: 'postgres://postgres:theslowpoke@localhost:5432/postgres' });
c.connect()
.then(() => c.query('CREATE DATABASE "Dira-finance-tracking"'))
.then(() => { console.log('Database created'); process.exit(0); })
.catch(err => { console.error('DB Exists or Error:', err.message); process.exit(0); });
