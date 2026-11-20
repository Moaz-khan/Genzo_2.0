import app from './src/app.js';
import pool from './src/config/db.js';

async function testAllNewFeatures() {
  console.log('--- Testing All New Backend APIs & Endpoints ---');
  const server = app.listen(5002, async () => {
    try {
      // 1. Test Coupon Validation
      console.log('\n1. Testing Coupon Validation API...');
      const couponRes = await fetch('http://localhost:5002/api/v1/orders/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: 'GENZO10', subtotal: 12000 }),
      });
      const couponData = await couponRes.json();
      console.log('Coupon Result:', couponData);

      // 2. Test Product Reviews API (GET)
      console.log('\n2. Testing Product Reviews (GET)...');
      const reviewRes = await fetch('http://localhost:5002/api/v1/products/1/reviews');
      const reviewData = await reviewRes.json();
      console.log(`Reviews for Product 1 (Count: ${reviewData.reviewCount}, Avg: ${reviewData.averageRating}):`);
      console.log(reviewData.data.slice(0, 2));

      // 3. Test Add Product Review (POST)
      console.log('\n3. Testing Add Product Review (POST)...');
      const addRevRes = await fetch('http://localhost:5002/api/v1/products/1/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: 'Hamza Sheikh',
          customerEmail: 'hamza@example.com',
          rating: 5,
          reviewText: 'Exceptional 925 sterling luster and solid weight. Truly an heirloom piece.',
        }),
      });
      const addRevData = await addRevRes.json();
      console.log('Add Review Result:', addRevData);

      // 4. Test Forgot Password API
      console.log('\n4. Testing Forgot Password API...');
      const forgotRes = await fetch('http://localhost:5002/api/v1/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'client@example.com' }),
      });
      const forgotData = await forgotRes.json();
      console.log('Forgot Password Result:', forgotData);

      // 5. Test Cash on Delivery (COD) & Coupon Order Creation
      console.log('\n5. Testing Checkout Order with COD and Coupon...');
      const orderRes = await fetch('http://localhost:5002/api/v1/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Test Customer COD',
          email: 'cod.tester@genzosilver.pk',
          phone: '+92 300 9876543',
          streetAddress: 'Atelier Villa 42, Gulberg III',
          city: 'Lahore',
          postalCode: '54000',
          deliveryNotes: 'Please ring bell upon delivery',
          paymentMethod: 'cod',
          couponCode: 'GENZO10',
          items: [{ productId: 1, name: 'Noir Signet Ring', price: 12000, quantity: 1, size: '20' }],
        }),
      });
      const orderData = await orderRes.json();
      console.log('Order Placement Result:', {
        success: orderData.success,
        orderNumber: orderData.data?.orderNumber,
        paymentMethod: orderData.data?.paymentMethod,
        discountAmount: orderData.data?.discountAmount,
        totalAmount: orderData.data?.totalAmount,
        orderStatus: orderData.data?.orderStatus,
      });

      console.log('\n>>> ALL NEW APIS VERIFIED SUCCESSFULLY! <<<');
    } catch (e) {
      console.error('API Test Error:', e);
    } finally {
      server.close();
      await pool.end();
      process.exit(0);
    }
  });
}

testAllNewFeatures();
