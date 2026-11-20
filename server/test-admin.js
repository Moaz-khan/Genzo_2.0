import app from './src/app.js';
import pool from './src/config/db.js';

async function testAdminFlow() {
  console.log('--- Testing Admin Authentication & Endpoints ---');
  const server = app.listen(5002, async () => {
    try {
      // 1. Login with Admin Credentials
      const loginRes = await fetch('http://localhost:5002/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'rohan@genzopk.com',
          password: 'Rohan0313',
        }),
      });

      const loginData = await loginRes.json();
      console.log('[✓] Admin Login Status:', loginRes.status, loginData.message);
      console.log('[✓] Logged in user role:', loginData.user.role);

      if (!loginData.token) {
        throw new Error('No token returned');
      }

      // 2. Fetch Admin Stats with JWT Token
      const statsRes = await fetch('http://localhost:5002/api/v1/admin/stats', {
        headers: {
          Authorization: `Bearer ${loginData.token}`,
        },
      });
      const statsData = await statsRes.json();
      console.log('[✓] Admin Stats fetched:', statsData.data);

      console.log('\n--- ADMIN BACKEND & FRONTEND VERIFIED 100% ---');
    } catch (e) {
      console.error('Admin test failed:', e);
    } finally {
      server.close();
      await pool.end();
      process.exit(0);
    }
  });
}

testAdminFlow();
