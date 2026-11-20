import pool from './src/config/db.js';

async function checkUsers() {
  console.log('--- Checking Users Table in TiDB Cloud ---');
  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, role, created_at FROM users ORDER BY id DESC'
    );

    if (rows.length === 0) {
      console.log('No users found yet. Go ahead and test the Signup API via Postman or the website!');
    } else {
      console.log(`Found ${rows.length} user(s) in TiDB Cloud database:\n`);
      console.table(rows);
    }
  } catch (error) {
    console.error('Error querying database:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

checkUsers();
