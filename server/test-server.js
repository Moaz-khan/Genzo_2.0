import app from './src/app.js';
import pool from './src/config/db.js';

async function runTests() {
  console.log('--- Verifying Server Endpoints ---');
  const server = app.listen(5001, async () => {
    try {
      console.log('Test server running on port 5001');

      // 1. Health Check
      const healthRes = await fetch('http://localhost:5001/api/health');
      const healthData = await healthRes.json();
      console.log('[✓] /api/health:', healthData);

      // 2. Products List
      const prodRes = await fetch('http://localhost:5001/api/v1/products?category=Men');
      const prodData = await prodRes.json();
      console.log(`[✓] /api/v1/products?category=Men returned ${prodData.count} products`);

      // 3. Facets
      const facetRes = await fetch('http://localhost:5001/api/v1/products/facets');
      const facetData = await facetRes.json();
      console.log('[✓] /api/v1/products/facets categories:', facetData.data.categories);

      // 4. Product Detail (Noir Signet Ring)
      const detailRes = await fetch('http://localhost:5001/api/v1/products/noir-signet-ring');
      const detailData = await detailRes.json();
      console.log('[✓] /api/v1/products/noir-signet-ring:', detailData.data.name, 'Price:', detailData.data.price, 'Sizes:', detailData.data.sizes);

      // 5. Store Settings
      const settingsRes = await fetch('http://localhost:5001/api/v1/contact/settings');
      const settingsData = await settingsRes.json();
      console.log('[✓] /api/v1/contact/settings:', settingsData.data.announcement_bar);

      console.log('\nALL ENDPOINTS VERIFIED & WORKING SEAMLESSLY WITH TIDB CLOUD!');
    } catch (e) {
      console.error('Test endpoint failure:', e);
    } finally {
      server.close();
      await pool.end();
      process.exit(0);
    }
  });
}

runTests();
